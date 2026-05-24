import { useEffect, useRef } from "react";
import Message from "./Message";
import { formatDateDivider, getDayKey } from "../../utils/extractTime";

const TOP_LOAD_THRESHOLD_PX = 80;

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
			className='flex-1 overflow-auto bg-[#fafafa] px-4 py-4 md:px-6'
		>
			{loadingOlder && (
				<p className='mb-3 text-center text-xs text-[#888888]'>Loading older messages...</p>
			)}
			{!loading &&
				messageRows.length > 0 &&
				messageRows.map((row) =>
					row.type === "divider" ? (
						<div key={row.id} data-testid={row.id} className='mb-4 mt-2 flex items-center gap-3'>
							<div className='h-px flex-1 bg-[#ebebeb]' />
							<span className='rounded-full border border-[#ebebeb] bg-white px-3 py-1 text-[11px] font-medium text-[#888888]'>
								{row.label}
							</span>
							<div className='h-px flex-1 bg-[#ebebeb]' />
						</div>
					) : row.type === "call" ? (
						<CallTimelineRow key={row.id} callEvent={row.callEvent} />
					) : (
						<div key={row.id} data-testid={`message-${row.id}`} className='mb-3'>
							<Message messageData={row.message} />
						</div>
					)
				)}

			{!loading && messages.length === 0 && callEvents.length === 0 && (
				<p className='mt-10 text-center text-sm text-[#888888]'>
					Send a message to start the conversation.
				</p>
			)}
			{loading && (
				<p className='mt-10 text-center text-sm text-[#888888]'>Loading messages...</p>
			)}
		</div>
	);
};

const CallTimelineRow = ({ callEvent }) => {
	const isEnded = callEvent?.eventKind === "ended";
	const callType = callEvent?.callType === "VIDEO" ? "Video" : "Audio";
	const time = formatCallTime(callEvent?.timeStamp);

	return (
		<div className="mb-4 mt-2 flex justify-center">
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
