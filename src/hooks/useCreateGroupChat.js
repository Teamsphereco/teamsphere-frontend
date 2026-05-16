import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import useConversation from "../zustand/useConversation";

const useCreateGroupChat = () => {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const { upsertConversation, setSelectedConversation } = useConversation();
	const [creatingGroup, setCreatingGroup] = useState(false);

	const createGroupChat = useCallback(async ({
		chatName,
		userIds,
		chatImageFile = null,
		description = "",
	}) => {
		if (!token) {
			toast.error("Unauthorized");
			return null;
		}

		if (!chatName || !chatName.trim()) {
			toast.error("Group name is required");
			return null;
		}

		if (!Array.isArray(userIds) || userIds.length < 2) {
			toast.error("Select at least 2 members");
			return null;
		}

		setCreatingGroup(true);
		try {
			const requestBody = new FormData();
			requestBody.append("chatName", chatName.trim());
			userIds.forEach((userId) => {
				requestBody.append("userIds", String(userId));
			});
			if (chatImageFile instanceof File) {
				requestBody.append("chatImageFile", chatImageFile);
			}
			if (description?.trim()) {
				requestBody.append("description", description.trim());
			}

			const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/chat/group`, {
				method: "POST",
				headers: {
					Authorization: `Bearer ${token}`,
				},
				body: requestBody,
			});
			const payload = await response.json().catch(() => null);

			if (!response.ok) {
				throw new Error(payload?.message || payload?.error || "Failed to create group chat");
			}

			const memberCount = Number.isFinite(Number(payload?.memberCount))
				? Number(payload.memberCount)
				: userIds.length + 1;

			const summary = {
				id: payload?.id,
				chatId: payload?.id,
				chatName: payload?.chatName || chatName.trim(),
				chatImage: payload?.chatImage || null,
				isGroup: true,
				memberCount,
				muted: false,
				blocked: false,
				lastMessage: null,
				unreadCount: 0,
			};
			upsertConversation(summary, { moveToTop: true });
			setSelectedConversation({
				chatId: summary.id,
				chatName: summary.chatName,
				chatImage: summary.chatImage,
				isGroup: true,
				memberCount,
			});
			toast.success("Group chat created");
			return payload;
		} catch (error) {
			toast.error(error.message);
			return null;
		} finally {
			setCreatingGroup(false);
		}
	}, [setSelectedConversation, token, upsertConversation]);

	return {
		creatingGroup,
		createGroupChat,
	};
};

export default useCreateGroupChat;
