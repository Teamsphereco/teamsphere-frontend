const safeDate = (dateString) => {
	const parsedDate = new Date(dateString);
	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export function getDayKey(dateString) {
	const date = safeDate(dateString);
	if (!date) return "unknown-day";

	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

export function formatMessageTimestamp(dateString) {
	const date = safeDate(dateString);
	if (!date) return "";

	return new Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit",
	}).format(date);
}

export function formatDateDivider(dateString) {
	const date = safeDate(dateString);
	if (!date) return "Unknown date";

	return new Intl.DateTimeFormat("en-US", {
		weekday: "long",
		month: "short",
		day: "numeric",
		year: "numeric",
	}).format(date);
}

// Backward compatibility with existing imports.
export function extractTime(dateString) {
	return formatMessageTimestamp(dateString);
}
