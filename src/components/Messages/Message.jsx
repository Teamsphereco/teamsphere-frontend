import useConversation from "../../zustand/useConversation";
import ChatBubble from "../ChatBubble";
import ChatMessageSender from "../ChatMessageSender";
import { formatMessageTimestamp } from "../../utils/extractTime";
import useProfile from "../../zustand/useProfile";
import { useState } from "react";

const Message = ({ messageData }) => {
    const [revealed, setRevealed] = useState(false);
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

    if (!fromMe && messageData?.senderBlocked && !revealed) {
        return (
            <div className="flex min-w-0 items-center gap-2 rounded-lg border border-[#ebebeb] bg-white px-3 py-2 text-sm text-[#4d4d4d]">
                <span className="min-w-0 flex-1 truncate">Message from blocked user hidden</span>
                <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="shrink-0 rounded-md border border-[#ebebeb] bg-[#fafafa] px-2 py-1 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1]"
                >
                    Show
                </button>
            </div>
        );
    }

    const bubble = fromMe ? (
        <ChatMessageSender messageData={messageData} profilePic={profilePic} sender={sender} formattedTime={formattedTime}/>
    ) : (
        <ChatBubble messageData={messageData} profilePic={profilePic} sender={sender} formattedTime={formattedTime}/>
    );

    if (!fromMe && messageData?.senderBlocked && revealed) {
        return (
            <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 rounded-lg border border-[#ffefcf] bg-[#fff8ea] px-3 py-2 text-xs text-[#8a5a00]">
                    <span>Showing message from blocked user</span>
                    <button
                        type="button"
                        onClick={() => setRevealed(false)}
                        className="rounded-md border border-[#f0d28a] bg-white px-2 py-1 font-medium text-[#171717] transition hover:border-[#a1a1a1]"
                    >
                        Hide
                    </button>
                </div>
                {bubble}
            </div>
        );
    }

    return bubble;
};

export default Message;
