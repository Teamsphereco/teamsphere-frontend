/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import useAttachmentUrl from "../../hooks/useAttachmentUrl";
import { blurHashToDataUrl } from "../../utils/blurhash";

/**
 * A single image/video thumbnail tile inside the gallery. Renders the blurhash placeholder
 * immediately and lazily fetches the signed thumbnail URL once the tile scrolls into view.
 */
const AttachmentThumbnail = ({ attachment, onOpen, className = "", showDuration = true }) => {
	const containerRef = useRef(null);
	const [visible, setVisible] = useState(false);
	const [loaded, setLoaded] = useState(false);
	const { url, error } = useAttachmentUrl(attachment.id, "thumbnail", visible);

	const placeholder = useMemo(
		() => blurHashToDataUrl(attachment.placeholderHash),
		[attachment.placeholderHash]
	);

	useEffect(() => {
		const node = containerRef.current;
		if (!node || visible) {
			return undefined;
		}
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) {
					setVisible(true);
					observer.disconnect();
				}
			},
			{ rootMargin: "200px" }
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, [visible]);

	const isVideo = attachment.kind === "VIDEO";
	const duration = attachment.durationSeconds;
	const durationLabel =
		duration && duration > 0
			? `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, "0")}`
			: null;

	return (
		<button
			type="button"
			ref={containerRef}
			onClick={() => onOpen?.(attachment)}
			data-testid="attachment-thumbnail"
			data-kind={attachment.kind}
			className={`group relative overflow-hidden bg-[#ebebeb] ${className}`}
			style={{
				backgroundImage: placeholder ? `url(${placeholder})` : undefined,
				backgroundSize: "cover",
				backgroundPosition: "center",
			}}
		>
			{url && !error && (
				<img
					src={url}
					alt={attachment.originalFilename || "attachment"}
					loading="lazy"
					onLoad={() => setLoaded(true)}
					className={`h-full w-full object-cover transition-opacity duration-300 ${
						loaded ? "opacity-100" : "opacity-0"
					}`}
				/>
			)}

			{error && (
				<div className="flex h-full w-full items-center justify-center text-[11px] text-[#888888]">
					Couldn’t load
				</div>
			)}

			{isVideo && (
				<span className="pointer-events-none absolute inset-0 flex items-center justify-center">
					<span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white">
						<svg className="h-5 w-5 translate-x-0.5" viewBox="0 0 24 24" fill="currentColor">
							<path d="M8 5v14l11-7z" />
						</svg>
					</span>
				</span>
			)}

			{isVideo && showDuration && durationLabel && (
				<span className="pointer-events-none absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white">
					{durationLabel}
				</span>
			)}
		</button>
	);
};

export default AttachmentThumbnail;
