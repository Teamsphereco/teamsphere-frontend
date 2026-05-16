import { useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";

const PAGE_SIZE = 100;

const useGetConversations = () => {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const {
		conversations,
		conversationsLoading,
		conversationsPage,
		conversationsHasMore,
		setConversationsLoading,
		setConversationPagination,
		resetConversationSession,
		replaceConversations,
		appendConversations,
	} = useConversation();

	const fetchConversations = useCallback(async (pageNumber, mode = "append", options = {}) => {
		const { silent = false, updatePagination = true } = options;
		if (!token) return;
		setConversationsLoading(true);
		try {
			const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/chat/summaries?page=${pageNumber}&size=${PAGE_SIZE}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				}
			});

			if (!response.ok) {
				throw new Error('Network response was not ok');
			}

			const data = await response.json();
			if (data.error) {
				throw new Error(data.error);
			}

			if (mode === "replace") {
				replaceConversations(data);
			} else {
				appendConversations(data);
			}

			if (updatePagination) {
				setConversationPagination({
					page: pageNumber + 1,
					hasMore: data.length === PAGE_SIZE,
				});
			}
		} catch (error) {
			if (!silent) {
				toast.error(error.message);
			}
			if (updatePagination) {
				setConversationPagination({
					page: pageNumber,
					hasMore: false,
				});
			}
		} finally {
			setConversationsLoading(false);
		}
	}, [
		appendConversations,
		replaceConversations,
		setConversationPagination,
		setConversationsLoading,
		token,
	]);

	useEffect(() => {
		// Token change can happen when switching accounts; clear stale chat state first.
		resetConversationSession();
		if (!token) {
			return;
		}
		setConversationPagination({
			page: 0,
			hasMore: true,
		});
		fetchConversations(0, "replace");
	}, [fetchConversations, resetConversationSession, setConversationPagination, token]);

	const loadMore = useCallback(() => {
		if (!conversationsLoading && conversationsHasMore) {
			fetchConversations(conversationsPage, "append");
		}
	}, [conversationsHasMore, conversationsLoading, conversationsPage, fetchConversations]);

	const refreshConversations = useCallback(() => {
		setConversationPagination({
			page: 0,
			hasMore: true,
		});
		fetchConversations(0, "replace");
	}, [fetchConversations, setConversationPagination]);

	return {
		loading: conversationsLoading,
		conversations,
		loadMore,
		hasMore: conversationsHasMore,
		refreshConversations,
	};
};

export default useGetConversations;
