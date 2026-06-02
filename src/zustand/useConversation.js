import { create } from "zustand";

const getConversationId = (conversation) => conversation?.id ?? conversation?.chatId ?? null;

const toEpoch = (timeStamp) => {
	if (!timeStamp) return 0;
	const parsed = Date.parse(timeStamp);
	return Number.isNaN(parsed) ? 0 : parsed;
};

const sortByLastActivity = (conversations) =>
	[...conversations].sort((a, b) => toEpoch(b?.lastMessage?.timeStamp) - toEpoch(a?.lastMessage?.timeStamp));

const mergeConversation = (existing, incoming) => {
	const existingId = getConversationId(existing);
	const incomingId = getConversationId(incoming);
	const id = incomingId ?? existingId;

	return {
		...existing,
		...incoming,
		id,
		chatId: id,
		lastMessage: incoming?.lastMessage ?? existing?.lastMessage ?? null,
		unreadCount: incoming?.unreadCount ?? existing?.unreadCount ?? 0,
	};
};

const mergeConversationList = (current, incomingList, replace = false) => {
	const next = replace ? [] : [...current];
	const indexById = new Map(next.map((conversation, index) => [getConversationId(conversation), index]));

	for (const incoming of incomingList) {
		const id = getConversationId(incoming);
		if (!id) continue;

		const normalizedIncoming = {
			...incoming,
			id,
			chatId: id,
			unreadCount: incoming?.unreadCount ?? 0,
		};

		if (!indexById.has(id)) {
			indexById.set(id, next.length);
			next.push(normalizedIncoming);
			continue;
		}

		const existingIndex = indexById.get(id);
		next[existingIndex] = mergeConversation(next[existingIndex], normalizedIncoming);
	}

	return sortByLastActivity(next);
};

