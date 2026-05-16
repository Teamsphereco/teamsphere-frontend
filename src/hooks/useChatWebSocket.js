import { useCallback, useEffect, useRef } from "react";
import { createElement } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client/dist/sockjs";
import toast from "react-hot-toast";
import useConversation from "../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
import { formatMessagePreview } from "../utils/chatFormatting";
import useCallStore from "../zustand/useCallStore";

const WS_DESTINATIONS = {
	send: "/app/chat.send",
	typing: "/app/chat.typing",
	chatEventsQueue: "/user/queue/chat.events",
	callEventsQueue: "/user/queue/call.events",
	errorQueue: "/user/queue/errors",
};

const TYPING_TTL_MS = 4500;
const SUMMARY_PAGE_SIZE = 100;
const SUMMARY_MAX_PAGES = 5;
const INCOMING_TOAST_DURATION_MS = 5200;
const INCOMING_TOAST_STACK_SIZE = 3;
const INCOMING_TOAST_CLEANUP_BUFFER_MS = 1200;
const INCOMING_CARD_Y_OFFSET = 12;
const INCOMING_CARD_SCALE_STEP = 0.03;
const INCOMING_CARD_STACK_WIDTH = 344;
const INCOMING_CARD_EXIT_STAGGER_MS = 80;
const INCOMING_TOAST_REMOVE_DELAY_MS = 900;

const buildWebSocketBaseUrl = () => {
	if (import.meta.env.VITE_API_HOST) {
		return import.meta.env.VITE_API_HOST;
	}
	return "http://localhost:5454";
};

const formatNotificationTime = (timeStamp) => {
	if (!timeStamp) return "now";
	const parsed = new Date(timeStamp);
	if (Number.isNaN(parsed.getTime())) return "now";
	return parsed.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};

