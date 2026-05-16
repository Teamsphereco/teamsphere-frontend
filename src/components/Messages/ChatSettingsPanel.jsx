import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import useChatSettings from "../../hooks/useChatSettings";

const defaultInfoDraft = {
	chatName: "",
	description: "",
	chatImage: "",
};

const roleLabel = (member) => {
	if (member?.owner) return "Owner";
	if (member?.admin) return "Admin";
	return "Member";
};

const roleBadgeClass = (member) => {
	if (member?.owner) return "border-amber-200 bg-amber-50 text-amber-700";
	if (member?.admin) return "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
	return "border-[#ebebeb] bg-[#fafafa] text-[#4d4d4d]";
};

const ConfirmDialog = ({ open, title, description, confirmLabel, confirmClassName, onConfirm, onCancel, loading }) => {
	if (!open) return null;
	return (
		<div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/35 p-4">
			<div className="w-full max-w-sm rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_24px_80px_rgba(0,0,0,0.22)]">
				<h3 className="text-base font-semibold text-[#171717]">{title}</h3>
				<p className="mt-2 text-sm text-[#4d4d4d]">{description}</p>
				<div className="mt-4 flex items-center justify-end gap-2">
					<button
						type="button"
						onClick={onCancel}
						className="rounded-md border border-[#ebebeb] px-3 py-2 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1]"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className={`rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${confirmClassName}`}
					>
						{loading ? "..." : confirmLabel}
					</button>
				</div>
			</div>
		</div>
	);
};

