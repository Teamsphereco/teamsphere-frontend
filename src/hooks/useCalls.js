import { useCallback, useEffect, useRef, useState } from "react";
import { Room, RoomEvent } from "livekit-client";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";
import {
	acceptCall as acceptCallRequest,
	createJoinToken,
	declineCall as declineCallRequest,
	endCall as endCallRequest,
	getActiveCalls,
	initiateCall,
} from "../utils/callApi";
import useCallStore from "../zustand/useCallStore";

const participantSummary = (participant) => ({
	identity: participant.identity,
	name: participant.name || participant.identity,
});

const useCalls = () => {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const currentUserId = authUser?.user?.id;
	const [actionLoading, setActionLoading] = useState(false);
	const [audioInputDevices, setAudioInputDevices] = useState([]);
	const [audioOutputDevices, setAudioOutputDevices] = useState([]);
	const [selectedAudioInputDeviceId, setSelectedAudioInputDeviceId] = useState("");
	const [selectedAudioOutputDeviceId, setSelectedAudioOutputDeviceId] = useState("");
	const roomRef = useRef(null);

	const {
		currentCall,
		incomingCalls,
		joinableCalls,
		roomStatus,
		roomError,
		microphoneEnabled,
		cameraEnabled,
		remoteParticipants,
		setCurrentCall,
		clearCurrentCall,
		setRoom,
		setRoomStatus,
		setRoomError,
		setMicrophoneEnabled,
		setCameraEnabled,
		setRemoteParticipants,
		addIncomingCall,
		removeIncomingCall,
		addJoinableCall,
		removeJoinableCall,
		resetCallSession,
	} = useCallStore();

	const syncRemoteParticipants = useCallback((roomInstance) => {
		setRemoteParticipants(
			Array.from(roomInstance.remoteParticipants.values()).map(participantSummary)
		);
	}, [setRemoteParticipants]);

	const refreshAudioDevices = useCallback(async () => {
		if (!navigator.mediaDevices?.enumerateDevices) {
			setAudioInputDevices([]);
			setAudioOutputDevices([]);
			return;
		}

		try {
			const devices = await navigator.mediaDevices.enumerateDevices();
			setAudioInputDevices(devices.filter((device) => device.kind === "audioinput"));
			setAudioOutputDevices(devices.filter((device) => device.kind === "audiooutput"));
		} catch {
			setAudioInputDevices([]);
			setAudioOutputDevices([]);
		}
	}, []);

	const disconnectRoom = useCallback(async ({ clearCall = false } = {}) => {
		const roomInstance = roomRef.current;
		roomRef.current = null;

		if (roomInstance) {
			roomInstance.disconnect();
		}

		setRoom(null);
		setRemoteParticipants([]);
		setRoomStatus("idle");
		setMicrophoneEnabled(true);
		setCameraEnabled(false);

		if (clearCall) {
			clearCurrentCall();
		}
	}, [clearCurrentCall, setCameraEnabled, setMicrophoneEnabled, setRemoteParticipants, setRoom, setRoomStatus]);

	const connectToRoom = useCallback(async (call, { enableCamera = false } = {}) => {
		if (!token || !call?.id) {
			throw new Error("Call is not ready to join");
		}

		setRoomStatus("connecting");
		setRoomError(null);

		const joinInfo = await createJoinToken({ token, callId: call.id });
		await disconnectRoom();

		const roomInstance = new Room({
			adaptiveStream: true,
			dynacast: true,
		});

		roomInstance.on(RoomEvent.ParticipantConnected, () => syncRemoteParticipants(roomInstance));
		roomInstance.on(RoomEvent.ParticipantDisconnected, () => syncRemoteParticipants(roomInstance));
		roomInstance.on(RoomEvent.Disconnected, () => {
			roomRef.current = null;
			setRoom(null);
			setRoomStatus("idle");
			setRemoteParticipants([]);
		});

		await roomInstance.connect(joinInfo.liveKitUrl, joinInfo.token);
		roomRef.current = roomInstance;
		setRoom(roomInstance);
		setRoomStatus("connected");
		syncRemoteParticipants(roomInstance);

		if (selectedAudioInputDeviceId) {
			await roomInstance.switchActiveDevice("audioinput", selectedAudioInputDeviceId);
		}
		if (selectedAudioOutputDeviceId) {
			await roomInstance.switchActiveDevice("audiooutput", selectedAudioOutputDeviceId);
		}

		await roomInstance.localParticipant.setMicrophoneEnabled(true);
		setMicrophoneEnabled(true);
		void refreshAudioDevices();

		if (enableCamera) {
			await roomInstance.localParticipant.setCameraEnabled(true);
			setCameraEnabled(true);
		}
	}, [
		disconnectRoom,
		setCameraEnabled,
		setMicrophoneEnabled,
		setRemoteParticipants,
		setRoom,
		setRoomError,
		setRoomStatus,
		selectedAudioInputDeviceId,
		selectedAudioOutputDeviceId,
		refreshAudioDevices,
		syncRemoteParticipants,
		token,
	]);

	const cleanupFailedJoin = useCallback(async (callId) => {
		await disconnectRoom({ clearCall: true });

		if (!callId || !token) return;

		try {
			await endCallRequest({ token, callId, reason: "MEDIA_CONNECT_FAILED" });
		} catch {
			// Best effort cleanup; the original LiveKit connection error is more useful to show.
		}
	}, [disconnectRoom, token]);

	const startCall = useCallback(async ({ chatId, callType }) => {
		if (!chatId || !token) return false;
		setActionLoading(true);
		let call = null;
		try {
			call = await initiateCall({ token, chatId, callType });
			removeIncomingCall(call.id);
			removeJoinableCall(call.id);
			setCurrentCall(call);
			await connectToRoom(call, { enableCamera: callType === "VIDEO" });
			return true;
		} catch (error) {
			await cleanupFailedJoin(call?.id);
			setRoomStatus("idle");
			setRoomError(error.message);
			toast.error(error.message);
			return false;
		} finally {
			setActionLoading(false);
		}
	}, [cleanupFailedJoin, connectToRoom, removeIncomingCall, removeJoinableCall, setCurrentCall, setRoomError, setRoomStatus, token]);

	const acceptCall = useCallback(async (callId) => {
		if (!callId || !token) return false;
		setActionLoading(true);
		let call = null;
		try {
			call = await acceptCallRequest({ token, callId });
			removeIncomingCall(callId);
			removeJoinableCall(callId);
			setCurrentCall(call);
			await connectToRoom(call, { enableCamera: call.callType === "VIDEO" });
			return true;
		} catch (error) {
			await cleanupFailedJoin(call?.id || callId);
			setRoomStatus("idle");
			setRoomError(error.message);
			toast.error(error.message);
			return false;
		} finally {
			setActionLoading(false);
		}
	}, [cleanupFailedJoin, connectToRoom, removeIncomingCall, removeJoinableCall, setCurrentCall, setRoomError, setRoomStatus, token]);

	const declineCall = useCallback(async (callId) => {
		if (!callId || !token) return false;
		setActionLoading(true);
		try {
			await declineCallRequest({ token, callId });
			removeIncomingCall(callId);
			removeJoinableCall(callId);
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setActionLoading(false);
		}
	}, [removeIncomingCall, removeJoinableCall, token]);

	const endCurrentCall = useCallback(async (reason = "USER_HANGUP") => {
		const callId = currentCall?.id;
		if (!callId || !token) {
			await disconnectRoom({ clearCall: true });
			return false;
		}

		setActionLoading(true);
		try {
			const call = await endCallRequest({ token, callId, reason });
			await disconnectRoom({ clearCall: true });
			if (call?.state === "ACTIVE") {
				addJoinableCall(call);
			}
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		} finally {
			setActionLoading(false);
		}
	}, [addJoinableCall, currentCall?.id, disconnectRoom, token]);

	const toggleMicrophone = useCallback(async () => {
		const roomInstance = roomRef.current;
		if (!roomInstance) return false;
		const nextEnabled = !microphoneEnabled;
		try {
			await roomInstance.localParticipant.setMicrophoneEnabled(nextEnabled);
			setMicrophoneEnabled(nextEnabled);
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		}
	}, [microphoneEnabled, setMicrophoneEnabled]);

	const toggleCamera = useCallback(async () => {
		const roomInstance = roomRef.current;
		if (!roomInstance) return false;
		const nextEnabled = !cameraEnabled;
		try {
			await roomInstance.localParticipant.setCameraEnabled(nextEnabled);
			setCameraEnabled(nextEnabled);
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		}
	}, [cameraEnabled, setCameraEnabled]);

	const selectAudioInputDevice = useCallback(async (deviceId) => {
		setSelectedAudioInputDeviceId(deviceId);
		const roomInstance = roomRef.current;
		if (!roomInstance || !deviceId) return true;

		try {
			await roomInstance.switchActiveDevice("audioinput", deviceId);
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		}
	}, []);

	const selectAudioOutputDevice = useCallback(async (deviceId) => {
		setSelectedAudioOutputDeviceId(deviceId);
		const roomInstance = roomRef.current;
		if (!roomInstance || !deviceId) return true;

		try {
			await roomInstance.switchActiveDevice("audiooutput", deviceId);
			return true;
		} catch (error) {
			toast.error(error.message);
			return false;
		}
	}, []);

	useEffect(() => {
		void refreshAudioDevices();
		const mediaDevices = navigator.mediaDevices;
		if (!mediaDevices?.addEventListener) return undefined;

		mediaDevices.addEventListener("devicechange", refreshAudioDevices);
		return () => mediaDevices.removeEventListener("devicechange", refreshAudioDevices);
	}, [refreshAudioDevices]);

	useEffect(() => {
		if (!token || !currentUserId) {
			void disconnectRoom({ clearCall: true });
			resetCallSession();
			return;
		}

		let cancelled = false;
		const loadActiveCalls = async () => {
			try {
				const calls = await getActiveCalls({ token });
				if (cancelled || !Array.isArray(calls)) return;

				for (const call of calls) {
					const participant = call?.participants?.find(
						(item) => String(item?.userId) === String(currentUserId)
					);

					if (participant?.participantState === "RINGING") {
						addIncomingCall(call);
						continue;
					}

					if (participant?.participantState === "ACTIVE") {
						setCurrentCall(call);
						continue;
					}

					if (call?.state === "ACTIVE") {
						addJoinableCall(call);
					}
				}
			} catch {
				// Non-blocking: realtime events will still hydrate call state.
			}
		};

		void loadActiveCalls();

		return () => {
			cancelled = true;
		};
	}, [addIncomingCall, addJoinableCall, currentUserId, disconnectRoom, resetCallSession, setCurrentCall, token]);

	useEffect(() => {
		if (currentCall?.state === "ENDED") {
			void disconnectRoom({ clearCall: true });
		}
	}, [currentCall?.state, disconnectRoom]);

	useEffect(() => () => {
		void disconnectRoom({ clearCall: true });
	}, [disconnectRoom]);

	return {
		currentCall,
		incomingCalls,
		joinableCalls,
		roomStatus,
		roomError,
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
	};
};

export default useCalls;