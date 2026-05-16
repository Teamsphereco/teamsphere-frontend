import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import NavigationMenu from "./../../components/NavigationMenu"
import Conversations from "../../components/Conversations/Conversations";
import MessageContainer from "../../components/Messages/MessageContainer";
import SearchForm from "../../components/SearchForm";
import useUserProfile from "../../hooks/useGetProfile";
import useConversation from "../../zustand/useConversation";

const MIN_CHATS_PANEL_WIDTH = 280;
const MAX_CHATS_PANEL_WIDTH = 680;
const DEFAULT_CHATS_PANEL_WIDTH = 392;

const clampWidth = (value) => Math.min(MAX_CHATS_PANEL_WIDTH, Math.max(MIN_CHATS_PANEL_WIDTH, value));

export default function Chat() {
  const [chatsPanelWidth, setChatsPanelWidth] = useState(DEFAULT_CHATS_PANEL_WIDTH);
  const [chatsPanelCollapsed, setChatsPanelCollapsed] = useState(false);
  const [isResizingChats, setIsResizingChats] = useState(false);
  const { selectedConversation, setSelectedConversation } = useConversation();
  const resizeStateRef = useRef({
    startX: 0,
    startWidth: DEFAULT_CHATS_PANEL_WIDTH,
  });
  const resizeCleanupRef = useRef(null);

  useUserProfile();

  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.();
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const handleResizeStart = (event) => {
    if (event.button !== 0 || chatsPanelCollapsed) return;
    resizeStateRef.current = {
      startX: event.clientX,
      startWidth: chatsPanelWidth,
    };

    resizeCleanupRef.current?.();

    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - resizeStateRef.current.startX;
      const nextWidth = clampWidth(resizeStateRef.current.startWidth + deltaX);
      setChatsPanelWidth(nextWidth);
    };

    const handleMouseUp = () => {
      setIsResizingChats(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      resizeCleanupRef.current?.();
      resizeCleanupRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    resizeCleanupRef.current = () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    setIsResizingChats(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleCloseChat = () => setSelectedConversation(null);

  return (
    <div className="min-h-screen w-full bg-[#fafafa] text-[#171717]">
      <div className="flex min-h-dvh w-full flex-col md:h-dvh md:flex-row md:overflow-hidden">
        <NavigationMenu />
        <div className={`${selectedConversation ? "hidden" : "flex"} h-14 items-center justify-between border-b border-[#ebebeb] bg-white px-4 md:hidden`}>
          <div className="min-w-0">
            <p className="font-mono text-[11px] text-[#888888]">TEAMSPHERE</p>
            <h1 className="truncate text-sm font-semibold text-[#171717]">
              {selectedConversation ? selectedConversation.chatName : "Chats"}
            </h1>
          </div>
          <Link
            to="/settings"
            className="inline-flex h-9 items-center rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717]"
          >
            Settings
          </Link>
        </div>
        <div
          data-testid="chats-panel"
          className={`hidden shrink-0 flex-col border-r border-[#ebebeb] bg-white transition-[width] duration-200 md:flex ${
            chatsPanelCollapsed ? "overflow-hidden" : ""
          }`}
          style={{ width: chatsPanelCollapsed ? "0px" : `${chatsPanelWidth}px` }}
        >
          <div className="flex min-h-0 flex-1 flex-col p-3">
            <SearchForm />
            <Conversations />
          </div>
        </div>
        <div className="relative hidden h-full w-3 shrink-0 items-stretch bg-[#fafafa] md:flex">
          <button
            type="button"
            aria-label="Resize chat list panel"
            onMouseDown={handleResizeStart}
            disabled={chatsPanelCollapsed}
            data-testid="resize-handle"
            className="group relative h-full w-full cursor-col-resize disabled:cursor-default"
          >
            <span
              className={`absolute inset-y-4 left-1/2 w-px -translate-x-1/2 rounded-full transition ${
                isResizingChats
                  ? "bg-[#171717] shadow-[0_0_0_1px_#171717]"
                  : "bg-[#ebebeb] group-hover:bg-[#a1a1a1]"
              }`}
            />
          </button>
          <button
            type="button"
            aria-label={chatsPanelCollapsed ? "Open chat list" : "Close chat list"}
            onClick={() => setChatsPanelCollapsed((value) => !value)}
            className="absolute left-1/2 top-4 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full border border-[#ebebeb] bg-white text-[#4d4d4d] shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition hover:border-[#a1a1a1] hover:text-[#171717]"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              {chatsPanelCollapsed ? <path d="m9 6 6 6-6 6" /> : <path d="m15 6-6 6 6 6" />}
            </svg>
          </button>
        </div>
        <div className={`${selectedConversation ? "hidden" : "flex"} min-h-0 flex-1 flex-col bg-white p-3 md:hidden`}>
          <SearchForm />
          <Conversations />
        </div>
        <div className={`${selectedConversation ? "flex" : "hidden"} min-h-0 flex-1 md:flex`}>
          <MessageContainer
            onCloseChat={handleCloseChat}
            showMobileBack={Boolean(selectedConversation)}
            chatsPanelCollapsed={chatsPanelCollapsed}
            onToggleChatsPanel={() => setChatsPanelCollapsed((value) => !value)}
          />
        </div>
      </div>
    </div>

  )
}
