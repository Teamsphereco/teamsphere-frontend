import { useEffect, useState } from 'react'
import toast from "react-hot-toast";
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
import { acceptChatRequest, declineChatRequest } from "../../utils/socialApi";
import { getChatCallHistory } from "../../utils/callApi";

export default function MessageContainer({
	onCloseChat,
	showMobileBack = false,
	chatsPanelCollapsed = false,
	onToggleChatsPanel,
}) {
	const {
		selectedConversation,
		setSelectedConversation,
		upsertConversation,
		removeConversation,
		conversationViewMode,
		setConversationViewMode,
		callEventsByChat,
		addCallTimelineEvent,
		typingUsersByChat,
		selfTypingByChat,
	} = useConversation();
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const [declineModalOpen, setDeclineModalOpen] = useState(false);
	const [requestActionLoading, setRequestActionLoading] = useState(false);
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
	const activeCallEvents = activeChatKey
		? callEventsByChat[activeChatKey] || []
		: [];
	const isSelfTyping = activeChatKey
		? !!selfTypingByChat[activeChatKey]
		: false;
	const requestPending = selectedConversation?.requestStatus === "PENDING";
	const incomingRequest = requestPending && selectedConversation?.requestIncoming;
	const blockedByCurrentUser = Boolean(selectedConversation?.blockedByCurrentUser);
	const blocksCurrentUser = Boolean(selectedConversation?.blocksCurrentUser);
	const directBlocked = blockedByCurrentUser || blocksCurrentUser || Boolean(selectedConversation?.blocked);
	const callsAllowed = !requestPending && selectedConversation?.requestStatus !== "DECLINED" && !directBlocked;
	const chatInputDisabled = selectedConversation?.requestStatus === "DECLINED" || directBlocked;

	useEffect(() => {
		if (!selectedConversation?.chatId || !token) return undefined;
		let cancelled = false;

		const hydrateCallHistory = async () => {
			try {
				const calls = await getChatCallHistory({ token, chatId: selectedConversation.chatId });
				if (cancelled || !Array.isArray(calls)) return;

				calls.forEach((call) => {
					if (call?.startedAt) {
						addCallTimelineEvent({
							...call,
							callId: call.id || call.callId,
							eventKind: "started",
							timeStamp: call.startedAt,
						});
					}
					if (call?.endedAt) {
						addCallTimelineEvent({
							...call,
							callId: call.id || call.callId,
							eventKind: "ended",
							timeStamp: call.endedAt,
						});
					}
				});
			} catch {
				// Call history is additive; message history still works if this fetch fails.
			}
		};

		void hydrateCallHistory();
		return () => {
			cancelled = true;
		};
	}, [addCallTimelineEvent, selectedConversation?.chatId, token]);

	const handleAcceptRequest = async () => {
		if (!selectedConversation?.chatId || !token) return;
		setRequestActionLoading(true);
		try {
			const payload = await acceptChatRequest({ token, chatId: selectedConversation.chatId });
			const updatedConversation = {
				...selectedConversation,
				requestStatus: "ACCEPTED",
				requestIncoming: false,
				requestedBy: payload?.requestedBy ?? selectedConversation.requestedBy,
			};
			upsertConversation(updatedConversation, { moveToTop: true });
			setSelectedConversation(updatedConversation);
			toast.success("Chat request accepted");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setRequestActionLoading(false);
		}
	};

	const handleDeclineRequest = async (blockUser = false) => {
		if (!selectedConversation?.chatId || !token) return;
		setRequestActionLoading(true);
		try {
			await declineChatRequest({ token, chatId: selectedConversation.chatId, blockUser });
			removeConversation(selectedConversation.chatId);
			setDeclineModalOpen(false);
			toast.success(blockUser ? "Request declined and user blocked" : "Chat request declined");
		} catch (error) {
			toast.error(error.message);
		} finally {
			setRequestActionLoading(false);
		}
	};

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
						<button
							type="button"
							onClick={() => setConversationViewMode(conversationViewMode === "settings" ? "messages" : "settings")}
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
								<p className='text-xs text-[#888888]'>{conversationViewMode === "settings" ? "Back to messages" : "View chat profile"}</p>
							</div>
						</button>
						</div>
						<div className="flex shrink-0 items-center gap-2">
							{callsAllowed ? <CallControls conversation={selectedConversation} /> : null}
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
							<DeclineChatRequestModal
								open={declineModalOpen}
								loading={requestActionLoading}
								onCancel={() => setDeclineModalOpen(false)}
								onDecline={() => handleDeclineRequest(false)}
								onDeclineAndBlock={() => handleDeclineRequest(true)}
							/>
						<div
							className={`flex h-full w-[200%] transition-transform duration-300 ease-out ${
								conversationViewMode === "settings" ? "-translate-x-1/2" : "translate-x-0"
							}`}
						>
							<div className="flex h-full w-1/2 flex-col">
							<CallStage conversation={selectedConversation} />
							{directBlocked ? (
								<BlockNotice blockedByCurrentUser={blockedByCurrentUser} blocksCurrentUser={blocksCurrentUser} />
							) : null}
							<Messages
								messages={messages}
								callEvents={activeCallEvents}
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
							{incomingRequest ? (
								<ChatRequestActions
									loading={requestActionLoading}
									onAccept={handleAcceptRequest}
									onDecline={() => setDeclineModalOpen(true)}
								/>
							) : (
								<ChatInput disabled={chatInputDisabled} />
							)}
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

const BlockNotice = ({ blockedByCurrentUser, blocksCurrentUser }) => {
	let title = "Messaging unavailable";
	let description = "This direct chat is blocked.";
	let aside = "";

	if (blockedByCurrentUser && blocksCurrentUser) {
		title = "You both blocked each other";
		description = "Messages and calls are unavailable until the block is removed.";
		aside = "A mutual pause has entered the chat.";
	} else if (blockedByCurrentUser) {
		title = "You blocked this person";
		description = "They cannot message or call you. You can unblock them from Settings.";
		aside = "The conversation is on your quiet list.";
	} else if (blocksCurrentUser) {
		const blockedByLines = [
			"The send button is taking a respectful step back.",
			"This chat is closed for replies right now.",
			"Your message made it to the velvet rope, not the room.",
			"The conversation door is closed, but at least the sign is clear.",
		];
		title = "You are blocked";
		description = "This person has blocked you, so messages and calls cannot be sent.";
		aside = blockedByLines[new Date().getMinutes() % blockedByLines.length];
	}

	return (
		<div className="border-b border-[#ffefcf] bg-[#fff8ea] px-4 py-3 text-sm md:px-6">
			<p className="font-semibold text-[#171717]">{title}</p>
			<p className="mt-1 text-[#4d4d4d]">{description}</p>
			{aside ? <p className="mt-1 text-xs text-[#8a5a00]">{aside}</p> : null}
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

const ChatRequestActions = ({ loading, onAccept, onDecline }) => (
	<div className="border-t border-[#ebebeb] bg-white px-4 py-4 md:px-6">
		<div className="flex flex-col gap-3 rounded-lg border border-[#ffefcf] bg-[#fff8ea] p-4 sm:flex-row sm:items-center sm:justify-between">
			<div>
				<p className="text-sm font-semibold text-[#171717]">Chat request</p>
				<p className="mt-1 text-sm text-[#4d4d4d]">Accept to reply, start calls, and keep this conversation in your chats.</p>
			</div>
			<div className="flex flex-wrap gap-2">
				<button
					type="button"
					onClick={onAccept}
					disabled={loading}
					className="inline-flex h-9 items-center rounded-md bg-[#171717] px-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
				>
					Accept
				</button>
				<button
					type="button"
					onClick={onDecline}
					disabled={loading}
					className="inline-flex h-9 items-center rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] disabled:cursor-not-allowed disabled:opacity-60"
				>
					Decline
				</button>
			</div>
		</div>
	</div>
);

const DeclineChatRequestModal = ({ open, loading, onCancel, onDecline, onDeclineAndBlock }) => {
	if (!open) return null;

	return (
		<div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
			<div className="w-full max-w-sm rounded-lg border border-[#ebebeb] bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.24)]">
				<h2 className="text-base font-semibold text-[#171717]">Decline chat request?</h2>
				<p className="mt-2 text-sm leading-6 text-[#4d4d4d]">
					This removes the request from your requested chats. You can also block the person so they cannot message or call you again.
				</p>
				<div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="inline-flex h-9 items-center justify-center rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] disabled:opacity-60"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onDecline}
						disabled={loading}
						className="inline-flex h-9 items-center justify-center rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] disabled:opacity-60"
					>
						Just decline
					</button>
					<button
						type="button"
						onClick={onDeclineAndBlock}
						disabled={loading}
						className="inline-flex h-9 items-center justify-center rounded-md bg-[#c50000] px-3 text-sm font-medium text-white transition hover:bg-[#970000] disabled:opacity-60"
					>
						Decline and block
					</button>
				</div>
			</div>
		</div>
	);
};
