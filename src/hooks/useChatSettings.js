import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";

const useChatSettings = () => {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const {
		upsertConversation,
		removeConversation,
		selectedConversation,
		setSelectedConversation,
		setConversationViewMode,
	} = useConversation();
	const [loading, setLoading] = useState(false);

	const request = useCallback(async (path, options = {}) => {
		if (!token) {
			throw new Error("Unauthorized");
		}
		const response = await fetch(`${import.meta.env.VITE_API_HOST}${path}`, {
			...options,
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
				...(options.headers || {}),
			},
		});

		const payload = await response.json().catch(() => null);
		if (!response.ok) {
			throw new Error(payload?.message || payload?.error || "Request failed");
		}
		return payload;
	}, [token]);

	const loadChatSettings = useCallback(async (chatId) => {
		if (!chatId) return null;
		setLoading(true);
		try {
			const payload = await request(`/api/chat/${chatId}/settings`, { method: "GET" });
			if (payload?.isGroup) {
				const memberCount = Number.isFinite(Number(payload?.memberCount))
					? Number(payload.memberCount)
					: Array.isArray(payload?.members)
						? payload.members.length
						: undefined;
				upsertConversation({
					id: chatId,
					chatId,
					isGroup: true,
					memberCount,
				});
			}
			return payload;
		} catch (error) {
			toast.error(error.message);
			return null;
		} finally {
			setLoading(false);
		}
	}, [request, upsertConversation]);

	const syncSummary = useCallback(async (chatId) => {
		if (!chatId) return;
		try {
			const summary = await request(`/api/chat/summaries/${chatId}`, { method: "GET" });
			if (summary) {
				upsertConversation(summary);
			}
		} catch {
			// Ignore summary refresh failures after settings mutations.
		}
	}, [request, upsertConversation]);

	const muteChat = useCallback(async (chatId, muted) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/mute?muted=${muted}`, { method: "PUT" });
			await syncSummary(chatId);
			toast.success(muted ? "Chat muted" : "Chat unmuted");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request, syncSummary]);

	const blockChat = useCallback(async (chatId, blocked) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/block?blocked=${blocked}`, { method: "PUT" });
			await syncSummary(chatId);
			toast.success(blocked ? "Chat blocked" : "Chat unblocked");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request, syncSummary]);

	const leaveGroup = useCallback(async (chatId) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/leave`, { method: "POST" });
			removeConversation(chatId);
			if (selectedConversation?.chatId === chatId) {
				setSelectedConversation(null);
				setConversationViewMode("messages");
			}
			toast.success("Left group chat");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [removeConversation, request, selectedConversation?.chatId, setConversationViewMode, setSelectedConversation]);

	const promoteMember = useCallback(async (chatId, userId) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/promote/${userId}`, { method: "PUT" });
			toast.success("Member promoted");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request]);

	const demoteMember = useCallback(async (chatId, userId) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/demote/${userId}`, { method: "PUT" });
			toast.success("Admin demoted");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request]);

	const removeMember = useCallback(async (chatId, userId) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/remove/${userId}`, { method: "PUT" });
			toast.success("Member removed");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request]);

	const addMember = useCallback(async (chatId, userId) => {
		setLoading(true);
		try {
			await request(`/api/chat/${chatId}/add/${userId}`, { method: "PUT" });
			toast.success("Member added");
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request]);

	const updateGroupInfo = useCallback(async (chatId, { chatName, description, chatImage }) => {
		setLoading(true);
		try {
			const payload = await request(`/api/chat/${chatId}/settings`, {
				method: "PUT",
				body: JSON.stringify({
					chatName: chatName?.trim() || "",
					description: description?.trim() || "",
					chatImage: chatImage?.trim() || null,
				}),
			});
			toast.success("Group info updated");
			return payload || true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	}, [request]);

	return {
		loading,
		loadChatSettings,
		muteChat,
		blockChat,
		leaveGroup,
		promoteMember,
		demoteMember,
		removeMember,
		addMember,
		updateGroupInfo,
		syncSummary,
	};
};

export default useChatSettings;
