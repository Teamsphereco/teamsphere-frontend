import { create } from "zustand";

const normalizeCall = (call) => {
	if (!call) return null;
	const id = call.id || call.callId;
	if (!id) return null;

	return {
		...call,
		id,
		callId: id,
		chatId: call.chatId,
		callType: call.callType,
		state: call.state || call.callState,
		actorId: call.actorId,
	};
};

const removeCallFromList = (calls, callId) =>
	calls.filter((call) => call?.id !== callId && call?.callId !== callId);

const updateCallInList = (calls, updatedCall) =>
	calls.map((call) => (
		call?.id === updatedCall.id || call?.callId === updatedCall.id
			? { ...call, ...updatedCall }
			: call
	));

const soloTimeoutReasons = new Set([
	"RING_TIMEOUT",
	"SINGLE_PARTICIPANT_TIMEOUT",
]);

const disconnectNoticeFor = (call, currentCall) => {
	if (!call || !soloTimeoutReasons.has(call.endReason)) return null;
	if (currentCall?.id !== call.id) return null;

	return {
		id: `${call.id}-${call.endReason}-${Date.now()}`,
		callId: call.id,
		chatId: call.chatId,
		callType: call.callType,
		reason: call.endReason,
	};
};

const useCallStore = create((set) => ({
	currentCall: null,
	incomingCalls: [],
	joinableCalls: [],
	disconnectNotice: null,
	room: null,
	roomStatus: "idle",
	roomError: null,
	microphoneEnabled: true,
	cameraEnabled: false,
	remoteParticipants: [],

	setCurrentCall: (call) => set({ currentCall: normalizeCall(call) }),
	clearCurrentCall: () => set({ currentCall: null }),
	setRoom: (room) => set({ room }),
	setRoomStatus: (roomStatus) => set({ roomStatus }),
	setRoomError: (roomError) => set({ roomError }),
	setMicrophoneEnabled: (microphoneEnabled) => set({ microphoneEnabled }),
	setCameraEnabled: (cameraEnabled) => set({ cameraEnabled }),
	setRemoteParticipants: (remoteParticipants) => set({ remoteParticipants }),
	clearDisconnectNotice: () => set({ disconnectNotice: null }),

	addIncomingCall: (call) =>
		set((state) => {
			const normalizedCall = normalizeCall(call);
			if (!normalizedCall) return {};
			return {
				incomingCalls: [
					normalizedCall,
					...removeCallFromList(state.incomingCalls, normalizedCall.id),
				],
				joinableCalls: removeCallFromList(state.joinableCalls, normalizedCall.id),
			};
		}),

	removeIncomingCall: (callId) =>
		set((state) => ({
			incomingCalls: removeCallFromList(state.incomingCalls, callId),
		})),

	addJoinableCall: (call) =>
		set((state) => {
			const normalizedCall = normalizeCall(call);
			if (!normalizedCall) return {};
			if (state.currentCall?.id === normalizedCall.id) {
				return {};
			}
			return {
				joinableCalls: [
					normalizedCall,
					...removeCallFromList(state.joinableCalls, normalizedCall.id),
				],
				incomingCalls: removeCallFromList(state.incomingCalls, normalizedCall.id),
			};
		}),

	removeJoinableCall: (callId) =>
		set((state) => ({
			joinableCalls: removeCallFromList(state.joinableCalls, callId),
		})),

	applyCallEvent: (event, currentUserId) =>
		set((state) => {
			const call = normalizeCall(event);
			if (!call) return {};

			const terminal = call.state === "ENDED" || event.type === "CALL_ENDED";
			const declined = event.type === "CALL_DECLINED";
			const incoming = event.type === "CALL_RINGING" && event.actorId !== currentUserId;

			if (terminal || declined) {
				const disconnectNotice = terminal
					? disconnectNoticeFor(call, state.currentCall)
					: null;

				if (state.currentCall?.id === call.id && state.room) {
					state.room.disconnect();
				}

				return {
					currentCall: state.currentCall?.id === call.id ? null : state.currentCall,
					incomingCalls: removeCallFromList(state.incomingCalls, call.id),
					joinableCalls: removeCallFromList(state.joinableCalls, call.id),
					disconnectNotice: disconnectNotice || state.disconnectNotice,
					room: state.currentCall?.id === call.id ? null : state.room,
					roomStatus: state.currentCall?.id === call.id ? "idle" : state.roomStatus,
					remoteParticipants: state.currentCall?.id === call.id ? [] : state.remoteParticipants,
				};
			}

			if (incoming) {
				return {
					incomingCalls: [call, ...removeCallFromList(state.incomingCalls, call.id)],
				};
			}

			if (state.currentCall?.id === call.id) {
				return {
					currentCall: { ...state.currentCall, ...call },
					incomingCalls: updateCallInList(state.incomingCalls, call),
					joinableCalls: updateCallInList(state.joinableCalls, call),
				};
			}

			if (event.type === "CALL_UPDATED" && call.state === "ACTIVE") {
				return {
					joinableCalls: [call, ...removeCallFromList(state.joinableCalls, call.id)],
					incomingCalls: removeCallFromList(state.incomingCalls, call.id),
				};
			}

			if (event.type === "CALL_UPDATED") {
				return {
					incomingCalls: updateCallInList(state.incomingCalls, call),
					joinableCalls: updateCallInList(state.joinableCalls, call),
				};
			}

			return {};
		}),

	resetCallSession: () =>
		set({
			currentCall: null,
			incomingCalls: [],
			joinableCalls: [],
			disconnectNotice: null,
			room: null,
			roomStatus: "idle",
			roomError: null,
			microphoneEnabled: true,
			cameraEnabled: false,
			remoteParticipants: [],
		}),
}));

export default useCallStore;