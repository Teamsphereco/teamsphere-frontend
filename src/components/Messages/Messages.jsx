import { useEffect, useRef } from "react";
import Message from "./Message";
import { formatDateDivider, getDayKey } from "../../utils/extractTime";
import useSettings from "../../zustand/useSettings";

const TOP_LOAD_THRESHOLD_PX = 80;

const densitySpacing = {
	compact: {
		container: "px-3 py-3 md:px-4",
		message: "mb-2",
		divider: "mb-3 mt-1",
		call: "mb-3 mt-1",
	},
	comfortable: {
		container: "px-4 py-4 md:px-6",
		message: "mb-3",
		divider: "mb-4 mt-2",
		call: "mb-4 mt-2",
	},
	spacious: {
		container: "px-5 py-5 md:px-8",
		message: "mb-5",
		divider: "mb-6 mt-3",
		call: "mb-6 mt-3",
	},
};

const themeClasses = {
	dark: {
		surface: "bg-[#141414]",
		dividerLine: "bg-[#333333]",
		dividerLabel: "border-[#333333] bg-[#202020] text-[#b3b3b3]",
		muted: "text-[#b3b3b3]",
	},
	"high-contrast": {
		surface: "bg-white",
		dividerLine: "bg-black",
		dividerLabel: "border-black bg-white text-black",
		muted: "text-black",
	},
	default: {
		surface: "bg-[#fafafa]",
		dividerLine: "bg-[#ebebeb]",
		dividerLabel: "border-[#ebebeb] bg-white text-[#888888]",
		muted: "text-[#888888]",
	},
};

const Messages = ({
	messages,
	loading,
	loadingOlder,
	hasOlderMessages,
	loadOlderMessages,
	selectedChatId,
	callEvents = [],
}) => {
	const listRef = useRef(null);
	const restoreHeightRef = useRef(null);
	const stickToBottomRef = useRef(true);
	const previousChatRef = useRef(selectedChatId);
	const { settings } = useSettings();
	const density = densitySpacing[settings.chatDensity] || densitySpacing.comfortable;
	const theme = themeClasses[settings.theme] || themeClasses.default;

	useEffect(() => {
		previousChatRef.current = selectedChatId;
		stickToBottomRef.current = true;
		requestAnimationFrame(() => {
			if (!listRef.current) return;
			listRef.current.scrollTop = listRef.current.scrollHeight;
		});
	}, [selectedChatId]);

	useEffect(() => {
		if (!listRef.current) return;

		if (restoreHeightRef.current !== null) {
			const previousHeight = restoreHeightRef.current;
			restoreHeightRef.current = null;
			listRef.current.scrollTop = listRef.current.scrollHeight - previousHeight;
			return;
		}

		if (stickToBottomRef.current) {
			requestAnimationFrame(() => {
				if (!listRef.current) return;
				listRef.current.scrollTop = listRef.current.scrollHeight;
			});
		}
	}, [messages, callEvents]);

	const handleScroll = async () => {
		if (!listRef.current) return;
		const el = listRef.current;

		const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);
		stickToBottomRef.current = distanceFromBottom < 120;

		if (!hasOlderMessages || loadingOlder || loading) {
			return;
		}

		if (el.scrollTop > TOP_LOAD_THRESHOLD_PX) {
			return;
		}

		restoreHeightRef.current = el.scrollHeight;
		await loadOlderMessages();
	};

	const messageRows = [];
	let previousDayKey = null;

	const timelineItems = [
		...(Array.isArray(messages) ? messages : []).map((message) => ({ type: "message", timeStamp: message?.timeStamp, message })),
		...(Array.isArray(callEvents) ? callEvents : []).map((callEvent) => ({ type: "call", timeStamp: callEvent?.timeStamp, callEvent })),
	].sort((a, b) => {
		const timeA = Date.parse(a.timeStamp || "");
		const timeB = Date.parse(b.timeStamp || "");
		return (Number.isNaN(timeA) ? 0 : timeA) - (Number.isNaN(timeB) ? 0 : timeB);
	});

	for (const item of timelineItems) {
		const dayKey = getDayKey(item?.timeStamp);
		if (dayKey !== previousDayKey) {
			previousDayKey = dayKey;
			messageRows.push({
				type: "divider",
				id: `divider-${dayKey}`,
				label: formatDateDivider(item?.timeStamp),
			});
		}
		if (item.type === "call") {
			messageRows.push({
				type: "call",
				id: item.callEvent.id,
				callEvent: item.callEvent,
			});
		} else {
			messageRows.push({
				type: "message",
				id: item.message.id,
				message: item.message,
			});
		}
	}

	return (
		<div
			ref={listRef}
			onScroll={handleScroll}
			data-testid="messages-scroller"
			className={`flex-1 overflow-auto ${theme.surface} ${density.container}`}
		>
			{loadingOlder && (
				<p className={`mb-3 text-center text-xs ${theme.muted}`}>Loading older messages...</p>
			)}
			{!loading &&
				messageRows.length > 0 &&
				messageRows.map((row) =>
					row.type === "divider" ? (
						<div key={row.id} data-testid={row.id} className={`${density.divider} flex items-center gap-3`}>
							<div className={`h-px flex-1 ${theme.dividerLine}`} />
							<span className={`rounded-full border px-3 py-1 text-[11px] font-medium ${theme.dividerLabel}`}>
								{row.label}
							</span>
							<div className={`h-px flex-1 ${theme.dividerLine}`} />
						</div>
					) : row.type === "call" ? (
						<CallTimelineRow key={row.id} callEvent={row.callEvent} spacing={density.call} />
					) : (
						<div key={row.id} data-testid={`message-${row.id}`} className={density.message}>
							<Message messageData={row.message} />
						</div>
					)
				)}

			{!loading && messages.length === 0 && callEvents.length === 0 && (
				<p className={`mt-10 text-center text-sm ${theme.muted}`}>
					Send a message to start the conversation.
				</p>
			)}
			{loading && (
				<p className={`mt-10 text-center text-sm ${theme.muted}`}>Loading messages...</p>
			)}
		</div>
	);
};

const CallTimelineRow = ({ callEvent, spacing }) => {
	const isEnded = callEvent?.eventKind === "ended";
	const callType = callEvent?.callType === "VIDEO" ? "Video" : "Audio";
	const time = formatCallTime(callEvent?.timeStamp);

	return (
		<div className={`${spacing} flex justify-center`}>
			<div className={`inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium shadow-[0_1px_1px_rgba(0,0,0,0.03)] ${
				isEnded
					? "border-[#ebebeb] bg-white text-[#4d4d4d]"
					: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
			}`}>
				<span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px]">
					{isEnded ? "✓" : "↗"}
				</span>
				<span>{callType} call {isEnded ? "ended" : "started"}</span>
				{time ? <span className="text-[#888888]">{time}</span> : null}
			</div>
		</div>
	);
};

const formatCallTime = (timeStamp) => {
	if (!timeStamp) return "";
	const parsed = new Date(timeStamp);
	if (Number.isNaN(parsed.getTime())) return "";
	return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

export default Messages;
