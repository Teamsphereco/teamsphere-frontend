/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { formatBytes } from "../../utils/attachmentConfig";

const RING_SIZE = 40;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const kindIcon = {
	IMAGE: (
		<path d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm1.5 12.5h13l-4-5-3 3.5-2-2.5-4 4zM8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
	),
	VIDEO: <path d="M4 6h11a1 1 0 011 1v3l4-2.5v9L16 14v3a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z" />,
	AUDIO: <path d="M12 3a1 1 0 011 1v9.06A4 4 0 1015 16V8h3V5h-4a1 1 0 01-1-1V4a1 1 0 011-1z" />,
	DOCUMENT: (
		<path d="M6 2h8l4 4v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm7 1.5V7h3.5L13 3.5zM8 12h8v1.5H8V12zm0 3h8v1.5H8V15z" />
	),
};

const ProgressRing = ({ progress }) => {
	const offset = RING_CIRCUMFERENCE * (1 - Math.min(Math.max(progress, 0), 100) / 100);
	return (
		<svg width={RING_SIZE} height={RING_SIZE} className="-rotate-90" viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}>
			<circle
				cx={RING_SIZE / 2}
				cy={RING_SIZE / 2}
				r={RING_RADIUS}
				fill="none"
				stroke="rgba(255,255,255,0.35)"
				strokeWidth={RING_STROKE}
			/>
			<circle
				cx={RING_SIZE / 2}
				cy={RING_SIZE / 2}
				r={RING_RADIUS}
				fill="none"
				stroke="#ffffff"
				strokeWidth={RING_STROKE}
				strokeLinecap="round"
				strokeDasharray={RING_CIRCUMFERENCE}
				strokeDashoffset={offset}
				style={{ transition: "stroke-dashoffset 0.2s ease" }}
			/>
		</svg>
	);
};

const AttachmentChip = ({ item, onRetry, onRemove }) => {
	const [previewUrl, setPreviewUrl] = useState(null);
	const [showCheck, setShowCheck] = useState(false);

	useEffect(() => {
		if (item.kind === "IMAGE" && item.file) {
			const url = URL.createObjectURL(item.file);
			setPreviewUrl(url);
			return () => URL.revokeObjectURL(url);
		}
		return undefined;
	}, [item.file, item.kind]);

	useEffect(() => {
		if (item.status === "ready") {
			setShowCheck(true);
			const timer = setTimeout(() => setShowCheck(false), 1400);
			return () => clearTimeout(timer);
		}
		setShowCheck(false);
		return undefined;
	}, [item.status]);

	const busy = ["queued", "uploading", "completing", "processing"].includes(item.status);
	const isError = item.status === "error";
	const progress = item.status === "queued" ? 0 : item.progress;

	const statusLabel = useMemo(() => {
		switch (item.status) {
			case "queued":
				return "Waiting…";
			case "uploading":
				return `Uploading ${item.progress}%`;
			case "completing":
				return "Finishing…";
			case "processing":
				return "Processing…";
			case "ready":
				return formatBytes(item.size);
			case "error":
				return item.error || "Failed";
			default:
				return "";
		}
	}, [item.error, item.progress, item.size, item.status]);

	return (
		<div
			data-testid="attachment-chip"
			data-status={item.status}
			className="relative flex w-44 shrink-0 items-center gap-2 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-2"
		>
			<div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md bg-[#171717] text-white">
				{previewUrl ? (
					<img src={previewUrl} alt={item.name} className="h-full w-full object-cover" />
				) : (
					<svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
						{kindIcon[item.kind] || kindIcon.DOCUMENT}
					</svg>
				)}

				{busy && (
					<div className="absolute inset-0 flex items-center justify-center bg-black/45">
						<ProgressRing progress={progress} />
					</div>
				)}

				{showCheck && (
					<div className="absolute inset-0 flex items-center justify-center bg-emerald-500/85 transition-opacity duration-500">
						<svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
				)}

				{isError && (
					<div className="absolute inset-0 flex items-center justify-center bg-rose-600/85">
						<svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z" />
						</svg>
					</div>
				)}
			</div>

			<div className="min-w-0 flex-1">
				<p className="truncate text-xs font-medium text-[#171717]" title={item.name}>
					{item.name}
				</p>
				<p className={`truncate text-[11px] ${isError ? "text-rose-600" : "text-[#888888]"}`}>
					{statusLabel}
				</p>
				{isError && (
					<button
						type="button"
						onClick={() => onRetry(item.localId)}
						className="mt-0.5 text-[11px] font-semibold text-[#171717] underline hover:text-[#4d4d4d]"
					>
						Retry
					</button>
				)}
			</div>

			<button
				type="button"
				aria-label={`Remove ${item.name}`}
				onClick={() => onRemove(item.localId)}
				className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#171717] text-white shadow hover:bg-[#4d4d4d]"
			>
				<svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
				</svg>
			</button>
		</div>
	);
};

const AttachmentStagingTray = ({ items, onRetry, onRemove }) => {
	if (!items.length) {
		return null;
	}
	return (
		<div
			data-testid="attachment-tray"
			className="flex gap-2 overflow-x-auto border-b border-[#ebebeb] px-1 pb-3 pt-1"
		>
			{items.map((item) => (
				<AttachmentChip key={item.localId} item={item} onRetry={onRetry} onRemove={onRemove} />
			))}
		</div>
	);
};

export default AttachmentStagingTray;
