const ChatMessageSender = ({ messageData, profilePic, sender, formattedTime }) => {
    return (
    <div className="flex min-w-0 items-end justify-end gap-2">
      <div className="flex min-w-0 max-w-[78%] flex-col items-end">
        <div className="mb-1 flex min-w-0 items-center justify-end gap-2">
          <span className="text-[11px] text-[#888888]">{formattedTime}</span>
          <span className="truncate text-xs font-semibold text-[#171717]">{sender}</span>
        </div>
        <div className="inline-block max-w-full rounded-lg rounded-br-sm bg-[#171717] px-4 py-2 text-sm text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
          {messageData.content}
        </div>
      </div>
      {profilePic ? (
        <img className="h-8 w-8 rounded-full object-cover" src={profilePic} alt={`${sender} avatar`} />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold text-white">
          {(sender || "U").charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ChatMessageSender;
