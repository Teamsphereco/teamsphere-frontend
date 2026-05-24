import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import ImageCropModal from "../ImageCropModal";
import useCreateGroupChat from "../../hooks/useCreateGroupChat";
import useProfile from "../../zustand/useProfile";
import { getFriends } from "../../utils/socialApi";

const STEPS = {
	DETAILS: 1,
	REVIEW: 2,
};

const initialDraft = {
	groupName: "",
	groupDescription: "",
};
const MAX_GROUP_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function CreateGroupChatFlow({ open, onClose }) {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const { profile } = useProfile();
	const { creatingGroup, createGroupChat } = useCreateGroupChat();

	const [step, setStep] = useState(STEPS.DETAILS);
	const [query, setQuery] = useState("");
	const [loadingSearch, setLoadingSearch] = useState(false);
	const [searchError, setSearchError] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [friends, setFriends] = useState([]);
	const [selectedMembers, setSelectedMembers] = useState([]);
	const [draft, setDraft] = useState(initialDraft);
	const [groupImageFile, setGroupImageFile] = useState(null);
	const [groupImagePreviewUrl, setGroupImagePreviewUrl] = useState("");
	const [cropSourceFile, setCropSourceFile] = useState(null);
	const [cropOpen, setCropOpen] = useState(false);

	const selectedMemberIds = useMemo(
		() => new Set(selectedMembers.map((user) => String(user.id))),
		[selectedMembers]
	);

	const canGoToReview = draft.groupName.trim().length > 1 && selectedMembers.length >= 2;

	useEffect(() => {
		if (!open) return;
		setStep(STEPS.DETAILS);
		setQuery("");
		setSearchError("");
		setSearchResults([]);
		setSelectedMembers([]);
		setDraft(initialDraft);
		setGroupImageFile(null);
		setGroupImagePreviewUrl("");
		setCropSourceFile(null);
		setCropOpen(false);
	}, [open]);

	useEffect(() => {
		if (!open || !token) return undefined;
		let cancelled = false;

		const loadFriends = async () => {
			try {
				const payload = await getFriends({ token });
				if (!cancelled) {
					setFriends(Array.isArray(payload) ? payload : []);
				}
			} catch {
				if (!cancelled) {
					setFriends([]);
				}
			}
		};

		void loadFriends();
		return () => {
			cancelled = true;
		};
	}, [open, token]);

	useEffect(() => {
		if (!groupImageFile) {
			setGroupImagePreviewUrl("");
			return undefined;
		}
		const previewUrl = URL.createObjectURL(groupImageFile);
		setGroupImagePreviewUrl(previewUrl);
		return () => URL.revokeObjectURL(previewUrl);
	}, [groupImageFile]);

	useEffect(() => {
		if (!open || !token) return undefined;
		if (query.trim().length < 2) {
			setSearchResults([]);
			setSearchError("");
			return undefined;
		}

		const timeoutId = setTimeout(() => {
			setLoadingSearch(true);
			setSearchError("");
			const normalizedQuery = query.trim().toLowerCase();
			const filtered = friends.filter((user) => {
				if (String(user?.id) === String(profile?.id)) return false;
				const searchable = `${user?.username || ""} ${user?.nickname || ""}`.toLowerCase();
				return searchable.includes(normalizedQuery);
			});
			setSearchResults(filtered);
			setLoadingSearch(false);
		}, 260);

		return () => clearTimeout(timeoutId);
	}, [friends, open, profile?.id, query, token]);

	const toggleMember = (user) => {
		if (!user?.id) return;
		setSelectedMembers((current) => {
			if (current.some((item) => String(item.id) === String(user.id))) {
				return current.filter((item) => String(item.id) !== String(user.id));
			}
			return [...current, user];
		});
	};

	const handleGroupImageFileChange = (event) => {
		const file = event?.target?.files?.[0] || null;
		if (!file) {
			setGroupImageFile(null);
			return;
		}

		if (!file.type?.startsWith("image/")) {
			toast.error("Please upload an image file");
			event.target.value = "";
			return;
		}

		if (file.size > MAX_GROUP_IMAGE_SIZE_BYTES) {
			toast.error("Group image must be under 10MB");
			event.target.value = "";
			return;
		}

		setCropSourceFile(file);
		setCropOpen(true);
		event.target.value = "";
	};

	const closeCropper = () => {
		setCropOpen(false);
		setCropSourceFile(null);
	};

	const handleApplyCrop = (croppedFile) => {
		setGroupImageFile(croppedFile);
		closeCropper();
	};

	const handleCreate = async () => {
		const payload = await createGroupChat({
			chatName: draft.groupName.trim(),
			chatImageFile: groupImageFile,
			description: draft.groupDescription,
			userIds: selectedMembers.map((user) => user.id),
		});
		if (payload) {
			onClose?.();
		}
	};

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[95] flex items-end justify-center bg-slate-950/70 p-3 backdrop-blur-sm md:items-center md:p-6">
			<button
				type="button"
				onClick={onClose}
				className="absolute inset-0"
				aria-label="Close create group flow"
			/>
			<div className="relative z-[1] flex h-[86dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-slate-700/80 bg-slate-900 shadow-2xl shadow-black/60">
				<div className="border-b border-slate-700/70 px-5 py-4">
					<p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
						Create Group
					</p>
					<h2 className="mt-1 text-xl font-semibold text-slate-100">
						{step === STEPS.DETAILS ? "Group details" : "Review and create"}
					</h2>
					<p className="mt-1 text-sm text-slate-400">
						Step {step} of 2
					</p>
				</div>

				<div className="scrollbar-thin flex-1 overflow-y-auto px-5 py-4">
					{step === STEPS.DETAILS ? (
						<div className="space-y-6">
							<div className="flex flex-col items-center">
								<label
									htmlFor="group-photo-upload"
									className="group relative block cursor-pointer"
								>
									<div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-800 text-2xl font-semibold text-slate-200 transition group-hover:border-cyan-400">
										{groupImagePreviewUrl ? (
											<img
												src={groupImagePreviewUrl}
												alt="Group preview"
												className="h-full w-full object-cover"
											/>
										) : (
											(draft.groupName.trim().charAt(0) || "G").toUpperCase()
										)}
									</div>
									<span className="absolute -right-1 -bottom-1 rounded-full border border-slate-700 bg-cyan-500 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-900">
										Edit
									</span>
								</label>
								<input
									id="group-photo-upload"
									type="file"
									accept="image/*"
									onChange={handleGroupImageFileChange}
									className="hidden"
								/>
								<p className="mt-3 text-xs text-slate-400">Upload group photo (optional)</p>
								{groupImageFile ? (
									<p className="mt-1 text-xs text-emerald-300">{groupImageFile.name}</p>
								) : null}
							</div>

							<div>
								<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
									Group name
								</label>
								<input
									type="text"
									value={draft.groupName}
									onChange={(event) =>
										setDraft((current) => ({ ...current, groupName: event.target.value }))
									}
									placeholder="e.g. Product Launch Team"
									className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
								/>
							</div>
							<div>
								<label className="mb-2 block text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
									Description (optional)
								</label>
								<textarea
									value={draft.groupDescription}
									onChange={(event) =>
										setDraft((current) => ({ ...current, groupDescription: event.target.value }))
									}
									rows={3}
									placeholder="What is this group for?"
									className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
								/>
							</div>

							<div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-3">
								<div className="mb-2 flex items-center justify-between">
									<p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
										Add members
									</p>
									<p className="text-[11px] text-slate-400">{selectedMembers.length} selected</p>
								</div>
								<input
									type="search"
									value={query}
									onChange={(event) => setQuery(event.target.value)}
									placeholder="Search people by name"
									className="w-full rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-cyan-400 focus:outline-none"
								/>
								<p className="mt-2 text-xs text-slate-400">
									Select at least 2 people to form a group chat.
								</p>

								<div className="mt-3 min-h-8">
									{selectedMembers.length > 0 ? (
										<div className="flex flex-wrap gap-2">
											{selectedMembers.map((member) => (
												<button
													key={member.id}
													type="button"
													onClick={() => toggleMember(member)}
													className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200 transition hover:border-cyan-300"
												>
													{member.username} ×
												</button>
											))}
										</div>
									) : (
										<p className="text-xs text-slate-500">No members selected yet.</p>
									)}
								</div>

								<div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
									{loadingSearch ? (
										<p className="text-xs text-slate-400">Searching users...</p>
									) : searchError ? (
										<p className="text-xs text-red-300">{searchError}</p>
									) : query.trim().length < 2 ? (
										<p className="text-xs text-slate-500">Type at least 2 characters to search.</p>
									) : searchResults.length === 0 ? (
										<p className="text-xs text-slate-500">No friends found.</p>
									) : (
										searchResults.map((user) => {
											const selected = selectedMemberIds.has(String(user.id));
											return (
												<button
													type="button"
													key={user.id}
													onClick={() => toggleMember(user)}
													className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition ${
														selected
															? "border-emerald-500/40 bg-emerald-500/10"
															: "border-slate-700 bg-slate-800/70 hover:border-slate-500"
													}`}
												>
													<div className="min-w-0">
														<p className="truncate text-sm font-semibold text-slate-100">{user.nickname || user.username}</p>
														<p className="truncate text-xs text-slate-400">@{user.username}</p>
													</div>
													<span className={`rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
														selected ? "bg-emerald-500 text-slate-900" : "bg-cyan-500 text-slate-900"
													}`}>
														{selected ? "Selected" : "Add"}
													</span>
												</button>
											);
										})
									)}
								</div>
							</div>
						</div>
					) : null}

					{step === STEPS.REVIEW ? (
						<div className="space-y-4">
							<div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-4">
								<div className="flex items-center gap-3">
									<div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-600 bg-slate-700 text-lg font-semibold text-slate-100">
										{groupImagePreviewUrl ? (
											<img src={groupImagePreviewUrl} alt="Group preview" className="h-full w-full object-cover" />
										) : (
											(draft.groupName.trim().charAt(0) || "G").toUpperCase()
										)}
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm font-semibold text-slate-100">{draft.groupName.trim()}</p>
										<p className="mt-1 text-xs text-slate-400">
											{selectedMembers.length} members selected
										</p>
									</div>
								</div>
								{draft.groupDescription.trim() ? (
									<p className="mt-3 text-sm text-slate-300">{draft.groupDescription.trim()}</p>
								) : null}
							</div>
							<div>
								<p className="mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-300">
									Members
								</p>
								<div className="space-y-2">
									{selectedMembers.map((member) => (
										<div
											key={member.id}
											className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2"
										>
											<p className="text-sm font-medium text-slate-100">{member.nickname || member.username}</p>
											<p className="text-xs text-slate-400">@{member.username}</p>
										</div>
									))}
								</div>
							</div>
						</div>
					) : null}
				</div>

				<div className="flex items-center justify-between border-t border-slate-700/70 px-5 py-4">
					<button
						type="button"
						onClick={() => {
							if (step === STEPS.DETAILS) {
								onClose?.();
								return;
							}
							setStep(STEPS.DETAILS);
						}}
						className="rounded-xl border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400"
					>
						{step === STEPS.DETAILS ? "Cancel" : "Back"}
					</button>
					{step < STEPS.REVIEW ? (
						<button
							type="button"
							onClick={() => setStep(STEPS.REVIEW)}
							disabled={!canGoToReview}
							className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
						>
							Review
						</button>
					) : (
						<button
							type="button"
							onClick={handleCreate}
							disabled={creatingGroup}
							className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{creatingGroup ? "Creating..." : "Create group"}
						</button>
					)}
				</div>
			</div>

			<ImageCropModal
				open={cropOpen}
				sourceFile={cropSourceFile}
				title="Crop group photo"
				onCancel={closeCropper}
				onApply={handleApplyCrop}
			/>
		</div>
	);
}

export default CreateGroupChatFlow;
