/* eslint-disable react/prop-types */
import { useMemo, useState } from "react";
import AttachmentThumbnail from "./AttachmentThumbnail";
import DocumentTile from "./DocumentTile";
import AttachmentLightbox from "./AttachmentLightbox";

const MAX_TILES = 4;

// Tailwind grid templates keyed by how many media tiles we show (1..MAX_TILES).
const gridLayout = {
	1: "grid-cols-1",
	2: "grid-cols-2",
	3: "grid-cols-2",
	4: "grid-cols-2",
};

/**
 * Renders a message's attachments: a media grid (images/videos) with a "+N" overflow tile
 * opening a fullscreen carousel, plus a list of document/audio tiles. Only READY attachments
 * are shown; anything still processing or failed is skipped (the message text still renders).
 */
const AttachmentGallery = ({ attachments }) => {
	const [lightboxIndex, setLightboxIndex] = useState(null);

	const { media, docs } = useMemo(() => {
		const ready = (attachments || [])
			.filter((a) => a.status === "READY")
			.sort((a, b) => (a.ordinal ?? 0) - (b.ordinal ?? 0));
		return {
			media: ready.filter((a) => a.kind === "IMAGE" || a.kind === "VIDEO"),
			docs: ready.filter((a) => a.kind === "DOCUMENT" || a.kind === "AUDIO"),
		};
	}, [attachments]);

	if (!media.length && !docs.length) {
		return null;
	}

	const visibleMedia = media.slice(0, MAX_TILES);
	const overflow = media.length - visibleMedia.length;
	const isSingle = visibleMedia.length === 1;

	const openAt = (attachment) => {
		const idx = media.findIndex((m) => m.id === attachment.id);
		setLightboxIndex(idx >= 0 ? idx : 0);
	};

	return (
		<div className="mt-1.5 space-y-1.5" data-testid="attachment-gallery">
			{visibleMedia.length > 0 && (
				<div
					className={`grid gap-1 overflow-hidden rounded-lg ${gridLayout[visibleMedia.length]}`}
					style={{ maxWidth: isSingle ? "20rem" : "18rem" }}
				>
					{visibleMedia.map((attachment, i) => {
						const isLastWithOverflow = overflow > 0 && i === visibleMedia.length - 1;
						// 3-up: first tile spans both rows for a balanced layout.
						const spanClass =
							visibleMedia.length === 3 && i === 0 ? "row-span-2" : "";
						const aspect = isSingle ? "aspect-[4/3]" : "aspect-square";
						return (
							<div key={attachment.id} className={`relative ${spanClass}`}>
								<AttachmentThumbnail
									attachment={attachment}
									onOpen={openAt}
									className={`${aspect} w-full rounded-md`}
								/>
								{isLastWithOverflow && (
									<button
										type="button"
										onClick={() => openAt(attachment)}
										className="absolute inset-0 flex items-center justify-center rounded-md bg-black/55 text-2xl font-semibold text-white"
									>
										+{overflow}
									</button>
								)}
							</div>
						);
					})}
				</div>
			)}

			{docs.length > 0 && (
				<div className="space-y-1.5">
					{docs.map((attachment) => (
						<DocumentTile key={attachment.id} attachment={attachment} />
					))}
				</div>
			)}

			{lightboxIndex !== null && (
				<AttachmentLightbox
					items={media}
					startIndex={lightboxIndex}
					onClose={() => setLightboxIndex(null)}
				/>
			)}
		</div>
	);
};

export default AttachmentGallery;
