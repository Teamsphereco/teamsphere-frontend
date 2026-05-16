import { useRef, useCallback, useEffect, useState } from 'react'
import useGetConversations from "../../hooks/useGetConversations";
import Conversation from "./Conversation";
import CreateGroupChatFlow from "../Group/CreateGroupChatFlow";

export default function Conversations() {
    const { loading, conversations, loadMore, hasMore } = useGetConversations();
    const observer = useRef();
    const containerRef = useRef();
    const [groupFlowOpen, setGroupFlowOpen] = useState(false);

    const lastConversationRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    useEffect(() => {
        const container = containerRef.current;
        if (container && conversations.length > 0 && container.scrollHeight <= container.clientHeight && hasMore) {
            loadMore();
        }
    }, [conversations, hasMore, loadMore]);

    return (
        <aside className='relative flex min-h-0 w-full flex-1 flex-col rounded-lg border border-[#ebebeb] bg-white p-2 shadow-[0_1px_1px_rgba(0,0,0,0.03)]'>
            <div className="mb-2 flex items-center justify-between px-2 py-1">
                <div>
                    <h2 className="font-mono text-[11px] uppercase text-[#888888]">Recent Chats</h2>
                    <p className="text-xs text-[#4d4d4d]">{conversations.length} active</p>
                </div>
            </div>

            <div ref={containerRef} className='scrollbar-thin flex-1 space-y-2 overflow-y-auto pr-1 pb-16'>
                {conversations.map((conversation, index) => (
                    <div
                        ref={index === conversations.length - 1 ? lastConversationRef : null}
                        key={conversation.id}
                    >
                        <Conversation conversation={conversation} />
                    </div>
                ))}
                {loading ? (
                    <div className="px-3 py-2 text-xs text-[#888888]">Loading conversations...</div>
                ) : null}
                {!loading && conversations.length === 0 ? (
                    <div className="rounded-md border border-dashed border-[#a1a1a1] px-3 py-6 text-center text-xs text-[#4d4d4d]">
                        No chats yet. Search for a user to start messaging.
                    </div>
                ) : null}
            </div>
            <button
                type="button"
                onClick={() => setGroupFlowOpen(true)}
                className={`group absolute bottom-4 right-4 flex h-10 items-center overflow-hidden rounded-full border bg-[#171717] px-2.5 shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-[width,border-color,background-color] ease-out ${
                    groupFlowOpen
                        ? "w-[148px] border-[#171717] duration-0"
                        : "w-10 border-[#171717] duration-[70ms] hover:w-[148px]"
                }`}
                aria-label="Create group"
            >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[#171717]">
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.3" aria-hidden="true">
                        <path d="M12 5v14" />
                        <path d="M5 12h14" />
                    </svg>
                </span>
                <span
                    className={`ml-2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.08em] text-cyan-200 transition-opacity ${
                        groupFlowOpen ? "opacity-100 duration-0" : "opacity-0 duration-[70ms] group-hover:opacity-100"
                    } text-white`}
                >
                    Create group
                </span>
            </button>
            <CreateGroupChatFlow
                open={groupFlowOpen}
                onClose={() => setGroupFlowOpen(false)}
            />
        </aside>
    );
}