const useChatWebSocket = () => {
	const { authUser } = useAuthContext();
	const currentUserId = authUser?.user?.id;
	const token = authUser?.jwt;
	const {
		conversations,
		selectedConversation,
		setMessages,
		updateConversationFromMessage,
		setTypingState,
		upsertConversation,
		removeConversation,
		setWebsocketConnected,
		setSendWebsocketMessage,
		setSendWebsocketTyping,
	} = useConversation();

	const clientRef = useRef(null);
	const chatSubscriptionsRef = useRef(new Map());
	const typingExpiryRef = useRef(new Map());
	const messageQueueSubscriptionRef = useRef(null);
	const callQueueSubscriptionRef = useRef(null);
	const errorSubscriptionRef = useRef(null);
	const pendingSummaryFetchRef = useRef(new Map());
	const incomingToastStacksRef = useRef(new Map());
	const connectedRef = useRef(false);
	const selectedChatIdRef = useRef(selectedConversation?.chatId ?? null);
	const conversationsRef = useRef(conversations);
	const applyCallEvent = useCallStore((state) => state.applyCallEvent);

	useEffect(() => {
		conversationsRef.current = conversations;
	}, [conversations]);

	useEffect(() => {
		selectedChatIdRef.current = selectedConversation?.chatId ?? null;
	}, [selectedConversation?.chatId]);

	const fetchConversationSummary = useCallback(async (chatId) => {
		if (!chatId || !token) return null;

		const existingRequest = pendingSummaryFetchRef.current.get(chatId);
		if (existingRequest) {
			return existingRequest;
		}

		const request = (async () => {
			try {
				const chatIdString = String(chatId);

				const response = await fetch(
					`${import.meta.env.VITE_API_HOST}/api/chat/summaries/${chatId}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!response.ok) {
					// Fall through to paginated summaries fallback (supports older backend without single-summary endpoint).
				} else {
					const summary = await response.json();
					if (summary && String(summary?.id ?? summary?.chatId) === chatIdString) {
						upsertConversation(summary, { moveToTop: true });
						return summary;
					}
				}

				for (let page = 0; page < SUMMARY_MAX_PAGES; page += 1) {
					const pagedResponse = await fetch(
						`${import.meta.env.VITE_API_HOST}/api/chat/summaries?page=${page}&size=${SUMMARY_PAGE_SIZE}`,
						{
							method: "GET",
							headers: {
								"Content-Type": "application/json",
								Authorization: `Bearer ${token}`,
							},
						}
					);
					if (!pagedResponse.ok) {
						break;
					}
					const summaries = await pagedResponse.json();
					if (!Array.isArray(summaries)) {
						break;
					}
					const match = summaries.find(
						(summary) => String(summary?.id ?? summary?.chatId) === chatIdString
					);
					if (match) {
						upsertConversation(match, { moveToTop: true });
						return match;
					}
					if (summaries.length < SUMMARY_PAGE_SIZE) {
						break;
					}
				}

				return null;
			} catch {
				return null;
			} finally {
				pendingSummaryFetchRef.current.delete(chatId);
			}
		})();

		pendingSummaryFetchRef.current.set(chatId, request);
		return request;
	}, [token, upsertConversation]);

	const handleTypingEvent = useCallback(
		(eventPayload) => {
			const chatId = eventPayload?.chatId;
			const userId = eventPayload?.userId;
			const typing = !!eventPayload?.typing;

			if (!chatId || !userId || userId === currentUserId) {
				return;
			}

			const typingKey = `${chatId}:${userId}`;
			const existingTimeout = typingExpiryRef.current.get(typingKey);
			if (existingTimeout) {
				clearTimeout(existingTimeout);
				typingExpiryRef.current.delete(typingKey);
			}

			setTypingState({
				chatId,
				userId,
				typing,
			});

			if (typing) {
				const timeoutId = setTimeout(() => {
					setTypingState({
						chatId,
						userId,
						typing: false,
					});
					typingExpiryRef.current.delete(typingKey);
				}, TYPING_TTL_MS);
				typingExpiryRef.current.set(typingKey, timeoutId);
			}
		},
		[currentUserId, setTypingState]
	);

	const queueIncomingMessageToast = useCallback((message, { senderLabel, avatarUrl }) => {
		if (!message) return;

		const senderKey = message?.userId
			? String(message.userId)
			: `${message?.chatId || "chat"}:${senderLabel || "someone"}`;
		const toastId = `incoming-${senderKey}`;
		const preview = formatMessagePreview(message.content, 36) || "Sent a message";
		const currentStack = incomingToastStacksRef.current.get(senderKey);
		const nextMessages = [
			...(currentStack?.messages || []),
			{
				id: `${message?.id || Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
				preview,
				timeLabel: formatNotificationTime(message?.timeStamp),
			},
		].slice(-INCOMING_TOAST_STACK_SIZE);
		const nextStack = {
			senderLabel: senderLabel || currentStack?.senderLabel || "Someone",
			avatarUrl: avatarUrl || currentStack?.avatarUrl || null,
			messages: nextMessages,
			cleanupTimeoutId: null,
		};

		if (currentStack?.cleanupTimeoutId) {
			clearTimeout(currentStack.cleanupTimeoutId);
		}

		const cleanupTimeoutId = setTimeout(() => {
			incomingToastStacksRef.current.delete(senderKey);
		}, INCOMING_TOAST_DURATION_MS + INCOMING_TOAST_CLEANUP_BUFFER_MS + INCOMING_TOAST_REMOVE_DELAY_MS);
		nextStack.cleanupTimeoutId = cleanupTimeoutId;

		incomingToastStacksRef.current.set(senderKey, nextStack);
		const stackedCards = [...nextMessages].reverse();
		const deckHeight = 94 + Math.max(stackedCards.length - 1, 0) * INCOMING_CARD_Y_OFFSET;

		toast.custom(
			(toastInstance) =>
				createElement(
					"div",
					{
						className: "w-full",
						style: {
							width: `${INCOMING_CARD_STACK_WIDTH}px`,
							maxWidth: "90vw",
						},
					},
					createElement(
						"div",
						{
							className: "relative",
							style: { height: `${deckHeight}px` },
						},
						...stackedCards.map((item, index) => {
							const baseScale = Math.max(1 - index * INCOMING_CARD_SCALE_STEP, 0.9);
							const baseY = index * INCOMING_CARD_Y_OFFSET;
							const exitY = Math.max(baseY - 10, 0);
							const isVisible = toastInstance.visible;

							return createElement(
								"div",
								{
									key: item.id,
									className: "absolute inset-x-0 top-0 rounded-[18px] border border-slate-700/90 bg-slate-900/95 px-3.5 py-3 text-slate-100 shadow-[0_14px_28px_rgba(2,6,23,0.52)]",
									style: {
										transform: isVisible
											? `translateY(${baseY}px) scale(${baseScale})`
											: `translateY(${exitY}px) scale(${Math.max(baseScale - 0.02, 0.86)})`,
										opacity: isVisible ? 1 : 0,
										transformOrigin: "top center",
										zIndex: stackedCards.length - index,
										transition: "transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 260ms ease",
										transitionDelay: isVisible ? "0ms" : `${index * INCOMING_CARD_EXIT_STAGGER_MS}ms`,
										willChange: "transform, opacity",
									},
								},
								createElement("div", { className: "flex items-start gap-3" },
									nextStack.avatarUrl
										? createElement("img", {
											src: nextStack.avatarUrl,
											alt: `${nextStack.senderLabel} avatar`,
											className: "mt-0.5 h-9 w-9 shrink-0 rounded-full object-cover",
										})
										: createElement(
											"div",
											{
												className: "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-950 text-xs font-semibold text-cyan-200",
											},
											(nextStack.senderLabel || "S").charAt(0).toUpperCase()
										),
									createElement("div", { className: "min-w-0 flex-1" },
										createElement("div", { className: "mb-1 flex items-center justify-between gap-2" },
											createElement("p", { className: "truncate text-[13px] font-semibold text-slate-100" }, nextStack.senderLabel),
											createElement("span", { className: "shrink-0 text-[11px] font-medium text-slate-400" }, item.timeLabel)
										),
										createElement("p", { className: "text-[13px] leading-5 text-slate-300" }, item.preview),
										createElement("div", { className: "mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500" }, "Messages")
									)
								)
							);
						})
					)
				),
			{
				id: toastId,
				duration: INCOMING_TOAST_DURATION_MS,
				removeDelay: INCOMING_TOAST_REMOVE_DELAY_MS,
				style: {
					padding: 0,
					background: "transparent",
					border: "none",
					boxShadow: "none",
					maxWidth: `${INCOMING_CARD_STACK_WIDTH}px`,
				},
			}
		);
	}, []);

	const processIncomingMessage = useCallback(async (message) => {
		if (!message?.id || !message?.chatId) return;

		const chatId = message.chatId;
		let hasConversation = (conversationsRef.current || []).some(
			(conversation) => (conversation?.id ?? conversation?.chatId) === chatId
		);
		if (!hasConversation) {
			await fetchConversationSummary(chatId);
			hasConversation = (conversationsRef.current || []).some(
				(conversation) => (conversation?.id ?? conversation?.chatId) === chatId
			);
		}
		if (!hasConversation) {
			const incomingIsFromOtherUser = !!currentUserId && message.userId !== currentUserId;
			upsertConversation({
				id: chatId,
				chatId,
				chatName: incomingIsFromOtherUser ? "New message" : "New chat",
				chatImage: null,
				lastMessage: message,
				unreadCount: incomingIsFromOtherUser ? 1 : 0,
			}, { moveToTop: true });
			// Retry summary fetch in background to hydrate proper name/image once available.
			void fetchConversationSummary(chatId);
		}

		updateConversationFromMessage(message, currentUserId);
		setTypingState({
			chatId: message.chatId,
			userId: message.userId,
			typing: false,
		});

		if (selectedChatIdRef.current !== message.chatId) {
			if (currentUserId && message.userId !== currentUserId) {
				const sourceConversation = (conversationsRef.current || []).find(
					(conversation) => (conversation?.id ?? conversation?.chatId) === message.chatId
				);
				if (sourceConversation?.muted) {
					return;
				}
				const senderKey = message?.userId ? String(message.userId) : null;
				const memberDirectory = sourceConversation?.memberDirectory || {};
				const memberAvatarDirectory = sourceConversation?.memberAvatarDirectory || {};
				const senderLabel = sourceConversation?.isGroup
					? (senderKey ? memberDirectory[senderKey] || "Someone" : "Someone")
					: sourceConversation?.chatName || "Someone";
				const avatarUrl = sourceConversation?.isGroup
					? (senderKey ? memberAvatarDirectory[senderKey] || null : null)
					: sourceConversation?.chatImage || null;
				queueIncomingMessageToast(message, {
					senderLabel,
					avatarUrl,
				});
			}
			return;
		}

		setMessages((prevMessages) => {
			const existingMessages = Array.isArray(prevMessages) ? prevMessages : [];
			if (existingMessages.some((current) => current.id === message.id)) {
				return existingMessages;
			}
			return [...existingMessages, message];
		});
	}, [currentUserId, fetchConversationSummary, queueIncomingMessageToast, setMessages, setTypingState, updateConversationFromMessage, upsertConversation]);

	const handleIncomingFrame = useCallback(
		(frame) => {
			try {
				const parsedPayload = JSON.parse(frame.body);

				if (parsedPayload?.type?.startsWith("CALL_")) {
					applyCallEvent(parsedPayload, currentUserId);
					return;
				}

				if (parsedPayload?.type === "chat.typing") {
					handleTypingEvent(parsedPayload);
					return;
				}

				if (parsedPayload?.type === "chat.created" || parsedPayload?.type === "chat.updated") {
					if (parsedPayload?.chatId) {
						void fetchConversationSummary(parsedPayload.chatId);
					}
					return;
				}

				if (parsedPayload?.type === "chat.removed") {
					if (parsedPayload?.chatId) {
						removeConversation(parsedPayload.chatId);
					}
					return;
				}

				const message = parsedPayload?.message ?? parsedPayload;
				void processIncomingMessage(message);
			} catch (error) {
				console.error("Failed to parse websocket frame", error);
			}
		},
		[applyCallEvent, currentUserId, fetchConversationSummary, handleTypingEvent, processIncomingMessage, removeConversation]
	);

	const syncChatSubscriptions = useCallback(() => {
		const client = clientRef.current;
		if (!client || !connectedRef.current) {
			return;
		}

		const expectedChatIds = new Set(
			(conversationsRef.current || [])
				.map((conversation) => conversation?.id ?? conversation?.chatId)
				.filter(Boolean)
		);

		for (const chatId of expectedChatIds) {
			if (chatSubscriptionsRef.current.has(chatId)) {
				continue;
			}
			const subscription = client.subscribe(`/topic/chat.${chatId}`, handleIncomingFrame);
			chatSubscriptionsRef.current.set(chatId, subscription);
		}

		for (const [chatId, subscription] of chatSubscriptionsRef.current.entries()) {
			if (expectedChatIds.has(chatId)) {
				continue;
			}
			subscription.unsubscribe();
			chatSubscriptionsRef.current.delete(chatId);
		}
	}, [handleIncomingFrame]);

	const publishToSocket = useCallback((chatId, content) => {
		const client = clientRef.current;
		if (!client || !connectedRef.current) {
			return false;
		}

		client.publish({
			destination: WS_DESTINATIONS.send,
			body: JSON.stringify({ chatId, content }),
		});
		return true;
	}, []);

	const publishTypingToSocket = useCallback((chatId, typing) => {
		const client = clientRef.current;
		if (!client || !connectedRef.current) {
			return false;
		}

		client.publish({
			destination: WS_DESTINATIONS.typing,
			body: JSON.stringify({ chatId, typing }),
		});
		return true;
	}, []);

	useEffect(() => {
		setSendWebsocketMessage(publishToSocket);
		return () => setSendWebsocketMessage(null);
	}, [publishToSocket, setSendWebsocketMessage]);

	useEffect(() => {
		setSendWebsocketTyping(publishTypingToSocket);
		return () => setSendWebsocketTyping(null);
	}, [publishTypingToSocket, setSendWebsocketTyping]);

	useEffect(() => {
		if (!token) {
			setWebsocketConnected(false);
			return;
		}

		const wsUrl = `${buildWebSocketBaseUrl()}/ws`;
		const client = new Client({
			webSocketFactory: () => new SockJS(wsUrl),
			connectHeaders: {
				Authorization: `Bearer ${token}`,
			},
			reconnectDelay: 5000,
			debug: () => {},
		});

		client.onConnect = () => {
			connectedRef.current = true;
			setWebsocketConnected(true);

			if (messageQueueSubscriptionRef.current) {
				messageQueueSubscriptionRef.current.unsubscribe();
			}
			messageQueueSubscriptionRef.current = client.subscribe(
				WS_DESTINATIONS.chatEventsQueue,
				handleIncomingFrame
			);

			if (callQueueSubscriptionRef.current) {
				callQueueSubscriptionRef.current.unsubscribe();
			}
			callQueueSubscriptionRef.current = client.subscribe(
				WS_DESTINATIONS.callEventsQueue,
				handleIncomingFrame
			);

			if (errorSubscriptionRef.current) {
				errorSubscriptionRef.current.unsubscribe();
			}
			errorSubscriptionRef.current = client.subscribe(WS_DESTINATIONS.errorQueue, (frame) => {
				try {
					const payload = JSON.parse(frame.body);
					if (payload?.message) {
						toast.error(payload.message);
					}
				} catch {
					toast.error("Websocket error");
				}
			});

			syncChatSubscriptions();
		};

		client.onStompError = (frame) => {
			connectedRef.current = false;
			setWebsocketConnected(false);
			const reason = frame?.headers?.message || "Realtime connection error";
			toast.error(reason);
		};

		client.onWebSocketClose = () => {
			connectedRef.current = false;
			setWebsocketConnected(false);
		};

		try {
			client.activate();
		} catch (error) {
			console.error("Failed to activate websocket client", error);
			setWebsocketConnected(false);
			return undefined;
		}
		clientRef.current = client;
		const chatSubscriptions = chatSubscriptionsRef.current;
		const typingExpiries = typingExpiryRef.current;
		const incomingToastStacks = incomingToastStacksRef.current;
		const pendingSummaryFetches = pendingSummaryFetchRef.current;

		return () => {
			connectedRef.current = false;
			setWebsocketConnected(false);

			for (const subscription of chatSubscriptions.values()) {
				subscription.unsubscribe();
			}
			chatSubscriptions.clear();

			for (const timeoutId of typingExpiries.values()) {
				clearTimeout(timeoutId);
			}
			typingExpiries.clear();

			if (errorSubscriptionRef.current) {
				errorSubscriptionRef.current.unsubscribe();
				errorSubscriptionRef.current = null;
			}
			if (messageQueueSubscriptionRef.current) {
				messageQueueSubscriptionRef.current.unsubscribe();
				messageQueueSubscriptionRef.current = null;
			}
			if (callQueueSubscriptionRef.current) {
				callQueueSubscriptionRef.current.unsubscribe();
				callQueueSubscriptionRef.current = null;
			}
			for (const stackedToast of incomingToastStacks.values()) {
				if (stackedToast?.cleanupTimeoutId) {
					clearTimeout(stackedToast.cleanupTimeoutId);
				}
			}
			incomingToastStacks.clear();
			pendingSummaryFetches.clear();
			if (clientRef.current) {
				clientRef.current.deactivate();
			}
			clientRef.current = null;
		};
	}, [handleIncomingFrame, setWebsocketConnected, syncChatSubscriptions, token]);

	useEffect(() => {
		if (!connectedRef.current) {
			return;
		}
		syncChatSubscriptions();
	}, [conversations, syncChatSubscriptions]);
};

export default useChatWebSocket;
