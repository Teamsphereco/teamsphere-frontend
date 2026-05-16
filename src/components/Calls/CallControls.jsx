/* eslint-disable react/prop-types */
import { useEffect, useRef, useState } from "react";
import useCalls from "../../hooks/useCalls";

const CallIcon = () => (
	<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.3 1.3.4 2.6.6 4 .6.6 0 1 .4 1 1v3.5c0 .6-.4 1-1 1C10.9 21 3 13.1 3 3.5c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.4.2 2.7.6 4 .1.4 0 .9-.3 1.2l-2.2 2.1Z"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const VideoIcon = () => (
	<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M4 7.5c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v9c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2v-9Z"
			stroke="currentColor"
			strokeWidth="1.8"
		/>
		<path
			d="m16 10 4-2.5v9L16 14"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const MicIcon = ({ muted }) => (
	<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3Z"
			stroke="currentColor"
			strokeWidth="1.8"
		/>
		<path
			d="M5 11a7 7 0 0 0 14 0M12 18v3"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
		/>
		{muted ? (
			<path d="M4 4l16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
		) : null}
	</svg>
);

const EndIcon = () => (
	<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M5 15.5c4.4-3.4 9.6-3.4 14 0l-2.4 2.8c-.4.5-1.1.6-1.7.3l-1.8-.9a2.5 2.5 0 0 0-2.2 0l-1.8.9c-.6.3-1.3.2-1.7-.3L5 15.5Z"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const SettingsIcon = () => (
	<svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
		<path
			d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
			stroke="currentColor"
			strokeWidth="1.8"
		/>
		<path
			d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 0 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2a2 2 0 0 1-4 0V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 0 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H2.8a2 2 0 0 1 0-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7A2 2 0 0 1 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2a2 2 0 0 1 4 0V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 0 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2a2 2 0 0 1 0 4H21a1.7 1.7 0 0 0-1.6 1Z"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

const buttonBase = "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
const iconButtonBase = "inline-flex h-9 w-9 items-center justify-center rounded-md transition disabled:cursor-not-allowed disabled:opacity-60";

const deviceLabel = (device, fallback) => device?.label || fallback;

const CallControls = ({ conversation }) => {
	const [settingsOpen, setSettingsOpen] = useState(false);
	const settingsRef = useRef(null);
	const chatId = conversation?.chatId || conversation?.id;
	const {
		currentCall,
		incomingCalls,
		joinableCalls,
		roomStatus,
		microphoneEnabled,
		cameraEnabled,
		audioInputDevices,
		audioOutputDevices,
		selectedAudioInputDeviceId,
		selectedAudioOutputDeviceId,
		remoteParticipants,
		actionLoading,
		startCall,
		acceptCall,
		declineCall,
		endCurrentCall,
		toggleMicrophone,
		toggleCamera,
		refreshAudioDevices,
		selectAudioInputDevice,
		selectAudioOutputDevice,
	} = useCalls();

	const callForChat = currentCall?.chatId === chatId ? currentCall : null;
	const incomingCall = incomingCalls.find((call) => call?.chatId === chatId);
	const joinableCall = joinableCalls.find((call) => call?.chatId === chatId);
	const activeCall = callForChat || incomingCall || joinableCall;
	const connected = roomStatus === "connected";

	useEffect(() => {
		if (!settingsOpen) return undefined;

		const handlePointerDown = (event) => {
			if (!settingsRef.current?.contains(event.target)) {
				setSettingsOpen(false);
			}
		};

		document.addEventListener("mousedown", handlePointerDown);
		return () => document.removeEventListener("mousedown", handlePointerDown);
	}, [settingsOpen]);

	if (!chatId) return null;

	if (!activeCall) {
		return (
			<div className="flex items-center gap-2">
				<button
					type="button"
					title="Start audio call"
					onClick={() => startCall({ chatId, callType: "AUDIO" })}
					disabled={actionLoading}
					className={`${iconButtonBase} border border-[#ebebeb] bg-white text-[#171717] hover:border-[#a1a1a1]`}
				>
					<CallIcon />
				</button>
				<button
					type="button"
					title="Start video call"
					onClick={() => startCall({ chatId, callType: "VIDEO" })}
					disabled={actionLoading}
					className={`${iconButtonBase} border border-[#ebebeb] bg-white text-[#171717] hover:border-[#a1a1a1]`}
				>
					<VideoIcon />
				</button>
			</div>
		);
	}

	if (incomingCall && !callForChat) {
		return (
			<div className="flex items-center gap-2 rounded-md border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1">
				<span className="hidden text-xs font-medium text-[#1d4ed8] sm:inline">
					{incomingCall.callType === "VIDEO" ? "Video" : "Audio"} call
				</span>
				<button
					type="button"
					onClick={() => acceptCall(incomingCall.id)}
					disabled={actionLoading}
					className={`${buttonBase} bg-emerald-500 text-white hover:bg-emerald-400`}
				>
					Answer
				</button>
				<button
					type="button"
					onClick={() => declineCall(incomingCall.id)}
					disabled={actionLoading}
					className={`${iconButtonBase} bg-rose-500 text-white hover:bg-rose-400`}
					title="Decline call"
				>
					<EndIcon />
				</button>
			</div>
		);
	}

	if (joinableCall && !callForChat) {
		return (
			<div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1">
				<span className="hidden text-xs font-medium text-emerald-700 sm:inline">
					Group call active
				</span>
				<button
					type="button"
					onClick={() => acceptCall(joinableCall.id)}
					disabled={actionLoading}
					className={`${buttonBase} bg-emerald-500 text-white hover:bg-emerald-400`}
				>
					Join
				</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2 rounded-md border border-[#ebebeb] bg-white px-2 py-1">
			<span className="hidden max-w-32 truncate text-xs font-medium text-[#4d4d4d] lg:inline">
				{connected ? "Connected" : roomStatus === "connecting" ? "Connecting" : "Call"}
				{remoteParticipants.length > 0 ? ` +${remoteParticipants.length}` : ""}
			</span>
			<button
				type="button"
				onClick={toggleMicrophone}
				disabled={!connected || actionLoading}
				className={`${iconButtonBase} ${microphoneEnabled ? "text-[#171717] hover:bg-[#fafafa]" : "bg-red-50 text-red-600"}`}
				title={microphoneEnabled ? "Mute microphone" : "Unmute microphone"}
			>
				<MicIcon muted={!microphoneEnabled} />
			</button>
			{activeCall.callType === "VIDEO" ? (
				<button
					type="button"
					onClick={toggleCamera}
					disabled={!connected || actionLoading}
					className={`${iconButtonBase} ${cameraEnabled ? "text-[#171717] hover:bg-[#fafafa]" : "bg-[#f5f5f5] text-[#888888]"}`}
					title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
				>
					<VideoIcon />
				</button>
			) : null}
			<div className="relative" ref={settingsRef}>
				<button
					type="button"
					onClick={() => {
						setSettingsOpen((open) => !open);
						void refreshAudioDevices();
					}}
					disabled={!connected || actionLoading}
					className={`${iconButtonBase} text-[#171717] hover:bg-[#fafafa]`}
					title="Audio settings"
				>
					<SettingsIcon />
				</button>
				{settingsOpen ? (
					<div className="absolute right-0 top-11 z-30 w-72 rounded-lg border border-[#ebebeb] bg-white p-3 shadow-[0_12px_36px_rgba(0,0,0,0.14)]">
						<label className="block text-xs font-medium text-[#4d4d4d]">
							Microphone
							<select
								value={selectedAudioInputDeviceId}
								onChange={(event) => selectAudioInputDevice(event.target.value)}
								className="mt-1 w-full rounded-md border border-[#ebebeb] bg-white px-2 py-2 text-sm text-[#171717] outline-none focus:border-[#171717]"
							>
								<option value="">System default</option>
								{audioInputDevices.map((device, index) => (
									<option key={device.deviceId || index} value={device.deviceId}>
										{deviceLabel(device, `Microphone ${index + 1}`)}
									</option>
								))}
							</select>
						</label>
						<label className="mt-3 block text-xs font-medium text-[#4d4d4d]">
							Speaker
							<select
								value={selectedAudioOutputDeviceId}
								onChange={(event) => selectAudioOutputDevice(event.target.value)}
								className="mt-1 w-full rounded-md border border-[#ebebeb] bg-white px-2 py-2 text-sm text-[#171717] outline-none focus:border-[#171717]"
							>
								<option value="">System default</option>
								{audioOutputDevices.map((device, index) => (
									<option key={device.deviceId || index} value={device.deviceId}>
										{deviceLabel(device, `Speaker ${index + 1}`)}
									</option>
								))}
							</select>
						</label>
					</div>
				) : null}
			</div>
			<button
				type="button"
				onClick={() => endCurrentCall()}
				disabled={actionLoading}
				className={`${iconButtonBase} bg-rose-500 text-white hover:bg-rose-400`}
				title="End call"
			>
				<EndIcon />
			</button>
		</div>
	);
};

export default CallControls;