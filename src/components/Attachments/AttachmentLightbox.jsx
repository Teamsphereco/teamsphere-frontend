/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import useAttachmentUrl from "../../hooks/useAttachmentUrl";

const ViewerImage = ({ attachment }) => {
	const { url, loading, error } = useAttachmentUrl(attachment.id, "original", true);
	if (error) {
		return <div className="text-sm text-white/70">Couldn’t load image</div>;
	}
	if (loading || !url) {
		return <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
	}
	return (
		<img
			src={url}
			alt={attachment.originalFilename || "attachment"}
			className="max-h-[85vh] max-w-[90vw] object-contain"
		/>
	);
};

const ViewerVideo = ({ attachment }) => {
	const { url, loading, error } = useAttachmentUrl(attachment.id, "original", true);
	if (error) {
		return <div className="text-sm text-white/70">Couldn’t load video</div>;
	}
	if (loading || !url) {
		return <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/40 border-t-white" />;
	}
	return (
		<video
			src={url}
			controls
			autoPlay
			playsInline
			className="max-h-[85vh] max-w-[90vw] bg-black"
		>
			<track kind="captions" />
		</video>
	);
};

/**
 * Fullscreen carousel for image/video attachments. Renders into a portal, traps Escape and
 * arrow keys, and lazily resolves each item's signed URL only when it becomes the active slide.
 */
const AttachmentLightbox = ({ items, startIndex = 0, onClose }) => {
	const [index, setIndex] = useState(startIndex);

	const go = useCallback(
		(delta) => {
			setIndex((prev) => {
				const next = prev + delta;
				if (next < 0) return items.length - 1;
				if (next >= items.length) return 0;
				return next;
			});
		},
		[items.length]
	);

	useEffect(() => {
		const handler = (event) => {
			if (event.key === "Escape") {
				onClose();
			} else if (event.key === "ArrowRight") {
				go(1);
			} else if (event.key === "ArrowLeft") {
				go(-1);
			}
		};
		window.addEventListener("keydown", handler);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", handler);
			document.body.style.overflow = "";
		};
	}, [go, onClose]);

	if (!items.length) {
		return null;
	}
	const current = items[index];

	return createPortal(
		<div
			data-testid="attachment-lightbox"
			className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90"
			onClick={onClose}
		>
			<button
				type="button"
				aria-label="Close"
				onClick={onClose}
				className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
			>
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
					<path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6L6 18" />
				</svg>
			</button>

			{items.length > 1 && (
				<>
					<button
						type="button"
						aria-label="Previous"
						onClick={(e) => {
							e.stopPropagation();
							go(-1);
						}}
						className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
					>
						<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
						</svg>
					</button>
					<button
						type="button"
						aria-label="Next"
						onClick={(e) => {
							e.stopPropagation();
							go(1);
						}}
						className="absolute right-4 bottom-1/2 flex h-12 w-12 translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
					>
						<svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
						</svg>
					</button>
				</>
			)}

			<div className="flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
				{current.kind === "VIDEO" ? (
					<ViewerVideo key={current.id} attachment={current} />
				) : (
					<ViewerImage key={current.id} attachment={current} />
				)}
			</div>

			{items.length > 1 && (
				<span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
					{index + 1} / {items.length}
				</span>
			)}
		</div>,
		document.body
	);
};

export default AttachmentLightbox;
