import useConversation from "../../zustand/useConversation";
import ChatBubble from "../ChatBubble";
import ChatMessageSender from "../ChatMessageSender";
import { formatMessageTimestamp } from "../../utils/extractTime";
import useProfile from "../../zustand/useProfile";

const Message = ({ messageData }) => {
    const { profile } = useProfile();
    const { selectedConversation, conversations } = useConversation();
    const fromMe = messageData.userId === profile?.id;
    const selectedChatId = selectedConversation?.chatId;
    const activeConversation =
        conversations?.find((conversation) => (conversation?.id ?? conversation?.chatId) === selectedChatId) ||
        selectedConversation;
    const isGroupChat = Boolean(activeConversation?.isGroup);
    const senderKey = messageData?.userId ? String(messageData.userId) : null;
    const memberDirectory = activeConversation?.memberDirectory || {};
    const memberAvatarDirectory = activeConversation?.memberAvatarDirectory || {};
    const formattedTime = formatMessageTimestamp(messageData.timeStamp);
    const profilePic = fromMe
        ? profile?.profilePicture
        : isGroupChat
            ? (senderKey ? memberAvatarDirectory[senderKey] : null)
            : activeConversation?.chatImage;
    const sender = fromMe
        ? profile?.username || "You"
        : isGroupChat
            ? (senderKey ? memberDirectory[senderKey] || "Member" : "Member")
            : activeConversation?.chatName || "Someone";

    return (
        <>
            {fromMe ? (
                <ChatMessageSender messageData={messageData} profilePic={profilePic} sender={sender} formattedTime={formattedTime}/>
            ) : (
                <ChatBubble messageData={messageData} profilePic={profilePic} sender={sender} formattedTime={formattedTime}/>
            )}
        </>
    );
};

export default Message;
