import { useCallback, useEffect, useRef, useState } from "react";
import useSendMessage from "../hooks/useSendMessage";
import useConversation from "../zustand/useConversation";

const TYPING_DEBOUNCE_MS = 2600;
const BLUR_STOP_DELAY_MS = 3400;

const ChatInput = () => {
	const [message, setMessage] = useState("");
	const { loading, sendMessage } = useSendMessage();
	const {
		selectedConversation,
		websocketConnected,
		sendWebsocketTyping,
		setSelfTypingState,
		setDraftForChat,
		clearDraftForChat,
	} = useConversation();
	const typingTimerRef = useRef(null);
	const typingActiveRef = useRef(false);
	const activeTypingChatIdRef = useRef(null);
	const textareaRef = useRef(null);

	const emitTyping = useCallback(
		(typing, chatIdOverride) => {
			const chatId = chatIdOverride ?? selectedConversation?.chatId ?? activeTypingChatIdRef.current;
			if (!chatId) {
				return;
			}

			setSelfTypingState({ chatId, typing });
			activeTypingChatIdRef.current = typing ? chatId : null;

			if (!websocketConnected) {
				return;
			}
			if (typeof sendWebsocketTyping !== "function") {
				return;
			}
			sendWebsocketTyping(chatId, typing);
		},
		[selectedConversation?.chatId, sendWebsocketTyping, setSelfTypingState, websocketConnected]
	);

	const stopTypingNow = useCallback(() => {
		if (typingTimerRef.current) {
			clearTimeout(typingTimerRef.current);
			typingTimerRef.current = null;
		}
		if (typingActiveRef.current) {
			emitTyping(false, activeTypingChatIdRef.current);
			typingActiveRef.current = false;
		}
	}, [emitTyping]);

	const scheduleTypingStop = useCallback(
		(delay = TYPING_DEBOUNCE_MS) => {
			if (typingTimerRef.current) {
				clearTimeout(typingTimerRef.current);
			}
			typingTimerRef.current = setTimeout(() => {
				if (typingActiveRef.current) {
					emitTyping(false, activeTypingChatIdRef.current);
					typingActiveRef.current = false;
				}
				typingTimerRef.current = null;
			}, delay);
		},
		[emitTyping]
	);

	const applyMessageUpdate = useCallback(
		(nextValue) => {
			setMessage(nextValue);

			if (selectedConversation?.chatId) {
				if (nextValue.trim()) {
					setDraftForChat({
						chatId: selectedConversation.chatId,
						draft: nextValue,
					});
				} else {
					clearDraftForChat(selectedConversation.chatId);
				}
			}

			if (!nextValue.trim()) {
				scheduleTypingStop(900);
				return;
			}

			if (!typingActiveRef.current) {
				emitTyping(true);
				typingActiveRef.current = true;
			}
			scheduleTypingStop(TYPING_DEBOUNCE_MS);
		},
		[
			clearDraftForChat,
			emitTyping,
			scheduleTypingStop,
			selectedConversation?.chatId,
			setDraftForChat,
		]
	);

	useEffect(() => () => stopTypingNow(), [stopTypingNow]);

	useEffect(() => {
		stopTypingNow();
		setMessage("");
	}, [selectedConversation?.chatId, stopTypingNow]);

	useEffect(() => {
		if (!selectedConversation?.chatId) {
			return undefined;
		}

		const handleGlobalKeyDown = (event) => {
			if (event.defaultPrevented || event.isComposing) {
				return;
			}
			if (event.ctrlKey || event.metaKey || event.altKey) {
				return;
			}

			const activeElement = document.activeElement;
			const tagName = activeElement?.tagName;
			const isEditableTarget =
				activeElement &&
				(tagName === "INPUT" || tagName === "TEXTAREA" || activeElement.isContentEditable);

			if (isEditableTarget) {
				return;
			}

			const isCharacter = event.key.length === 1;
			const isBackspace = event.key === "Backspace";

			if (!isCharacter && !isBackspace) {
				return;
			}

			event.preventDefault();
			textareaRef.current?.focus({ preventScroll: true });

			if (isBackspace) {
				applyMessageUpdate(message.slice(0, -1));
				return;
			}

			applyMessageUpdate(`${message}${event.key}`);
		};

		window.addEventListener("keydown", handleGlobalKeyDown);
		return () => window.removeEventListener("keydown", handleGlobalKeyDown);
	}, [applyMessageUpdate, message, selectedConversation?.chatId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const content = message.trim();
		if (!content) return;
		const sent = await sendMessage(content);
		if (!sent) {
			return;
		}
		setMessage("");
		if (selectedConversation?.chatId) {
			clearDraftForChat(selectedConversation.chatId);
		}
		// Let typing linger briefly rather than cutting immediately.
		scheduleTypingStop(1200);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleChange = (e) => {
		const nextValue = e.target.value;
		applyMessageUpdate(nextValue);
	};

	return (
		<div className='border-t border-[#ebebeb] bg-white px-3 py-3 md:px-5'>
			<form onSubmit={handleSubmit}>
				<label htmlFor='chat' className='sr-only'>
					Your message
				</label>
				<div className='flex items-center gap-3 rounded-lg border border-[#ebebeb] bg-white p-2 shadow-[0_1px_1px_rgba(0,0,0,0.03)]'>
					<textarea
						ref={textareaRef}
						id='chat'
						rows={1}
						data-testid="chat-input-textarea"
						className='max-h-28 min-h-[44px] w-full resize-none rounded-md border-0 bg-transparent px-3 py-2 text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:ring-0'
						placeholder='Type a message...'
						value={message}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onBlur={() => scheduleTypingStop(BLUR_STOP_DELAY_MS)}
					/>
					<button
						type='submit'
						className='inline-flex h-10 w-10 items-center justify-center rounded-md bg-[#171717] text-white transition hover:bg-[#4d4d4d] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#a1a1a1]'
						disabled={loading || !message.trim()}
					>
						{loading ? (
							<div
								className='inline-block size-5 animate-spin rounded-full border-[2px] border-current border-t-transparent'
								role='status'
								aria-label='loading'
							>
								<span className='sr-only'>Loading...</span>
							</div>
						) : (
							<svg
								className='h-5 w-5 rotate-90'
								fill='currentColor'
								viewBox='0 0 20 20'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
							</svg>
						)}
					</button>
				</div>
			</form>
		</div>
	);
};

export default ChatInput;
