import { useEffect } from 'react'
import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import ChatInput from '../ChatInput';
import Messages from './Messages';
import useGetMessages from '../../hooks/useGetMessages';
import useChatWebSocket from "../../hooks/useChatWebSocket";
import ChatSettingsPanel from "./ChatSettingsPanel";
import CallControls from "../Calls/CallControls";
import CallDisconnectModal from "../Calls/CallDisconnectModal";
import CallStage from "../Calls/CallStage";

export default function MessageContainer({
	onCloseChat,
	showMobileBack = false,
	chatsPanelCollapsed = false,
	onToggleChatsPanel,
}) {
	const {
		selectedConversation,
		setSelectedConversation,
		conversationViewMode,
		setConversationViewMode,
		typingUsersByChat,
		selfTypingByChat,
	} = useConversation();
    const {
		messages,
		loading,
		loadingOlder,
		hasOlderMessages,
		loadOlderMessages,
	} = useGetMessages();
    useChatWebSocket();

	const activeChatKey = selectedConversation?.chatId
		? String(selectedConversation.chatId)
		: null;
	const activeTypingUsers = activeChatKey
		? typingUsersByChat[activeChatKey] || []
		: [];
	const isSelfTyping = activeChatKey
		? !!selfTypingByChat[activeChatKey]
		: false;

    useEffect(() => {
		// cleanup function (unmounts)
		return () => setSelectedConversation(null);
	}, [setSelectedConversation]);

	return (
		<div data-testid="message-container" className='flex min-h-0 w-full flex-1 flex-col bg-white md:h-dvh'>
			{!selectedConversation ? (
				<NoChatSelected />
			) : (
				<>
					<div className='flex h-16 items-center justify-between gap-3 border-b border-[#ebebeb] bg-white px-3 py-3 md:px-5'>
						<div className="flex min-w-0 items-center gap-2">
							{showMobileBack ? (
								<button
									type="button"
									onClick={onCloseChat}
									className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#ebebeb] bg-white text-[#171717] md:hidden"
									aria-label="Back to chats"
								>
									<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
										<path d="m15 6-6 6 6 6" />
									</svg>
								</button>
							) : null}
							{onToggleChatsPanel ? (
								<button
									type="button"
									onClick={onToggleChatsPanel}
									className="hidden h-9 items-center gap-2 rounded-md border border-[#ebebeb] bg-white px-3 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1] md:inline-flex"
								>
									{chatsPanelCollapsed ? "Open chats" : "Hide chats"}
								</button>
							) : null}
						<button
							type="button"
							onClick={() => setConversationViewMode("settings")}
							className="flex min-w-0 items-center gap-3 rounded-md px-1 py-1 text-left transition hover:bg-[#fafafa]"
						>
							{selectedConversation?.chatImage ? (
								<img
									src={selectedConversation.chatImage}
									alt="chat avatar"
									className="h-10 w-10 rounded-md object-cover"
								/>
							) : (
								<div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f5f5f5] text-sm font-semibold text-[#171717]">
									{selectedConversation?.chatName?.charAt(0)?.toUpperCase() || "C"}
								</div>
							)}
							<div className="min-w-0">
								<p className='truncate text-sm font-semibold text-[#171717]'>{selectedConversation.chatName}</p>
								<p className='text-xs text-[#888888]'>View chat profile</p>
							</div>
						</button>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							<CallControls conversation={selectedConversation} />
						{conversationViewMode === "settings" ? (
							<button
								type="button"
								onClick={() => setConversationViewMode("messages")}
								className="rounded-md border border-[#ebebeb] bg-white px-3 py-1.5 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1]"
							>
								Back
							</button>
						) : (
							<button
								type="button"
								onClick={() => setConversationViewMode("settings")}
								className="hidden rounded-md border border-[#ebebeb] bg-white px-3 py-1.5 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1] sm:inline-flex"
							>
								Details
							</button>
						)}
							{onCloseChat ? (
								<button
									type="button"
									onClick={onCloseChat}
									className="hidden rounded-md border border-[#ebebeb] bg-white px-3 py-1.5 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1] md:inline-flex"
								>
									Close
								</button>
							) : null}
						</div>
					</div>

					<div className="relative min-h-0 flex-1 overflow-hidden">
						<CallDisconnectModal conversation={selectedConversation} />
						<div
							className={`flex h-full w-[200%] transition-transform duration-300 ease-out ${
								conversationViewMode === "settings" ? "-translate-x-1/2" : "translate-x-0"
							}`}
						>
							<div className="flex h-full w-1/2 flex-col">
							<CallStage conversation={selectedConversation} />
							<Messages
								messages={messages}
								loading={loading}
								loadingOlder={loadingOlder}
								hasOlderMessages={hasOlderMessages}
								loadOlderMessages={loadOlderMessages}
								selectedChatId={selectedConversation?.chatId}
							/>
							<TypingIndicator
								count={activeTypingUsers.length}
								isSelfTyping={isSelfTyping}
								chatName={selectedConversation?.chatName}
							/>
							<ChatInput />
							</div>
							<div data-testid="settings-panel" className="h-full w-1/2 border-l border-[#ebebeb] bg-[#fafafa]">
								<ChatSettingsPanel
									conversation={selectedConversation}
									onBack={() => setConversationViewMode("messages")}
								/>
							</div>
						</div>
					</div>
				</>
			)}
		</div>
	);
}

const NoChatSelected = () => {
	const { authUser } = useAuthContext();
	const displayName = authUser?.user?.username || authUser?.fullName || "there";
	return (
		<div className='flex h-full w-full items-center justify-center bg-[#fafafa] p-6'>
			<div className='flex max-w-md flex-col items-center gap-2 rounded-lg border border-[#ebebeb] bg-white px-8 py-10 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)]'>
				<p className='text-xl font-semibold text-[#171717]'>Welcome, {displayName}</p>
				<p className='text-sm text-[#4d4d4d]'>Select a chat to start messaging in realtime.</p>
			</div>
		</div>
	);
};

const TypingIndicator = ({ count, isSelfTyping, chatName }) => {
	if (!count && !isSelfTyping) {
		return <div className="h-7 px-5" />;
	}

	const label = count > 1
		? "Several people are typing"
		: count === 1
			? `${chatName || "Someone"} is typing`
			: "You are typing";

	return (
		<div data-testid="typing-indicator" className="flex items-center gap-2 px-5 py-1 text-xs italic text-[#0070f3]">
			<span>{label}</span>
			<span className="inline-flex gap-1">
				<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0070f3] [animation-delay:-0.2s]" />
				<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0070f3] [animation-delay:-0.1s]" />
				<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#0070f3]" />
			</span>
		</div>
	);
};
