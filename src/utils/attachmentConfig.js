// Client-side mirror of the backend `attachments` config block. The server remains the
// authority (it re-validates every upload intent and send); these values exist purely to
// give fast, friendly feedback before we ever hit the network.

export const MAX_FILES_PER_MESSAGE = 10;
export const MAX_IMAGES_PER_MESSAGE = 10;
export const MAX_VIDEOS_PER_MESSAGE = 3;
export const MAX_DOCUMENTS_PER_MESSAGE = 10;
export const MAX_TOTAL_BYTES_PER_MESSAGE = 314_572_800; // 300 MB

export const PER_FILE_MAX_BYTES = {
	IMAGE: 26_214_400, // 25 MB
	VIDEO: 262_144_000, // 250 MB
	DOCUMENT: 52_428_800, // 50 MB
	AUDIO: 52_428_800, // 50 MB
};

export const ALLOWED_CONTENT_TYPES = {
	IMAGE: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/heif"],
	VIDEO: ["video/mp4", "video/quicktime", "video/webm"],
	AUDIO: ["audio/mpeg", "audio/ogg", "audio/wav", "audio/webm", "audio/mp4"],
	DOCUMENT: [
		"application/pdf",
		"text/plain",
		"application/msword",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		"application/vnd.ms-excel",
		"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		"application/vnd.ms-powerpoint",
		"application/vnd.openxmlformats-officedocument.presentationml.presentation",
	],
};

// Terminal/working statuses returned by the backend AttachmentStatus enum.
export const ATTACHMENT_READY = "READY";
export const ATTACHMENT_FAILED_STATES = ["FAILED", "INFECTED", "TOMBSTONED"];
export const ATTACHMENT_PENDING_STATES = ["PENDING", "SCANNING", "PROCESSING"];

/** Resolve the logical attachment kind for a MIME type, or null if not allowed. */
export function resolveKind(contentType) {
	if (!contentType) {
		return null;
	}
	const normalized = contentType.toLowerCase().trim();
	for (const [kind, types] of Object.entries(ALLOWED_CONTENT_TYPES)) {
		if (types.includes(normalized)) {
			return kind;
		}
	}
	return null;
}

/** Per-file byte cap for a kind, falling back to the smallest cap. */
export function maxBytesForKind(kind) {
	return PER_FILE_MAX_BYTES[kind] ?? 5_242_880;
}

export function formatBytes(bytes) {
	if (!Number.isFinite(bytes) || bytes <= 0) {
		return "0 B";
	}
	const units = ["B", "KB", "MB", "GB"];
	const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	const value = bytes / 1024 ** exponent;
	return `${value >= 10 || exponent === 0 ? Math.round(value) : value.toFixed(1)} ${units[exponent]}`;
}

/**
 * Validate a single candidate file against type and per-file size limits.
 * Returns { ok: true, kind } or { ok: false, reason }.
 */
export function validateFile(file) {
	const kind = resolveKind(file.type);
	if (!kind) {
		return { ok: false, reason: `${file.name}: unsupported file type` };
	}
	const cap = maxBytesForKind(kind);
	if (file.size > cap) {
		return {
			ok: false,
			reason: `${file.name} is too large (max ${formatBytes(cap)} for ${kind.toLowerCase()}s)`,
		};
	}
	if (file.size <= 0) {
		return { ok: false, reason: `${file.name} is empty` };
	}
	return { ok: true, kind };
}

/**
 * Validate that a prospective set of staged items respects the per-message caps.
 * `existingItems` already-staged entries (each with a `kind` and `size`), `incoming`
 * the validated additions ({ kind, size }). Returns { ok, reason }.
 */
export function validateBatch(existingItems, incoming) {
	const all = [...existingItems, ...incoming];
	if (all.length > MAX_FILES_PER_MESSAGE) {
		return { ok: false, reason: `You can attach at most ${MAX_FILES_PER_MESSAGE} files per message` };
	}
	const countByKind = (kind) => all.filter((item) => item.kind === kind).length;
	if (countByKind("IMAGE") > MAX_IMAGES_PER_MESSAGE) {
		return { ok: false, reason: `At most ${MAX_IMAGES_PER_MESSAGE} images per message` };
	}
	if (countByKind("VIDEO") > MAX_VIDEOS_PER_MESSAGE) {
		return { ok: false, reason: `At most ${MAX_VIDEOS_PER_MESSAGE} videos per message` };
	}
	if (countByKind("DOCUMENT") > MAX_DOCUMENTS_PER_MESSAGE) {
		return { ok: false, reason: `At most ${MAX_DOCUMENTS_PER_MESSAGE} documents per message` };
	}
	const totalBytes = all.reduce((sum, item) => sum + (item.size || 0), 0);
	if (totalBytes > MAX_TOTAL_BYTES_PER_MESSAGE) {
		return { ok: false, reason: `Total attachment size exceeds ${formatBytes(MAX_TOTAL_BYTES_PER_MESSAGE)}` };
	}
	return { ok: true };
}
