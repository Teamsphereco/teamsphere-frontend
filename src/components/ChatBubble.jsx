const ChatBubble = ({ messageData, profilePic, sender, formattedTime }) => {
  return (
    <div className="flex min-w-0 items-end gap-2">
      {profilePic ? (
        <img className="h-8 w-8 rounded-full object-cover" src={profilePic} alt={`${sender} avatar`} />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f5f5f5] text-[10px] font-semibold text-[#171717]">
          {(sender || "U").charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 max-w-[78%]">
        <div className="mb-1 flex min-w-0 items-center gap-2">
          <span className="truncate text-xs font-semibold text-[#171717]">{sender}</span>
          <span className="text-[11px] text-[#888888]">{formattedTime}</span>
        </div>
        <div className="inline-block max-w-full rounded-lg rounded-bl-sm border border-[#ebebeb] bg-white px-4 py-2 text-sm text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.03)] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {messageData.content}
        </div>
      </div>
    </div>
  );
};

export default ChatBubble;
