import useConversation from "../../zustand/useConversation";
import useProfile from "../../zustand/useProfile";
import { formatConversationTime, formatMessagePreview } from "../../utils/chatFormatting";

const Conversation = ({ conversation }) => {
	const {
		selectedConversation,
		setSelectedConversation,
		typingUsersByChat,
		selfTypingByChat,
	} = useConversation();
	const { profile } = useProfile();

	const chatId = conversation?.id ?? conversation?.chatId;
	const chatKey = String(chatId);
	const isSelected = selectedConversation?.chatId === chatId;
	const unreadCount = conversation?.unreadCount ?? 0;
	const typingUsers = typingUsersByChat[chatKey] || [];
	const memberDirectory = conversation?.memberDirectory || {};
	const otherTypingCount = typingUsers.length;
	const isSelfTyping = !!selfTypingByChat[chatKey];
	const isGroupChat = Boolean(conversation?.isGroup);
	const isMine = conversation?.lastMessage?.userId === profile?.id;
	const senderUserId = conversation?.lastMessage?.userId
		? String(conversation.lastMessage.userId)
		: null;
	const senderName = senderUserId ? memberDirectory[senderUserId] : null;
	const lastMessageContent = (conversation?.lastMessage?.content || "").trim();
	const senderLabel = isMine
		? "You"
		: isGroupChat
			? senderName || "Someone"
			: conversation?.chatName || "Someone";
	const previewContent = !lastMessageContent
		? ""
		: isMine
			? lastMessageContent
			: `${senderLabel}: ${lastMessageContent}`;
	let messagePreview = formatMessagePreview(previewContent);
	let previewClass = "text-slate-300/90";

	// Sidebar preview priority:
	// 1) other participants typing
	// 2) me typing
	// 3) last message
	if (otherTypingCount > 1) {
		messagePreview = "Several people are typing...";
		previewClass = "italic text-indigo-300";
	} else if (otherTypingCount === 1) {
		const typingUserId = String(typingUsers[0]);
		const typingName = isGroupChat
			? memberDirectory[typingUserId] || "Someone"
			: conversation?.chatName || "Someone";
		messagePreview = `${typingName} is typing...`;
		previewClass = "italic text-indigo-300";
	} else if (isSelfTyping) {
		messagePreview = "You are typing...";
		previewClass = "italic text-indigo-300";
	}
	const formattedTime = formatConversationTime(conversation?.lastMessage?.timeStamp);
	const rawMemberCount = conversation?.memberCount ?? conversation?.membersCount;
	const parsedMemberCount = Number(rawMemberCount);
	const hasMemberCount = Number.isFinite(parsedMemberCount) && parsedMemberCount > 0;
	const groupMemberCountLabel = hasMemberCount ? String(parsedMemberCount) : "—";
	const isIncomingRequest = Boolean(conversation?.requestIncoming);
	
	const handleClick = () => {
		setSelectedConversation({
			...conversation,
			chatId: conversation?.chatId ?? conversation?.id ?? chatId,
			id: conversation?.id ?? conversation?.chatId ?? chatId,
		});
	};

	return (
		<div
			data-testid={`conversation-item-${chatId}`}
			className={`group flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-3 transition ${
				isSelected
					? "bg-[#171717] text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)]"
					: "text-[#171717] hover:bg-[#fafafa]"
			}`}
			onClick={handleClick}
		>
			{conversation?.chatImage ? (
				<img className='h-10 w-10 rounded-md object-cover' src={conversation.chatImage} alt='chat avatar' />
			) : (
				<div className={`flex h-10 w-10 items-center justify-center rounded-md text-sm font-semibold ${isSelected ? "bg-white text-[#171717]" : "bg-[#f5f5f5] text-[#171717]"}`}>
					{conversation?.chatName?.charAt(0)?.toUpperCase() || "C"}
				</div>
			)}

			<div className="min-w-0 flex-1">
					<div className="mb-1 flex items-center justify-between gap-2">
						<div className="min-w-0 flex items-center gap-2">
							<h1 className={`truncate text-sm font-semibold ${isSelected ? "text-white" : "text-[#171717]"}`}>
								{conversation.chatName}
							</h1>
							{isGroupChat ? (
								<span className={`inline-flex shrink-0 items-center gap-1.5 font-mono text-[11px] ${isSelected ? "text-white/70" : "text-[#888888]"}`}>
									<svg
										viewBox="0 0 24 24"
										className="h-3.5 w-3.5 shrink-0"
										fill="none"
										stroke="currentColor"
										strokeWidth="1.8"
										aria-hidden="true"
									>
										<path d="M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
										<path d="M8 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
										<path d="M16 13c2.67 0 5 1.33 5 3v1H11v-1c0-1.67 2.33-3 5-3Z" />
										<path d="M8 15c3.33 0 6 1.67 6 4v1H2v-1c0-2.33 2.67-4 6-4Z" />
									</svg>
									{groupMemberCountLabel}
								</span>
							) : null}
						</div>
						<span className={`shrink-0 text-xs ${isSelected ? "text-white/60" : "text-[#888888]"}`}>{formattedTime}</span>
					</div>
				<p className={`truncate text-xs ${isSelected ? "text-white/70" : previewClass.replace("text-slate-300/90", "text-[#4d4d4d]").replace("text-indigo-300", "text-[#0070f3]")}`}>
					{isIncomingRequest ? "Wants to start a chat" : messagePreview}
				</p>
			</div>

			{isIncomingRequest && !isSelected ? (
				<div className="ml-1 rounded-full bg-[#fff8ea] px-2 py-1 text-[10px] font-semibold uppercase text-[#8a5a00]">
					Request
				</div>
			) : unreadCount > 0 && !isSelected ? (
				<div className="ml-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0070f3] px-1.5 text-[11px] font-semibold text-white">
					{unreadCount > 99 ? "99+" : unreadCount}
				</div>
			) : null}
		</div>
	);
};

export default Conversation;
