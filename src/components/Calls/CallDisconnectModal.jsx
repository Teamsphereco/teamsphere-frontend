/* eslint-disable react/prop-types */
import { useMemo } from "react";
import useCallStore from "../../zustand/useCallStore";

const soloTimeoutCopy = [
	{
		title: "Solo Tour Cancelled",
		body: "Nobody joined, so we shut the room down before your bandwidth started charging appearance fees.",
	},
	{
		title: "Left On Call Delivered",
		body: "The group chat saw the call, respected the vibe from a distance, and absolutely did not enter. We saved your data.",
	},
	{
		title: "Bandwidth Rescue Mission",
		body: "You were carrying that call alone, so we pulled the plug before it became a one-person podcast.",
	},
	{
		title: "No Audience Detected",
		body: "The room stayed emptier than a meeting invite on a Friday. We ended it to save your bandwidth.",
	},
	{
		title: "They Missed The Lore",
		body: "No one joined in time, which is honestly their loss. The call was closed before your network had to keep pretending.",
	},
];

const ringTimeoutCopy = [
	{
		title: "No Pickup",
		body: "The call rang out. We stopped it before your phone had to keep auditioning for attention.",
	},
	{
		title: "Delivered, Not Joined",
		body: "That call got the chat equivalent of being left on delivered. We saved the bandwidth and the dignity.",
	},
	{
		title: "Ring Ring, Nothing",
		body: "Nobody answered, so we retired the ringtone before it developed abandonment issues.",
	},
];

const pickCopy = (notice) => {
	const copy = notice?.reason === "RING_TIMEOUT" ? ringTimeoutCopy : soloTimeoutCopy;
	return copy[Math.floor(Math.random() * copy.length)];
};

const CallDisconnectModal = ({ conversation }) => {
	const chatId = conversation?.chatId || conversation?.id;
	const { disconnectNotice, clearDisconnectNotice } = useCallStore();
	const copy = useMemo(() => pickCopy(disconnectNotice), [disconnectNotice?.id]);

	if (!disconnectNotice || disconnectNotice.chatId !== chatId) return null;

	return (
		<div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/55 px-4 backdrop-blur-sm">
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="call-disconnect-title"
				className="w-full max-w-sm rounded-lg border border-cyan-300/30 bg-slate-900 p-5 text-slate-100 shadow-2xl shadow-slate-950/50"
			>
				<div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg border border-cyan-300/30 bg-cyan-400/10 text-lg font-bold text-cyan-100">
					!
				</div>
				<h2 id="call-disconnect-title" className="text-lg font-semibold text-white">{copy.title}</h2>
				<p className="mt-2 text-sm leading-6 text-slate-300">{copy.body}</p>
				<button
					type="button"
					onClick={clearDisconnectNotice}
					className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-lg bg-cyan-500 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
				>
					Fair enough
				</button>
			</div>
		</div>
	);
};

export default CallDisconnectModal;