import { useCallback, useEffect, useRef, useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const PAGE_SIZE = 30;

const useGetMessages = () => {
	const [loading, setLoading] = useState(false);
	const [loadingOlder, setLoadingOlder] = useState(false);
	const [nextPage, setNextPage] = useState(0);
	const [hasOlderMessages, setHasOlderMessages] = useState(false);
	const { messages, setMessages, selectedConversation, upsertConversation } = useConversation();
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const activeChatRef = useRef(selectedConversation?.chatId || null);

	useEffect(() => {
		activeChatRef.current = selectedConversation?.chatId || null;
	}, [selectedConversation?.chatId]);

	const fetchMessagePage = useCallback(async (chatId, page, size) => {
		const response = await fetch(
			`${import.meta.env.VITE_API_HOST}/api/message/chat/${chatId}?page=${page}&size=${size}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			}
		);

		if (!response.ok) {
			throw new Error("Failed to fetch messages");
		}

		const payload = await response.json();
		if (Array.isArray(payload)) {
			return {
				messages: payload,
				hasMore: false,
			};
		}

		return {
			messages: Array.isArray(payload?.messages) ? payload.messages : [],
			hasMore: !!payload?.hasMore,
		};
	}, [token]);

	const hydrateGroupMembers = useCallback(async (chatId) => {
		if (!chatId || !token) return;
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_HOST}/api/chat/${chatId}/settings`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (!response.ok) {
				return;
			}

			const payload = await response.json().catch(() => null);
			if (!payload?.isGroup) {
				return;
			}

			const members = Array.isArray(payload?.members) ? payload.members : [];
			const memberDirectory = {};
			const memberAvatarDirectory = {};

			for (const member of members) {
				const memberId = member?.userId ?? member?.id;
				if (!memberId) continue;
				const memberKey = String(memberId);
				const memberName = member?.username || member?.fullName || member?.name || "";
				if (memberName) {
					memberDirectory[memberKey] = memberName;
				}
				const avatar =
					member?.profilePicture ||
					member?.profileImageUrl ||
					member?.avatarUrl ||
					member?.chatImage ||
					null;
				if (avatar) {
					memberAvatarDirectory[memberKey] = avatar;
				}
			}

			upsertConversation({
				id: chatId,
				chatId,
				isGroup: true,
				memberCount: Number.isFinite(Number(payload?.memberCount))
					? Number(payload.memberCount)
					: members.length,
				memberDirectory,
				memberAvatarDirectory,
			});
		} catch {
			// Non-blocking: message history still renders without sender hydration.
		}
	}, [token, upsertConversation]);

	useEffect(() => {
		const getInitialMessages = async () => {
			if (!selectedConversation?.chatId || !token) {
				setMessages([]);
				setNextPage(0);
				setHasOlderMessages(false);
				return;
			}

			setLoading(true);
			try {
				const data = await fetchMessagePage(selectedConversation.chatId, 0, PAGE_SIZE);
				if (activeChatRef.current !== selectedConversation.chatId) {
					return;
				}
				setMessages(data.messages);
				void hydrateGroupMembers(selectedConversation.chatId);
				setNextPage(1);
				setHasOlderMessages(data.hasMore);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoading(false);
			}
		};

		getInitialMessages();
	}, [fetchMessagePage, hydrateGroupMembers, selectedConversation?.chatId, setMessages, token]);

	const loadOlderMessages = useCallback(async () => {
		if (!selectedConversation?.chatId || !token) return false;
		if (loading || loadingOlder || !hasOlderMessages) return false;

		setLoadingOlder(true);
		try {
			const data = await fetchMessagePage(selectedConversation.chatId, nextPage, PAGE_SIZE);
			if (activeChatRef.current !== selectedConversation.chatId) {
				return false;
			}

			if (data.messages.length > 0) {
				setMessages((existingMessages) => [...data.messages, ...(existingMessages || [])]);
			}
			setNextPage((currentPage) => currentPage + 1);
			setHasOlderMessages(data.hasMore);
			return data.messages.length > 0;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoadingOlder(false);
		}
	}, [
		fetchMessagePage,
		hasOlderMessages,
		loading,
		loadingOlder,
		nextPage,
		selectedConversation?.chatId,
		setMessages,
		token,
	]);

	return {
		messages,
		loading,
		loadingOlder,
		hasOlderMessages,
		loadOlderMessages,
	};
};

export default useGetMessages;
