/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { RoomEvent, Track } from "livekit-client";
import { useAuthContext } from "../../context/AuthContext";
import useCallStore from "../../zustand/useCallStore";

const roomRefreshEvents = [
	RoomEvent.ParticipantConnected,
	RoomEvent.ParticipantDisconnected,
	RoomEvent.TrackPublished,
	RoomEvent.TrackUnpublished,
	RoomEvent.TrackSubscribed,
	RoomEvent.TrackUnsubscribed,
	RoomEvent.TrackMuted,
	RoomEvent.TrackUnmuted,
	RoomEvent.LocalTrackPublished,
	RoomEvent.LocalTrackUnpublished,
	RoomEvent.ActiveSpeakersChanged,
	RoomEvent.ConnectionStateChanged,
	RoomEvent.Disconnected,
];

const participantName = (participant) =>
	participant?.name || participant?.identity || "Participant";

const participantStateLabel = (state) => {
	switch (state) {
		case "ACTIVE":
			return "Joined";
		case "RINGING":
			return "Ringing";
		case "MISSED":
			return "Missed";
		case "DECLINED":
			return "Declined";
		case "LEFT":
			return "Left";
		default:
			return "Invited";
	}
};

const isJoinedParticipant = ({ participant, callParticipant }) =>
	!!participant || callParticipant?.participantState === "ACTIVE";

const isPendingParticipant = ({ callParticipant }) =>
	callParticipant?.participantState === "RINGING"
		|| callParticipant?.participantState === "INVITED";

