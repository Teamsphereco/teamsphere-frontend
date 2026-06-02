/* eslint-disable react/prop-types */
import { useCallback, useEffect, useRef, useState } from "react";
import useSendMessage from "../hooks/useSendMessage";
import useAttachmentUploads from "../hooks/useAttachmentUploads";
import useConversation from "../zustand/useConversation";
import useSettings from "../zustand/useSettings";
import AttachmentStagingTray from "./Attachments/AttachmentStagingTray";

const TYPING_DEBOUNCE_MS = 2600;
const BLUR_STOP_DELAY_MS = 3400;

const densityClasses = {
	compact: {
		shell: "px-3 py-2 md:px-4",
		form: "gap-2 p-1.5",
		textarea: "min-h-[36px] px-2 py-1.5",
		button: "h-9 w-9",
	},
	comfortable: {
		shell: "px-3 py-3 md:px-5",
		form: "gap-3 p-2",
		textarea: "min-h-[44px] px-3 py-2",
		button: "h-10 w-10",
	},
	spacious: {
		shell: "px-4 py-4 md:px-6",
		form: "gap-4 p-3",
		textarea: "min-h-[54px] px-4 py-3",
		button: "h-12 w-12",
	},
};

const ChatInput = ({ disabled = false }) => {
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
	const { settings } = useSettings();
	const density = densityClasses[settings.chatDensity] || densityClasses.comfortable;
	const typingTimerRef = useRef(null);
	const typingActiveRef = useRef(false);
	const activeTypingChatIdRef = useRef(null);
	const textareaRef = useRef(null);
	const fileInputRef = useRef(null);
	const dragDepthRef = useRef(0);
	const [isDragging, setIsDragging] = useState(false);
	const {
		items: attachmentItems,
		isUploading: attachmentsUploading,
		readyAttachmentIds,
		addFiles,
		retryItem,
		removeItem,
		reset: resetAttachments,
	} = useAttachmentUploads(selectedConversation?.chatId);

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
			if (disabled) {
				return;
			}
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
	}, [applyMessageUpdate, disabled, message, selectedConversation?.chatId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (disabled) return;
		const content = message.trim();
		if (!content && readyAttachmentIds.length === 0) return;
		if (attachmentsUploading) return;
		const sent = await sendMessage(content, readyAttachmentIds);
		if (!sent) {
			return;
		}
		setMessage("");
		resetAttachments();
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
		if (disabled) return;
		const nextValue = e.target.value;
		applyMessageUpdate(nextValue);
	};

	const handleFilePick = (e) => {
		const { files } = e.target;
		if (files?.length) {
			addFiles(files);
		}
		e.target.value = "";
	};

	const handlePaste = (e) => {
		if (disabled) return;
		const files = Array.from(e.clipboardData?.files || []);
		if (files.length) {
			e.preventDefault();
			addFiles(files);
		}
	};

	const handleDragEnter = (e) => {
		if (disabled) return;
		if (!Array.from(e.dataTransfer?.types || []).includes("Files")) return;
		e.preventDefault();
		dragDepthRef.current += 1;
		setIsDragging(true);
	};

	const handleDragOver = (e) => {
		if (disabled) return;
		if (Array.from(e.dataTransfer?.types || []).includes("Files")) {
			e.preventDefault();
		}
	};

	const handleDragLeave = (e) => {
		if (disabled) return;
		e.preventDefault();
		dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
		if (dragDepthRef.current === 0) {
			setIsDragging(false);
		}
	};

	const handleDrop = (e) => {
		if (disabled) return;
		e.preventDefault();
		dragDepthRef.current = 0;
		setIsDragging(false);
		const files = e.dataTransfer?.files;
		if (files?.length) {
			addFiles(files);
		}
	};

	const canSend = !disabled && !loading && !attachmentsUploading
		&& (Boolean(message.trim()) || readyAttachmentIds.length > 0);

	return (
		<div
			className={`relative border-t border-[#ebebeb] bg-white ${density.shell}`}
			onDragEnter={handleDragEnter}
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			{isDragging && (
				<div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-[#171717] bg-white/85 text-sm font-semibold text-[#171717]">
					Drop files to attach
				</div>
			)}
			<AttachmentStagingTray items={attachmentItems} onRetry={retryItem} onRemove={removeItem} />
			<form onSubmit={handleSubmit}>
				<label htmlFor='chat' className='sr-only'>
					Your message
				</label>
				<input
					ref={fileInputRef}
					type="file"
					multiple
					data-testid="attachment-file-input"
					className="hidden"
					onChange={handleFilePick}
				/>
				<div className={`flex items-center rounded-lg border border-[#ebebeb] bg-white ${density.form} shadow-[0_1px_1px_rgba(0,0,0,0.03)]`}>
					<button
						type='button'
						aria-label='Attach files'
						data-testid="attachment-button"
						onClick={() => fileInputRef.current?.click()}
						disabled={disabled || !selectedConversation?.chatId}
						className={`inline-flex shrink-0 items-center justify-center rounded-md text-[#888888] transition hover:bg-[#f5f5f5] hover:text-[#171717] disabled:cursor-not-allowed disabled:opacity-40 ${density.button}`}
					>
						<svg className='h-5 w-5' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
							<path strokeLinecap='round' strokeLinejoin='round' d='M21.44 11.05l-9.19 9.19a5 5 0 01-7.07-7.07l9.19-9.19a3 3 0 014.24 4.24l-9.2 9.19a1 1 0 01-1.41-1.41l8.49-8.49' />
						</svg>
					</button>
					<textarea
						ref={textareaRef}
						id='chat'
						rows={1}
						data-testid="chat-input-textarea"
						className={`max-h-28 w-full resize-none rounded-md border-0 bg-transparent text-sm text-[#171717] placeholder:text-[#888888] focus:outline-none focus:ring-0 ${density.textarea}`}
						placeholder={disabled ? "Messaging unavailable" : "Type a message..."}
						value={message}
						onChange={handleChange}
						onKeyDown={handleKeyDown}
						onPaste={handlePaste}
						onBlur={() => scheduleTypingStop(BLUR_STOP_DELAY_MS)}
						disabled={disabled}
					/>
					<button
						type='submit'
						className={`inline-flex items-center justify-center rounded-md bg-[#171717] text-white transition hover:bg-[#4d4d4d] disabled:cursor-not-allowed disabled:bg-[#f5f5f5] disabled:text-[#a1a1a1] ${density.button}`}
						disabled={!canSend}
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
