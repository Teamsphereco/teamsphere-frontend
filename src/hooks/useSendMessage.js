import { useState } from "react";
import useConversation from "../zustand/useConversation";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useSendMessage = () => {
	const [loading, setLoading] = useState(false);
	const {
		setMessages,
		selectedConversation,
		updateConversationFromMessage,
		websocketConnected,
	} = useConversation();
    const { authUser } = useAuthContext();

	const sendMessage = async (message) => {
		const content = message?.trim();
		const token = authUser?.jwt;
		if (!content || !selectedConversation?.chatId || !token) return false;

		setLoading(true);
		try {
			const res = await fetch(`${import.meta.env.VITE_API_HOST}/api/message/create`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
				},
                body: JSON.stringify({
                    chatId: selectedConversation.chatId,
                    content
                })
			});
			const data = await res.json().catch(() => null);
			if (!res.ok) {
				throw new Error(
					data?.message ||
					data?.error ||
					data?.detail ||
					"Failed to send message"
				);
			}
			if (!data?.id || !data?.chatId) {
				throw new Error("Message send response was invalid");
			}

			if (!websocketConnected) {
				setMessages((currentMessages) => {
					const existingMessages = Array.isArray(currentMessages) ? currentMessages : [];
					if (existingMessages.some((messageItem) => messageItem?.id === data.id)) {
						return existingMessages;
					}
					return [...existingMessages, data];
				});
				updateConversationFromMessage(data, authUser?.user?.id);
			}
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setLoading(false);
		}
	};

	return { sendMessage, loading };
};

export default useSendMessage;