const participantInitials = (participant) => {
	const name = participantName(participant);
	return name
		.split(/[\s._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("") || "P";
};

const publicationFrom = (participant, kind, source) => {
	const publications = kind === "video"
		? participant?.videoTrackPublications
		: participant?.audioTrackPublications;

	if (!publications) return null;
	const publicationList = Array.from(publications.values());
	return publicationList.find((publication) => publication.source === source)
		|| publicationList[0]
		|| null;
};

const AttachedTrack = ({ track, kind, muted = false, className = "" }) => {
	const [element, setElement] = useState(null);

	useEffect(() => {
		if (!track || !element) return undefined;

		track.attach(element);
		return () => {
			track.detach(element);
		};
	}, [element, track]);

	if (kind === "audio") {
		return (
			<audio
				ref={setElement}
				autoPlay
				playsInline
				muted={muted}
				className="hidden"
			/>
		);
	}

	return (
		<video
			ref={setElement}
			autoPlay
			playsInline
			muted={muted}
			className={className}
		/>
	);
};

const VideoTile = ({ participant, callParticipant, local }) => {
	const cameraPublication = publicationFrom(participant, "video", Track.Source.Camera);
	const microphonePublication = publicationFrom(participant, "audio", Track.Source.Microphone);
	const videoTrack = cameraPublication?.isMuted ? null : cameraPublication?.track;
	const audioTrack = microphonePublication?.isMuted ? null : microphonePublication?.track;
	const microphoneMuted = participant ? !microphonePublication || microphonePublication.isMuted : true;
	const speaking = !!participant?.isSpeaking;
	const label = local ? "You" : callParticipant?.username || participantName(participant);
	const statusLabel = participant
		? microphoneMuted ? "Muted" : speaking ? "Speaking" : "Mic on"
		: participantStateLabel(callParticipant?.participantState);

	return (
		<div className={`relative flex min-h-0 overflow-hidden rounded-lg border bg-slate-950 transition ${
			speaking ? "border-emerald-300 shadow-[0_0_0_1px_rgba(110,231,183,0.45)]" : "border-slate-700"
		}`}>
			{videoTrack ? (
				<AttachedTrack
					track={videoTrack}
					kind="video"
					muted={local}
					className="h-full min-h-[180px] w-full object-cover"
				/>
			) : (
				<div className="flex min-h-[180px] w-full items-center justify-center bg-slate-800 text-2xl font-semibold text-slate-200">
					{participantInitials({ name: label })}
				</div>
			)}
			{audioTrack && !local ? (
				<AttachedTrack track={audioTrack} kind="audio" />
			) : null}
			<div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-md bg-slate-950/75 px-2 py-1 text-xs text-slate-100 backdrop-blur">
				<span className="truncate font-medium">{label}</span>
				<span className={microphoneMuted && participant ? "text-rose-200" : "text-emerald-200"}>
					{statusLabel}
				</span>
			</div>
		</div>
	);
};

const AudioParticipant = ({ participant, callParticipant, local }) => {
	const microphonePublication = publicationFrom(participant, "audio", Track.Source.Microphone);
	const audioTrack = microphonePublication?.isMuted ? null : microphonePublication?.track;
	const microphoneMuted = participant ? !microphonePublication || microphonePublication.isMuted : true;
	const speaking = !!participant?.isSpeaking;
	const label = local ? "You" : callParticipant?.username || participantName(participant);
	const statusLabel = participant
		? microphoneMuted ? "Muted" : speaking ? "Speaking" : "Mic on"
		: participantStateLabel(callParticipant?.participantState);

	return (
		<div className={`flex min-w-0 items-center gap-3 rounded-lg border bg-slate-800/80 px-3 py-3 transition ${
			speaking ? "border-emerald-300 shadow-[0_0_0_1px_rgba(110,231,183,0.45)]" : "border-slate-700"
		}`}>
			{audioTrack && !local ? <AttachedTrack track={audioTrack} kind="audio" /> : null}
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-700 text-sm font-semibold text-slate-100">
				{participantInitials({ name: label })}
			</div>
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold text-slate-100">
					{label}
				</p>
				<p className={microphoneMuted && participant ? "text-xs text-rose-200" : "text-xs text-emerald-200"}>
					{statusLabel}
				</p>
			</div>
		</div>
	);
};

const CallStage = ({ conversation }) => {
	const { authUser } = useAuthContext();
	const currentUserId = authUser?.user?.id;
	const chatId = conversation?.chatId || conversation?.id;
	const {
		currentCall,
		incomingCalls,
		joinableCalls,
		room,
		roomStatus,
		roomError,
	} = useCallStore();
	const [renderTick, setRenderTick] = useState(0);

	useEffect(() => {
		if (!room) return undefined;

		const refreshRoom = () => setRenderTick((value) => value + 1);
		roomRefreshEvents.forEach((eventName) => room.on(eventName, refreshRoom));
		refreshRoom();

		return () => {
			roomRefreshEvents.forEach((eventName) => room.off(eventName, refreshRoom));
		};
	}, [room]);

	const activeCall = currentCall?.chatId === chatId ? currentCall : null;
	const incomingCall = incomingCalls.find((call) => call?.chatId === chatId);
	const joinableCall = joinableCalls.find((call) => call?.chatId === chatId);
	const visibleCall = activeCall || incomingCall || joinableCall;

	const participants = useMemo(() => {
		const liveParticipants = new Map();
		if (room?.localParticipant) {
			liveParticipants.set(String(room.localParticipant.identity), {
				participant: room.localParticipant,
				local: true,
			});
		}
		if (room?.remoteParticipants) {
			Array.from(room.remoteParticipants.values()).forEach((participant) => {
				liveParticipants.set(String(participant.identity), {
					participant,
					local: false,
				});
			});
		}

		const callParticipants = Array.isArray(visibleCall?.participants)
			? visibleCall.participants
			: [];
		const roster = callParticipants.map((callParticipant) => {
			const userKey = String(callParticipant?.userId);
			const liveParticipant = liveParticipants.get(userKey);
			if (liveParticipant) {
				liveParticipants.delete(userKey);
			}
			return {
				...liveParticipant,
				callParticipant,
				local: liveParticipant?.local || String(callParticipant?.userId) === String(currentUserId),
			};
		});

		return [
			...roster,
			...Array.from(liveParticipants.values()),
		].filter((item) => item.participant || item.callParticipant);
	}, [currentUserId, renderTick, room, visibleCall]);
	const joinedCount = participants.filter(isJoinedParticipant).length;
	const ringingCount = visibleCall?.state === "RINGING"
		? participants.filter(isPendingParticipant).length
		: 0;
	const visibleParticipants = participants.filter((item) => {
		if (isJoinedParticipant(item)) return true;
		return visibleCall?.state === "RINGING" && isPendingParticipant(item);
	});

	if (!chatId || !visibleCall) return null;

	if (incomingCall && !activeCall) {
		return (
			<div className="border-b border-cyan-400/20 bg-cyan-500/10 px-5 py-3 text-sm font-medium text-cyan-100">
				Incoming {incomingCall.callType === "VIDEO" ? "video" : "audio"} call
			</div>
		);
	}

	if (joinableCall && !activeCall) {
		return (
			<div className="border-b border-emerald-400/20 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-100">
				Group call active
			</div>
		);
	}

	const connecting = roomStatus === "connecting";
	const connected = roomStatus === "connected";

	return (
		<section className="border-b border-slate-700/70 bg-slate-950/70 px-4 py-4 md:px-5">
			<div className="mb-3 flex items-center justify-between gap-3">
				<div className="min-w-0">
					<p className="truncate text-sm font-semibold text-slate-100">
						{visibleCall.callType === "VIDEO" ? "Video call" : "Audio call"}
					</p>
					<p className="text-xs text-slate-400">
						{connected ? "Connected" : connecting ? "Connecting" : roomStatus}
					</p>
				</div>
				<span className="shrink-0 rounded-md border border-slate-700 px-2 py-1 text-xs font-medium text-slate-300">
					{joinedCount || (connected ? 1 : 0)} joined
					{ringingCount > 0 ? ` · ${ringingCount} ringing` : ""}
				</span>
			</div>

			{roomError ? (
				<p className="mb-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
					{roomError}
				</p>
			) : null}

			{visibleCall.callType === "VIDEO" ? (
				<div className={`grid gap-3 ${visibleParticipants.length > 1 ? "md:grid-cols-2 xl:grid-cols-3" : "grid-cols-1"}`}>
					{visibleParticipants.length > 0 ? visibleParticipants.map(({ participant, callParticipant, local }) => (
						<VideoTile
							key={callParticipant?.userId || participant?.sid || participant?.identity}
							participant={participant}
							callParticipant={callParticipant}
							local={local}
						/>
					)) : (
						<div className="flex min-h-[180px] items-center justify-center rounded-lg border border-slate-700 bg-slate-800 text-sm text-slate-300">
							Waiting for media
						</div>
					)}
				</div>
			) : (
				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{visibleParticipants.length > 0 ? visibleParticipants.map(({ participant, callParticipant, local }) => (
						<AudioParticipant
							key={callParticipant?.userId || participant?.sid || participant?.identity}
							participant={participant}
							callParticipant={callParticipant}
							local={local}
						/>
					)) : (
						<div className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-slate-300">
							Joining audio call
						</div>
					)}
				</div>
			)}
		</section>
	);
};

export default CallStage;
