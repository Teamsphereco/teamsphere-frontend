import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import {
	ATTACHMENT_FAILED_STATES,
	ATTACHMENT_READY,
	validateBatch,
	validateFile,
} from "../utils/attachmentConfig";

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

const API_HOST = import.meta.env.VITE_API_HOST;

let localIdCounter = 0;
const nextLocalId = () => `att-${Date.now()}-${localIdCounter++}`;

/**
 * Orchestrates the attachment staging tray for the active conversation:
 * validate -> reserve presigned slots -> direct PUT to storage (with progress) ->
 * complete -> poll until READY. Each item is independently retryable/removable.
 */
const useAttachmentUploads = (chatId) => {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const [items, setItems] = useState([]);
	const xhrRefs = useRef(new Map());
	const pollRefs = useRef(new Map());
	const itemsRef = useRef(items);

	useEffect(() => {
		itemsRef.current = items;
	}, [items]);

	const patchItem = useCallback((localId, patch) => {
		setItems((prev) =>
			prev.map((item) =>
				item.localId === localId
					? { ...item, ...(typeof patch === "function" ? patch(item) : patch) }
					: item
			)
		);
	}, []);

	const cleanupRefs = useCallback((localId) => {
		const xhr = xhrRefs.current.get(localId);
		if (xhr) {
			xhr.abort();
			xhrRefs.current.delete(localId);
		}
		const poll = pollRefs.current.get(localId);
		if (poll) {
			clearTimeout(poll);
			pollRefs.current.delete(localId);
		}
	}, []);

	const pollUntilReady = useCallback(
		(localId, attachmentId) => {
			const startedAt = Date.now();
			const tick = async () => {
				try {
					const res = await fetch(`${API_HOST}/api/attachments/${attachmentId}`, {
						headers: { Authorization: `Bearer ${token}` },
					});
					if (!res.ok) {
						throw new Error("status check failed");
					}
					const dto = await res.json();
					if (dto.status === ATTACHMENT_READY) {
						pollRefs.current.delete(localId);
						patchItem(localId, { status: "ready", progress: 100, dto });
						return;
					}
					if (ATTACHMENT_FAILED_STATES.includes(dto.status)) {
						pollRefs.current.delete(localId);
						patchItem(localId, {
							status: "error",
							error:
								dto.status === "INFECTED"
									? "File failed a security scan"
									: "Processing failed",
						});
						return;
					}
					if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
						pollRefs.current.delete(localId);
						patchItem(localId, { status: "error", error: "Timed out while processing" });
						return;
					}
					patchItem(localId, { status: "processing" });
					pollRefs.current.set(localId, setTimeout(tick, POLL_INTERVAL_MS));
				} catch {
					if (Date.now() - startedAt > POLL_TIMEOUT_MS) {
						pollRefs.current.delete(localId);
						patchItem(localId, { status: "error", error: "Timed out while processing" });
						return;
					}
					pollRefs.current.set(localId, setTimeout(tick, POLL_INTERVAL_MS));
				}
			};
			pollRefs.current.set(localId, setTimeout(tick, POLL_INTERVAL_MS));
		},
		[patchItem, token]
	);

	const putToStorage = useCallback(
		(localId, slot, file) =>
			new Promise((resolve, reject) => {
				const xhr = new XMLHttpRequest();
				xhrRefs.current.set(localId, xhr);
				xhr.open("PUT", slot.uploadUrl, true);
				const headers = slot.requiredHeaders || {};
				Object.entries(headers).forEach(([key, value]) => {
					xhr.setRequestHeader(key, value);
				});
				if (!headers["Content-Type"] && !headers["content-type"]) {
					xhr.setRequestHeader("Content-Type", file.type);
				}
				xhr.upload.onprogress = (event) => {
					if (event.lengthComputable) {
						const pct = Math.round((event.loaded / event.total) * 100);
						patchItem(localId, { status: "uploading", progress: pct });
					}
				};
				xhr.onload = () => {
					xhrRefs.current.delete(localId);
					if (xhr.status >= 200 && xhr.status < 300) {
						resolve();
					} else {
						reject(new Error(`Upload failed (${xhr.status})`));
					}
				};
				xhr.onerror = () => {
					xhrRefs.current.delete(localId);
					reject(new Error("Network error during upload"));
				};
				xhr.onabort = () => {
					xhrRefs.current.delete(localId);
					reject(new Error("aborted"));
				};
				xhr.send(file);
			}),
		[patchItem]
	);

	const runUpload = useCallback(
		async (localId, file) => {
			try {
				patchItem(localId, { status: "uploading", progress: 0, error: null });
				const intentRes = await fetch(`${API_HOST}/api/attachments/upload-intents`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						chatId,
						files: [
							{
								filename: file.name,
								contentType: file.type,
								sizeBytes: file.size,
							},
						],
					}),
				});
				const intentData = await intentRes.json().catch(() => null);
				if (!intentRes.ok || !intentData?.slots?.length) {
					throw new Error(intentData?.message || "Could not reserve an upload slot");
				}
				const slot = intentData.slots[0];
				patchItem(localId, { attachmentId: slot.attachmentId });

				await putToStorage(localId, slot, file);

				patchItem(localId, { status: "completing" });
				const completeRes = await fetch(
					`${API_HOST}/api/attachments/${slot.attachmentId}/complete`,
					{
						method: "POST",
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				const completeData = await completeRes.json().catch(() => null);
				if (!completeRes.ok) {
					throw new Error(completeData?.message || "Upload could not be confirmed");
				}
				if (completeData?.status === ATTACHMENT_READY) {
					patchItem(localId, { status: "ready", progress: 100, dto: completeData });
					return;
				}
				if (ATTACHMENT_FAILED_STATES.includes(completeData?.status)) {
					patchItem(localId, { status: "error", error: "File was rejected" });
					return;
				}
				patchItem(localId, { status: "processing" });
				pollUntilReady(localId, slot.attachmentId);
			} catch (error) {
				if (error.message === "aborted") {
					return;
				}
				patchItem(localId, { status: "error", error: error.message || "Upload failed" });
			}
		},
		[chatId, patchItem, pollUntilReady, putToStorage, token]
	);

	const addFiles = useCallback(
		(fileList) => {
			const files = Array.from(fileList || []);
			if (!files.length) {
				return;
			}
			if (!chatId) {
				toast.error("Select a conversation first");
				return;
			}
			const valid = [];
			files.forEach((file) => {
				const result = validateFile(file);
				if (!result.ok) {
					toast.error(result.reason);
					return;
				}
				valid.push({ file, kind: result.kind, size: file.size });
			});
			if (!valid.length) {
				return;
			}
			const existing = itemsRef.current.map((item) => ({ kind: item.kind, size: item.size }));
			const batch = validateBatch(existing, valid.map((v) => ({ kind: v.kind, size: v.size })));
			if (!batch.ok) {
				toast.error(batch.reason);
				return;
			}
			const newItems = valid.map(({ file, kind, size }) => ({
				localId: nextLocalId(),
				file,
				kind,
				size,
				name: file.name,
				status: "queued",
				progress: 0,
				attachmentId: null,
				error: null,
				dto: null,
			}));
			setItems((prev) => [...prev, ...newItems]);
			newItems.forEach((item) => runUpload(item.localId, item.file));
		},
		[chatId, runUpload]
	);

	const retryItem = useCallback(
		(localId) => {
			const item = itemsRef.current.find((entry) => entry.localId === localId);
			if (!item) {
				return;
			}
			cleanupRefs(localId);
			runUpload(localId, item.file);
		},
		[cleanupRefs, runUpload]
	);

	const removeItem = useCallback(
		(localId) => {
			cleanupRefs(localId);
			setItems((prev) => prev.filter((item) => item.localId !== localId));
		},
		[cleanupRefs]
	);

	const reset = useCallback(() => {
		itemsRef.current.forEach((item) => cleanupRefs(item.localId));
		setItems([]);
	}, [cleanupRefs]);

	// Clear and abort everything when the active conversation changes or unmounts.
	useEffect(() => {
		return () => {
			itemsRef.current.forEach((item) => cleanupRefs(item.localId));
		};
	}, [cleanupRefs, chatId]);

	useEffect(() => {
		setItems([]);
	}, [chatId]);

	const hasItems = items.length > 0;
	const isUploading = items.some((item) =>
		["queued", "uploading", "completing", "processing"].includes(item.status)
	);
	const readyAttachmentIds = items
		.filter((item) => item.status === "ready" && item.attachmentId)
		.map((item) => item.attachmentId);

	return {
		items,
		hasItems,
		isUploading,
		readyAttachmentIds,
		addFiles,
		retryItem,
		removeItem,
		reset,
	};
};

export default useAttachmentUploads;
