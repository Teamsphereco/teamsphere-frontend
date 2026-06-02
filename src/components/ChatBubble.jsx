/* eslint-disable react/prop-types */
import useSettings from "../zustand/useSettings";
import AttachmentGallery from "./Attachments/AttachmentGallery";

const densityPadding = {
  compact: "px-3 py-1.5",
  comfortable: "px-4 py-2",
  spacious: "px-5 py-3",
};

const themeClasses = {
  dark: {
    avatar: "bg-[#2b2b2b] text-white",
    name: "text-[#f5f5f5]",
    time: "text-[#b3b3b3]",
    bubble: "border-[#333333] bg-[#202020] text-[#f5f5f5]",
  },
  "high-contrast": {
    avatar: "border border-black bg-white text-black",
    name: "text-black",
    time: "text-black",
    bubble: "border-black bg-white text-black",
  },
  default: {
    avatar: "bg-[#f5f5f5] text-[#171717]",
    name: "text-[#171717]",
    time: "text-[#888888]",
    bubble: "border-[#ebebeb] bg-white text-[#171717]",
  },
};

const ChatBubble = ({ messageData, profilePic, sender, formattedTime }) => {
  const { settings } = useSettings();
  const theme = themeClasses[settings.theme] || themeClasses.default;
  const padding = densityPadding[settings.chatDensity] || densityPadding.comfortable;
  const minimal = settings.bubbleStyle === "minimal";
  const classic = settings.bubbleStyle === "classic";

  const hasContent = Boolean(messageData.content && messageData.content.trim());
  const attachments = messageData.attachments || [];

  return (
    <div className="flex min-w-0 items-end gap-2">
      {settings.showAvatars ? (
        profilePic ? (
          <img className="h-8 w-8 rounded-full object-cover" src={profilePic} alt={`${sender} avatar`} />
        ) : (
          <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-semibold ${theme.avatar}`}>
            {(sender || "U").charAt(0).toUpperCase()}
          </div>
        )
      ) : null}
      <div className="min-w-0 max-w-[78%]">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <span className={`truncate text-xs font-semibold ${theme.name}`}>{sender}</span>
          {settings.showTimestamps ? <span className={`text-[11px] ${theme.time}`}>{formattedTime}</span> : null}
        </div>
        {hasContent ? (
          <div
            className={`inline-block max-w-full border ${padding} whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${theme.bubble} ${minimal ? "shadow-none" : "shadow-[0_1px_1px_rgba(0,0,0,0.03)]"} ${classic ? "font-serif" : ""}`}
            style={{ borderRadius: `${settings.messageRadius}px`, fontSize: "var(--ts-message-font-size, 15px)" }}
          >
            {messageData.content}
          </div>
        ) : null}
        {attachments.length > 0 ? <AttachmentGallery attachments={attachments} /> : null}
      </div>
    </div>
  );
};

export default ChatBubble;