const ChatSettingsPanel = ({ conversation }) => {
	const chatId = conversation?.chatId || conversation?.id;
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const currentUserId = authUser?.user?.id;
	const {
		loading,
		loadChatSettings,
		muteChat,
		blockChat,
		leaveGroup,
		promoteMember,
		demoteMember,
		removeMember,
		addMember,
		updateGroupInfo,
		syncSummary,
	} = useChatSettings();

	const [settings, setSettings] = useState(null);
	const [memberQuery, setMemberQuery] = useState("");
	const [memberSearchResults, setMemberSearchResults] = useState([]);
	const [loadingMembers, setLoadingMembers] = useState(false);
	const [activeMemberActionId, setActiveMemberActionId] = useState(null);
	const [infoDraft, setInfoDraft] = useState(defaultInfoDraft);
	const [savingInfo, setSavingInfo] = useState(false);
	const [confirmState, setConfirmState] = useState({
		open: false,
		title: "",
		description: "",
		confirmLabel: "",
		confirmClassName: "",
		onConfirm: null,
	});

	const refreshSettings = useCallback(async () => {
		if (!chatId) return;
		const payload = await loadChatSettings(chatId);
		if (payload) {
			setSettings(payload);
		}
	}, [chatId, loadChatSettings]);

	useEffect(() => {
		setSettings(null);
		setMemberQuery("");
		setMemberSearchResults([]);
		setActiveMemberActionId(null);
		void refreshSettings();
	}, [refreshSettings]);

	useEffect(() => {
		if (!settings) return;
		setInfoDraft({
			chatName: settings?.chatName || conversation?.chatName || "",
			description: settings?.description || settings?.chatDescription || "",
			chatImage: settings?.chatImage || conversation?.chatImage || "",
		});
	}, [conversation?.chatImage, conversation?.chatName, settings]);

	const existingMemberIds = useMemo(
		() => new Set((settings?.members || []).map((member) => String(member.userId))),
		[settings?.members]
	);

	const adminCount = useMemo(
		() => (settings?.members || []).filter((member) => member.admin || member.owner).length,
		[settings?.members]
	);

	useEffect(() => {
		if (!settings?.isGroup || !settings?.currentUserAdmin) {
			setMemberSearchResults([]);
			return;
		}
		if (!token) return;
		if (!memberQuery.trim() || memberQuery.trim().length < 2) {
			setMemberSearchResults([]);
			return;
		}

		const timeoutId = setTimeout(async () => {
			setLoadingMembers(true);
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_HOST}/api/user/search?name=${encodeURIComponent(memberQuery.trim())}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!response.ok) {
					throw new Error("Failed to search users");
				}
				const users = await response.json();
				setMemberSearchResults(
					(Array.isArray(users) ? users : []).filter(
						(user) => !existingMemberIds.has(String(user.id))
					)
				);
			} catch (error) {
				toast.error(error.message);
			} finally {
				setLoadingMembers(false);
			}
		}, 260);

		return () => clearTimeout(timeoutId);
	}, [existingMemberIds, memberQuery, settings?.currentUserAdmin, settings?.isGroup, token]);

	const handleToggleMute = async () => {
		if (!chatId || !settings) return;
		const nextMuted = !settings.muted;
		const success = await muteChat(chatId, nextMuted);
		if (success) {
			setSettings((current) => (current ? { ...current, muted: nextMuted } : current));
		}
	};

	const handleToggleBlock = async () => {
		if (!chatId || !settings) return;
		const nextBlocked = !settings.blocked;
		const success = await blockChat(chatId, nextBlocked);
		if (success) {
			setSettings((current) => (current ? { ...current, blocked: nextBlocked } : current));
		}
	};

	const handleUpdateGroupInfo = async () => {
		if (!chatId || !settings?.isGroup || !settings?.currentUserAdmin) return;
		setSavingInfo(true);
		try {
			const success = await updateGroupInfo(chatId, {
				chatName: infoDraft.chatName,
				description: infoDraft.description,
				chatImage: infoDraft.chatImage,
			});
			if (success) {
				await refreshSettings();
				await syncSummary(chatId);
			}
		} finally {
			setSavingInfo(false);
		}
	};

	const openConfirm = ({ title, description, confirmLabel, confirmClassName, onConfirm }) => {
		setConfirmState({
			open: true,
			title,
			description,
			confirmLabel,
			confirmClassName,
			onConfirm,
		});
	};

	const closeConfirm = () => {
		setConfirmState({
			open: false,
			title: "",
			description: "",
			confirmLabel: "",
			confirmClassName: "",
			onConfirm: null,
		});
	};

	const handleLeaveGroup = () => {
		const selfMember = (settings?.members || []).find(
			(member) => String(member.userId) === String(currentUserId)
		);
		const isAdminLeaving = selfMember?.admin || selfMember?.owner;
		const adminWarning =
			isAdminLeaving && adminCount <= 1
				? " You are currently the only admin."
				: "";

		openConfirm({
			title: "Leave this group?",
			description: `You will stop receiving messages in this chat.${adminWarning}`,
			confirmLabel: "Leave group",
			confirmClassName: "bg-red-600 text-white hover:bg-red-500",
			onConfirm: async () => {
				const success = await leaveGroup(chatId);
				if (success) {
					closeConfirm();
				}
			},
		});
	};

	const runMemberAction = async (action) => {
		const success = await action();
		if (success) {
			setActiveMemberActionId(null);
			await refreshSettings();
			await syncSummary(chatId);
		}
	};

	if (!chatId) return null;

	return (
		<>
			<div className="scrollbar-thin h-full space-y-4 overflow-y-auto px-4 py-4 md:px-5">
				<div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
					<div className="flex items-center gap-3">
						{(settings?.chatImage || conversation?.chatImage) ? (
							<img
								src={settings?.chatImage || conversation?.chatImage}
								alt="chat avatar"
								className="h-14 w-14 rounded-md object-cover"
							/>
						) : (
							<div className="flex h-14 w-14 items-center justify-center rounded-md bg-[#f5f5f5] text-lg font-semibold text-[#171717]">
								{(settings?.chatName || conversation?.chatName || "C").charAt(0).toUpperCase()}
							</div>
						)}
						<div className="min-w-0">
							<p className="truncate text-base font-semibold text-[#171717]">
								{settings?.chatName || conversation?.chatName || "Chat"}
							</p>
							<p className="text-xs text-[#888888]">
								{settings?.isGroup
									? `${settings?.memberCount || (settings?.members || []).length || 0} members`
									: "Direct chat"}
							</p>
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
					<p className="mb-3 font-mono text-[11px] uppercase text-[#888888]">Quick Actions</p>
					<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
						<button
							type="button"
							onClick={handleToggleMute}
							disabled={loading}
							className="rounded-md border border-[#ebebeb] px-3 py-2 text-left text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1] disabled:opacity-60"
						>
							{settings?.muted ? "Unmute chat" : "Mute chat"}
						</button>
						{!settings?.isGroup ? (
							<button
								type="button"
								onClick={handleToggleBlock}
								disabled={loading}
								className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:border-red-300 disabled:opacity-60"
							>
								{settings?.blocked ? "Unblock user" : "Block user"}
							</button>
						) : (
							<div className="rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 py-2 text-sm text-[#888888]">
								Shared media (coming soon)
							</div>
						)}
					</div>
				</div>

				{settings?.isGroup ? (
					<div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
						<div className="mb-3 flex items-center justify-between">
							<p className="font-mono text-[11px] uppercase text-[#888888]">Group Info</p>
							{settings?.currentUserAdmin ? (
								<span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#1d4ed8]">
									Admin
								</span>
							) : null}
						</div>
						<div className="space-y-3">
							<input
								type="text"
								value={infoDraft.chatName}
								onChange={(event) =>
									setInfoDraft((current) => ({ ...current, chatName: event.target.value }))
								}
								disabled={!settings?.currentUserAdmin}
								placeholder="Group name"
								className="w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#888888] focus:border-[#171717] focus:outline-none disabled:bg-[#fafafa] disabled:opacity-70"
							/>
							<input
								type="url"
								value={infoDraft.chatImage}
								onChange={(event) =>
									setInfoDraft((current) => ({ ...current, chatImage: event.target.value }))
								}
								disabled={!settings?.currentUserAdmin}
								placeholder="Group photo URL"
								className="w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#888888] focus:border-[#171717] focus:outline-none disabled:bg-[#fafafa] disabled:opacity-70"
							/>
							<textarea
								rows={3}
								value={infoDraft.description}
								onChange={(event) =>
									setInfoDraft((current) => ({ ...current, description: event.target.value }))
								}
								disabled={!settings?.currentUserAdmin}
								placeholder="Group description"
								className="w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#888888] focus:border-[#171717] focus:outline-none disabled:bg-[#fafafa] disabled:opacity-70"
							/>
							{settings?.currentUserAdmin ? (
								<button
									type="button"
									onClick={handleUpdateGroupInfo}
									disabled={savingInfo}
									className="rounded-md bg-[#171717] px-3 py-2 text-xs font-medium text-white transition hover:bg-[#4d4d4d] disabled:cursor-not-allowed disabled:opacity-60"
								>
									{savingInfo ? "Saving..." : "Save group info"}
								</button>
							) : null}
						</div>
					</div>
				) : null}

				{settings?.isGroup ? (
					<div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
						<p className="mb-3 font-mono text-[11px] uppercase text-[#888888]">Members</p>
						{settings?.currentUserAdmin ? (
							<div className="mb-4 rounded-md border border-[#ebebeb] bg-[#fafafa] p-3">
								<input
									type="search"
									value={memberQuery}
									onChange={(event) => setMemberQuery(event.target.value)}
									placeholder="Search users to add"
									className="w-full rounded-md border border-[#ebebeb] bg-white px-3 py-2 text-sm text-[#171717] placeholder:text-[#888888] focus:border-[#171717] focus:outline-none"
								/>
								{memberQuery.trim().length >= 2 ? (
									<div className="mt-2 space-y-2">
										{loadingMembers ? (
											<p className="text-xs text-[#888888]">Searching...</p>
										) : memberSearchResults.length === 0 ? (
											<p className="text-xs text-[#888888]">No matching users</p>
										) : (
											memberSearchResults.slice(0, 6).map((user) => (
												<div key={user.id} className="flex items-center justify-between rounded-md border border-[#ebebeb] bg-white px-2 py-2">
													<div className="min-w-0">
														<p className="truncate text-xs font-semibold text-[#171717]">{user.username}</p>
														<p className="truncate text-[11px] text-[#888888]">{user.email}</p>
													</div>
													<button
														type="button"
														onClick={() => runMemberAction(() => addMember(chatId, user.id))}
														className="rounded-md bg-[#171717] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#4d4d4d]"
													>
														Add
													</button>
												</div>
											))
										)}
									</div>
								) : null}
							</div>
						) : null}

						<div className="space-y-2">
							{(settings?.members || []).map((member) => {
								const isSelf = String(member.userId) === String(currentUserId);
								const canManage = settings?.currentUserAdmin && !member.owner && !isSelf;
								const actionsOpen = String(activeMemberActionId) === String(member.userId);
								return (
									<div key={member.userId} className="rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 py-2">
										<div className="flex items-center justify-between gap-2">
											<div className="min-w-0">
												<p className="truncate text-sm font-semibold text-[#171717]">
													{member.username}
													{isSelf ? " (You)" : ""}
												</p>
												<div className="mt-1">
													<span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] ${roleBadgeClass(member)}`}>
														{roleLabel(member)}
													</span>
												</div>
											</div>
											{canManage ? (
												<div className="relative">
													<button
														type="button"
														onClick={() =>
															setActiveMemberActionId((current) =>
																String(current) === String(member.userId) ? null : member.userId
															)
														}
														className="rounded-md border border-[#ebebeb] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#171717] transition hover:border-[#a1a1a1]"
													>
														Manage
													</button>
													{actionsOpen ? (
														<div className="absolute right-0 z-30 mt-2 w-40 rounded-lg border border-[#ebebeb] bg-white p-1 shadow-[0_12px_36px_rgba(0,0,0,0.14)]">
															{member.admin ? (
																<button
																	type="button"
																	onClick={() =>
																		runMemberAction(() => demoteMember(chatId, member.userId))
																	}
																	className="block w-full rounded-md px-2 py-2 text-left text-xs font-medium text-[#171717] transition hover:bg-[#fafafa]"
																>
																	Demote admin
																</button>
															) : (
																<button
																	type="button"
																	onClick={() =>
																		runMemberAction(() => promoteMember(chatId, member.userId))
																	}
																	className="block w-full rounded-md px-2 py-2 text-left text-xs font-medium text-[#0070f3] transition hover:bg-[#fafafa]"
																>
																	Promote to admin
																</button>
															)}
															<button
																type="button"
																onClick={() =>
																	openConfirm({
																		title: `Remove ${member.username}?`,
																		description: "They will lose access to this group chat.",
																		confirmLabel: "Remove member",
																		confirmClassName: "bg-red-600 text-white hover:bg-red-500",
																		onConfirm: async () => {
																			await runMemberAction(() => removeMember(chatId, member.userId));
																			closeConfirm();
																		},
																	})
																}
																className="mt-1 block w-full rounded-md px-2 py-2 text-left text-xs font-medium text-red-600 transition hover:bg-red-50"
															>
																Remove from group
															</button>
														</div>
													) : null}
												</div>
											) : null}
										</div>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
						<p className="font-mono text-[11px] uppercase text-[#888888]">Shared Content</p>
						<p className="mt-2 text-sm text-[#4d4d4d]">Media and links explorer coming soon.</p>
					</div>
				)}

				{settings?.isGroup ? (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4">
						<p className="font-mono text-[11px] uppercase text-red-700">Danger Zone</p>
						<button
							type="button"
							onClick={handleLeaveGroup}
							disabled={loading}
							className="mt-3 rounded-md border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:border-red-300 disabled:opacity-60"
						>
							Leave group
						</button>
					</div>
				) : null}
			</div>

			<ConfirmDialog
				open={confirmState.open}
				title={confirmState.title}
				description={confirmState.description}
				confirmLabel={confirmState.confirmLabel}
				confirmClassName={confirmState.confirmClassName}
				onCancel={closeConfirm}
				onConfirm={confirmState.onConfirm || closeConfirm}
				loading={loading}
			/>
		</>
	);
};

export default ChatSettingsPanel;