const useConversation = create((set) => ({
	selectedConversation: null,
	conversationViewMode: "messages",
	setConversationViewMode: (conversationViewMode) => set({ conversationViewMode }),
	setSelectedConversation: (selectedConversation) =>
		set((state) => {
			if (!selectedConversation) {
				return { selectedConversation: null, conversationViewMode: "messages" };
			}

			const chatId = selectedConversation?.chatId ?? selectedConversation?.id;
			if (!chatId) {
				return { selectedConversation, conversationViewMode: "messages" };
			}

			return {
				selectedConversation: {
					...selectedConversation,
					chatId,
					id: selectedConversation?.id ?? chatId,
				},
				conversationViewMode: "messages",
				conversations: state.conversations.map((conversation) =>
					getConversationId(conversation) === chatId
						? { ...conversation, unreadCount: 0 }
						: conversation
				),
			};
		}),
	messages: [],
	setMessages: (messagesOrUpdater) =>
		set((state) => ({
			messages:
				typeof messagesOrUpdater === "function"
					? messagesOrUpdater(state.messages)
					: messagesOrUpdater,
		})),
	conversations: [],
	conversationsLoading: false,
	conversationsPage: 0,
	conversationsHasMore: true,
	setConversationsLoading: (conversationsLoading) => set({ conversationsLoading }),
	setConversationPagination: ({ page, hasMore }) =>
		set({
			conversationsPage: page,
			conversationsHasMore: hasMore,
		}),
	resetConversations: () =>
		set({
			conversations: [],
			conversationsPage: 0,
			conversationsHasMore: true,
		}),
	resetConversationSession: () =>
		set({
			selectedConversation: null,
			conversationViewMode: "messages",
			messages: [],
			conversations: [],
			conversationsLoading: false,
			conversationsPage: 0,
			conversationsHasMore: true,
			typingUsersByChat: {},
			selfTypingByChat: {},
			draftByChat: {},
			callEventsByChat: {},
		}),
	replaceConversations: (conversations) =>
		set((state) => ({
			conversations: mergeConversationList(state.conversations, conversations, true),
		})),
	appendConversations: (conversations) =>
		set((state) => ({
			conversations: mergeConversationList(state.conversations, conversations, false),
		})),
	removeConversation: (chatId) =>
		set((state) => {
			if (!chatId) return {};
			const remaining = state.conversations.filter(
				(conversation) => getConversationId(conversation) !== chatId
			);
			const selectedConversation =
				state.selectedConversation?.chatId === chatId ? null : state.selectedConversation;
			return {
				conversations: remaining,
				selectedConversation,
				conversationViewMode:
					state.selectedConversation?.chatId === chatId ? "messages" : state.conversationViewMode,
			};
		}),
	upsertConversation: (conversation, { moveToTop = false } = {}) =>
		set((state) => {
			const merged = mergeConversationList(state.conversations, [conversation], false);
			const id = getConversationId(conversation);
			const selectedConversation =
				state.selectedConversation && getConversationId(state.selectedConversation) === id
					? mergeConversation(state.selectedConversation, { ...conversation, id, chatId: id })
					: state.selectedConversation;
			if (!moveToTop) {
				return { conversations: merged, selectedConversation };
			}

			const target = merged.find((entry) => getConversationId(entry) === id);
			if (!target) {
				return { conversations: merged, selectedConversation };
			}

			return {
				conversations: [target, ...merged.filter((entry) => getConversationId(entry) !== id)],
				selectedConversation,
			};
		}),
	updateConversationFromMessage: (message, currentUserId, options = {}) =>
		set((state) => {
			if (!message?.chatId) return {};

			const targetChatId = message.chatId;
			const isSelectedChat = state.selectedConversation?.chatId === targetChatId;
			const isIncoming = !!currentUserId && message.userId !== currentUserId;
			const suppressUnread = Boolean(options.suppressUnread);

			const existingConversation = state.conversations.find(
				(conversation) => getConversationId(conversation) === targetChatId
			);

			if (!existingConversation) {
				return {};
			}

			const updatedConversation = {
				...existingConversation,
				lastMessage: message,
				unreadCount: isSelectedChat
					? 0
					: isIncoming && !suppressUnread
						? (existingConversation.unreadCount ?? 0) + 1
						: existingConversation.unreadCount ?? 0,
			};

			const remaining = state.conversations.filter(
				(conversation) => getConversationId(conversation) !== targetChatId
			);

			return {
				conversations: [updatedConversation, ...remaining],
			};
		}),
	typingUsersByChat: {},
	setTypingState: ({ chatId, userId, typing }) =>
		set((state) => {
			if (!chatId || !userId) return {};

			const chatKey = String(chatId);
			const currentUsers = state.typingUsersByChat[chatKey] || [];

			if (!typing) {
				const filtered = currentUsers.filter((id) => id !== userId);
				if (filtered.length === 0) {
					const { [chatKey]: _removed, ...rest } = state.typingUsersByChat;
					return { typingUsersByChat: rest };
				}
				return {
					typingUsersByChat: {
						...state.typingUsersByChat,
						[chatKey]: filtered,
					},
				};
			}

			if (currentUsers.includes(userId)) {
				return {};
			}

			return {
				typingUsersByChat: {
					...state.typingUsersByChat,
					[chatKey]: [...currentUsers, userId],
				},
			};
		}),
	clearTypingChat: (chatId) =>
		set((state) => {
			if (!chatId) return {};
			const chatKey = String(chatId);
			if (!(chatKey in state.typingUsersByChat)) return {};
			const { [chatKey]: _removed, ...rest } = state.typingUsersByChat;
			return { typingUsersByChat: rest };
		}),
	selfTypingByChat: {},
	setSelfTypingState: ({ chatId, typing }) =>
		set((state) => {
			if (!chatId) return {};
			const chatKey = String(chatId);
			if (!typing) {
				if (!(chatKey in state.selfTypingByChat)) return {};
				const { [chatKey]: _removed, ...rest } = state.selfTypingByChat;
				return { selfTypingByChat: rest };
			}
			return {
				selfTypingByChat: {
					...state.selfTypingByChat,
					[chatKey]: true,
				},
			};
		}),
	draftByChat: {},
	setDraftForChat: ({ chatId, draft }) =>
		set((state) => {
			if (!chatId) return {};
			const chatKey = String(chatId);
			const nextDraft = (draft || "").trim();
			if (!nextDraft) {
				if (!(chatKey in state.draftByChat)) return {};
				const { [chatKey]: _removed, ...rest } = state.draftByChat;
				return { draftByChat: rest };
			}

			return {
				draftByChat: {
					...state.draftByChat,
					[chatKey]: nextDraft,
				},
			};
		}),
	clearDraftForChat: (chatId) =>
		set((state) => {
			if (!chatId) return {};
			const chatKey = String(chatId);
			if (!(chatKey in state.draftByChat)) return {};
			const { [chatKey]: _removed, ...rest } = state.draftByChat;
			return { draftByChat: rest };
		}),
	callEventsByChat: {},
	addCallTimelineEvent: (event) =>
		set((state) => {
			const chatId = event?.chatId;
			const callId = event?.callId || event?.id;
			const eventKind = event?.eventKind;
			if (!chatId || !callId || !eventKind) return {};

			const chatKey = String(chatId);
			const eventId = `${callId}:${eventKind}`;
			const currentEvents = state.callEventsByChat[chatKey] || [];
			if (currentEvents.some((item) => item.id === eventId)) {
				return {};
			}

			return {
				callEventsByChat: {
					...state.callEventsByChat,
					[chatKey]: [...currentEvents, { ...event, id: eventId }],
				},
			};
		}),
	websocketConnected: false,
	setWebsocketConnected: (websocketConnected) => set({ websocketConnected }),
	sendWebsocketMessage: null,
	setSendWebsocketMessage: (sendWebsocketMessage) => set({ sendWebsocketMessage }),
	sendWebsocketTyping: null,
	setSendWebsocketTyping: (sendWebsocketTyping) => set({ sendWebsocketTyping }),
}));

export default useConversation;
