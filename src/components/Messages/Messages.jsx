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
	}, [messages]);

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

	for (const message of messages) {
		const dayKey = getDayKey(message?.timeStamp);
		if (dayKey !== previousDayKey) {
			previousDayKey = dayKey;
			messageRows.push({
				type: "divider",
				id: `divider-${dayKey}`,
				label: formatDateDivider(message?.timeStamp),
			});
		}
		messageRows.push({
			type: "message",
			id: message.id,
			message,
		});
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
					) : (
						<div key={row.id} data-testid={`message-${row.id}`} className='mb-3'>
							<Message messageData={row.message} />
						</div>
					)
				)}

			{!loading && messages.length === 0 && (
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

export default Messages;
