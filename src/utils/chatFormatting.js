const MAX_PREVIEW_LENGTH = 52;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const startOfDay = (date) =>
	new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const formatConversationTime = (timeStamp) => {
	if (!timeStamp) return "";

	const date = new Date(timeStamp);
	if (Number.isNaN(date.getTime())) return "";

	const now = new Date();
	const dayDiff = Math.floor(
		(startOfDay(now).getTime() - startOfDay(date).getTime()) / MS_PER_DAY
	);

	const isSameDay = dayDiff === 0;

	if (isSameDay) {
		return new Intl.DateTimeFormat("en-US", {
			hour: "numeric",
			minute: "2-digit",
		}).format(date);
	}

	const isYesterday = dayDiff === 1;

	if (isYesterday) {
		return "Yesterday";
	}

	if (dayDiff > 1 && dayDiff <= 7) {
		return `${dayDiff} days ago`;
	}

	return new Intl.DateTimeFormat("en-US", {
		month: "2-digit",
		day: "2-digit",
		year: "2-digit",
	}).format(date);
};

export const formatMessagePreview = (content, maxLength = MAX_PREVIEW_LENGTH) => {
	const normalized = (content || "").trim();
	if (!normalized) return "No messages yet";
	if (normalized.length <= maxLength) return normalized;
	return `${normalized.slice(0, maxLength)}...`;
};
