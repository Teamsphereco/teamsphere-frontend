/* eslint-disable react/prop-types */
import useAttachmentUrl from "../../hooks/useAttachmentUrl";
import { formatBytes } from "../../utils/attachmentConfig";

const kindGlyph = {
	DOCUMENT: (
		<path d="M6 2h8l4 4v15a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1zm7 1.5V7h3.5L13 3.5z" />
	),
	AUDIO: <path d="M12 3a1 1 0 011 1v9.06A4 4 0 1015 16V8h3V5h-4a1 1 0 01-1-1V4a1 1 0 011-1z" />,
};

/**
 * A non-media attachment row (document / audio). Clicking fetches a fresh signed URL and
 * opens it in a new tab — documents download or open in the browser's own viewer, they are
 * never executed in the app origin.
 */
const DocumentTile = ({ attachment }) => {
	const { loading, refresh } = useAttachmentUrl(attachment.id, "original", false);

	const open = () => {
		// Open the tab synchronously (inside the click gesture) so popup blockers allow it,
		// then navigate it to a freshly-resolved signed URL. Fetching at click time avoids
		// landing on an expired (403) URL when the chat has been open longer than the TTL.
		// We can't pass "noopener" here (it makes window.open return null, so we couldn't
		// navigate the tab) — instead we null out the opener ourselves for the same guarantee.
		const win = window.open("", "_blank");
		if (win) {
			win.opener = null;
		}
		refresh()
			.then((url) => {
				if (win) {
					win.location = url;
				} else {
					window.open(url, "_blank", "noopener,noreferrer");
				}
			})
			.catch(() => {
				if (win) {
					win.close();
				}
			});
	};

	return (
		<button
			type="button"
			onClick={open}
			disabled={loading}
			data-testid="attachment-document"
			data-kind={attachment.kind}
			className="flex w-full max-w-xs items-center gap-3 rounded-lg border border-[#ebebeb] bg-white p-2 text-left transition hover:border-[#a1a1a1]"
		>
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#171717] text-white">
				<svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					{kindGlyph[attachment.kind] || kindGlyph.DOCUMENT}
				</svg>
			</span>
			<span className="min-w-0 flex-1">
				<span className="block truncate text-sm font-medium text-[#171717]">
					{attachment.originalFilename || "Document"}
				</span>
				<span className="block text-xs text-[#888888]">
					{formatBytes(attachment.sizeBytes)}
				</span>
			</span>
			<svg className="h-4 w-4 shrink-0 text-[#888888]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
				<path strokeLinecap="round" strokeLinejoin="round" d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
			</svg>
		</button>
	);
};

export default DocumentTile;
