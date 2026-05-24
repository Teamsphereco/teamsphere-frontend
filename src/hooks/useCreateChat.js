import { useState, useCallback } from 'react';
import { useAuthContext } from "../context/AuthContext";
import toast from 'react-hot-toast';
import useConversation from '../zustand/useConversation';

const useCreateChat = () => {
  const { authUser } = useAuthContext(); 
  const [creatingChat, setCreatingChat] = useState(false);
  const [chatData, setChatData] = useState(null);
  const { setSelectedConversation, upsertConversation } = useConversation();

  const handleCreateChat = useCallback(async (user_id, options = {}) => {
    try {
      setCreatingChat(true);

      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/chat/single`, {
          method: 'POST', 
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authUser.jwt}`
          },
          body: JSON.stringify({ userId: user_id }),
      });

      if (response.ok) {
        const newChatData = await response.json();
        setChatData(newChatData);

        const conversationSummary = {
          id: newChatData.id,
          chatName: options.username || newChatData.chatName || "New chat",
          chatImage: options.profileImageUrl || newChatData.chatImage || null,
          requestStatus: newChatData.requestStatus,
          requestedBy: newChatData.requestedBy,
          requestIncoming: false,
          lastMessage: null,
          unreadCount: 0,
        };

        upsertConversation(conversationSummary, { moveToTop: true });
        setSelectedConversation({
          chatId: newChatData.id,
          chatName: conversationSummary.chatName,
          chatImage: conversationSummary.chatImage,
          requestStatus: conversationSummary.requestStatus,
          requestedBy: conversationSummary.requestedBy,
          requestIncoming: conversationSummary.requestIncoming,
        });
        
        toast.success('Chat created successfully');
        return newChatData;
      } else {
        throw new Error('Failed to create chat');
      }
    } catch (error) {
      toast.error('Error creating chat');
      return null;
    } finally {
      setCreatingChat(false);
    }
  }, [authUser.jwt, setSelectedConversation, upsertConversation]);

  return { creatingChat, chatData, handleCreateChat };
};

export default useCreateChat;
