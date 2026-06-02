import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import useSettings, { appearanceSettingKeys } from "../../zustand/useSettings";
import { getBlockedUsers, unblockUser as unblockUserRequest } from "../../utils/socialApi";
import {
  integrations,
  selectOptions,
  settingsContent,
  storageSegments,
} from "../../utils/settingsData";
import ConfirmationDialog from "./ConfirmationDialog";
import EmptyStateCard from "./EmptyStateCard";
import SettingsGroupCard from "./SettingsGroupCard";
import SettingsRow from "./SettingsRow";
import { ActionButton, Icon, SelectControl, StatusPill } from "./SettingsControls";

const statusLabels = {
  online: "Online",
  away: "Away",
  dnd: "Do not disturb",
  invisible: "Invisible",
};

const sampleDevices = {
  audioinput: [
    { deviceId: "studio-mic", label: "Studio Microphone" },
    { deviceId: "macbook-mic", label: "MacBook Microphone" },
  ],
  audiooutput: [
    { deviceId: "studio-display", label: "Studio Display Speakers" },
    { deviceId: "airpods", label: "AirPods Pro" },
  ],
  videoinput: [
    { deviceId: "facetime-camera", label: "FaceTime HD Camera" },
    { deviceId: "continuity-camera", label: "Continuity Camera" },
  ],
};

const hasUnsavedAppearanceChanges = (settings, savedAppearanceSettings) => appearanceSettingKeys.some(
  (key) => settings[key] !== savedAppearanceSettings[key]
);

const makeDeviceOptions = (devices, kind, defaultLabel) => {
  const matchingDevices = devices.filter((device) => device.kind === kind && device.deviceId);
  const sourceDevices = matchingDevices.length ? matchingDevices : sampleDevices[kind];

  return [
    { label: `System default ${defaultLabel}`, value: "system" },
    ...sourceDevices.map((device, index) => ({
      label: device.label || `${defaultLabel} ${index + 1}`,
      value: device.deviceId,
    })),
  ];
};

const SettingsSection = ({ categoryId, profileSummary }) => {
  const content = settingsContent[categoryId];
  const { authUser } = useAuthContext();
  const token = authUser?.jwt;
  const {
    settings,
    savedAppearanceSettings,
    updateSetting,
    saveAppearanceSettings,
    revertAppearanceSettings,
    appearanceSaving,
    linkedDevices,
    removeLinkedDevice,
    removeOtherDevices,
    clearCache,
    cacheClearing,
    resetSettings,
  } = useSettings();
  const [dialog, setDialog] = useState(null);
  const [blockedSearch, setBlockedSearch] = useState("");
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockedUsersLoading, setBlockedUsersLoading] = useState(false);
  const [mediaDevices, setMediaDevices] = useState([]);

  const fetchBlockedUsers = useMemo(() => async () => {
    if (!token) return;
    setBlockedUsersLoading(true);
    try {
      const payload = await getBlockedUsers({ token });
      setBlockedUsers(Array.isArray(payload) ? payload : []);
    } catch (error) {
      toast.error(error.message);
      setBlockedUsers([]);
    } finally {
      setBlockedUsersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (categoryId === "blocked-users") {
      void fetchBlockedUsers();
    }
  }, [categoryId, fetchBlockedUsers]);

  useEffect(() => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return;
    }

    navigator.mediaDevices.enumerateDevices()
      .then((devices) => setMediaDevices(devices))
      .catch(() => setMediaDevices([]));
  }, []);

  const deviceOptions = useMemo(() => ({
    microphone: makeDeviceOptions(mediaDevices, "audioinput", "microphone"),
    speaker: makeDeviceOptions(mediaDevices, "audiooutput", "speaker"),
    camera: makeDeviceOptions(mediaDevices, "videoinput", "camera"),
  }), [mediaDevices]);

  const appearanceDirty = useMemo(
    () => hasUnsavedAppearanceChanges(settings, savedAppearanceSettings),
    [savedAppearanceSettings, settings]
  );

  const handleChange = (item, value) => {
    updateSetting(item.control.key, value);
    if (item.control.toast) {
      toast.success(item.control.toast);
    }
  };

  const openConfirmation = ({ title, description, confirmLabel, onConfirm }) => {
    setDialog({ title, description, confirmLabel, onConfirm });
  };

  const handleAction = async (action, item = {}) => {
    if (action === "test-notification") {
      toast.success("Test notification sent. This is how TeamSphere alerts will feel.");
      return;
    }

    if (action === "clear-cache") {
      const toastId = toast.loading("Clearing local cache...");
      await clearCache();
      toast.success("Cache cleared on this device.", { id: toastId });
      return;
    }

    if (action === "delete-account" || action === "deactivate-account") {
      const isDelete = action === "delete-account";
      openConfirmation({
        title: isDelete ? "Delete account?" : "Deactivate account?",
        description: isDelete
          ? "This demo will not delete anything, but production TeamSphere would require a final verification step before removing your account."
          : "This demo will only show a confirmation toast. Your profile and messages remain unchanged.",
        confirmLabel: isDelete ? "Delete account" : "Deactivate",
        onConfirm: () => toast.success(isDelete ? "Account deletion was simulated." : "Account deactivation was simulated."),
      });
      return;
    }

    if (action === "logout-all-devices") {
      openConfirmation({
        title: "Log out all other devices?",
        description: "This will remove every sample session except the current device from local settings state.",
        confirmLabel: "Log out devices",
        onConfirm: () => {
          removeOtherDevices();
          toast.success("Other devices were logged out locally.");
        },
      });
      return;
    }

    if (action === "clear-local-database" || action === "reset-app-data") {
      openConfirmation({
        title: action === "reset-app-data" ? "Reset local app data?" : "Clear local database?",
        description: "This affects only local demo settings in this browser and does not call the API.",
        confirmLabel: action === "reset-app-data" ? "Reset app data" : "Clear database",
        onConfirm: () => {
          if (action === "reset-app-data") {
            resetSettings();
          }
          toast.success(action === "reset-app-data" ? "Local settings reset." : "Local database clear was simulated.");
        },
      });
      return;
    }

    if (action === "unblock-user") {
      openConfirmation({
        title: `Unblock ${item.nickname || item.username}?`,
        description: "They may be able to send chat requests or appear with limited interaction in shared groups again.",
        confirmLabel: "Unblock",
        onConfirm: async () => {
          await unblockUserRequest({ token, userId: item.id });
          await fetchBlockedUsers();
          window.dispatchEvent(new Event("teamsphere-blocks-changed"));
          toast.success(`${item.nickname || item.username} was unblocked.`);
        },
      });
      return;
    }

    if (action === "logout-device") {
      openConfirmation({
        title: `Log out ${item.name}?`,
        description: "This removes the sample linked session from local settings state.",
        confirmLabel: "Log out device",
        onConfirm: () => {
          removeLinkedDevice(item.id);
          toast.success(`${item.name} was logged out locally.`);
        },
      });
      return;
    }

    if (action === "copy-profile-link") {
      await navigator.clipboard?.writeText?.("https://teamsphere.app/u/me");
      toast.success("Profile link copied.");
      return;
    }

    const label = item.title || action.replaceAll("-", " ");
    toast.success(`${label} action is ready for backend wiring.`);
  };

  const closeDialog = () => setDialog(null);
  const confirmDialog = async () => {
    await dialog?.onConfirm?.();
    closeDialog();
  };

  const handleSaveAppearance = async () => {
    if (!token) {
      toast.error("Sign in again to save appearance settings.");
      return;
    }

    const toastId = toast.loading("Saving appearance...");
    try {
      await saveAppearanceSettings(token);
      toast.success("Appearance settings saved.", { id: toastId });
    } catch (error) {
      toast.error(error.message || "Could not save appearance settings.", { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      {categoryId === "profile" ? <ProfileHero profileSummary={profileSummary} settings={settings} onAction={handleAction} /> : null}
      {categoryId === "devices-sessions" ? <DevicesSessions linkedDevices={linkedDevices} onAction={handleAction} /> : null}
      {categoryId === "notifications" ? <NotificationPreview settings={settings} /> : null}
      {categoryId === "appearance" ? (
        <>
          <ChatPreview settings={settings} profileSummary={profileSummary} />
          <AppearanceSaveBar
            dirty={appearanceDirty}
            saving={appearanceSaving}
            onSave={handleSaveAppearance}
            onRevert={revertAppearanceSettings}
          />
        </>
      ) : null}
      {categoryId === "chats-messaging" ? <ChatOrganizationCard settings={settings} /> : null}
      {categoryId === "audio-video" ? (
        <AudioVideoDevices
          settings={settings}
          updateSetting={updateSetting}
          deviceOptions={deviceOptions}
          onAction={handleAction}
        />
      ) : null}
      {categoryId === "privacy-safety" ? <PrivacyCheckup settings={settings} onAction={handleAction} /> : null}
      {categoryId === "blocked-users" ? (
        <BlockedUsers
          blockedUsers={blockedUsers}
          loading={blockedUsersLoading}
          searchQuery={blockedSearch}
          onSearchChange={setBlockedSearch}
          onAction={handleAction}
        />
      ) : null}
      {categoryId === "contacts" ? <ContactsPreview /> : null}
      {categoryId === "data-storage" ? <StorageUsage cacheClearing={cacheClearing} onAction={handleAction} /> : null}
      {categoryId === "backups" ? <BackupStatus settings={settings} /> : null}
      {categoryId === "integrations" ? <IntegrationsList onAction={handleAction} /> : null}

      {content.groups.map((group) => (
        <SettingsGroupCard key={group.title} title={group.title} description={group.description} danger={group.danger}>
          {group.rows.map((item) => {
            const value = item.control?.key ? settings[item.control.key] : undefined;
            const busy = item.control?.action === "clear-cache" && cacheClearing;

            return (
              <SettingsRow
                key={item.id}
                row={item}
                value={value}
                busy={busy}
                onChange={(nextValue) => handleChange(item, nextValue)}
                onAction={handleAction}
              />
            );
          })}
        </SettingsGroupCard>
      ))}

      <ConfirmationDialog
        open={Boolean(dialog)}
        title={dialog?.title}
        description={dialog?.description}
        confirmLabel={dialog?.confirmLabel}
        onConfirm={confirmDialog}
        onCancel={closeDialog}
      />
    </div>
  );
};

const ProfileHero = ({ profileSummary, settings, onAction }) => (
  <div>
    <section className="rounded-lg border border-[#ebebeb] bg-white p-5 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {profileSummary.avatarUrl ? (
          <img src={profileSummary.avatarUrl} alt={`${profileSummary.name} avatar`} className="h-20 w-20 rounded-lg object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-[#171717] text-xl font-semibold text-white">
            {profileSummary.initials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-xl font-semibold text-[#171717]">{profileSummary.name}</h3>
          <p className="truncate text-sm text-[#4d4d4d]">{profileSummary.handle}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <StatusPill label={statusLabels[settings.status] || "Online"} tone="success" />
            <StatusPill label="Verified" tone="success" />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ActionButton variant="primary" onClick={() => onAction("edit-profile", { title: "Edit profile" })}>Edit profile</ActionButton>
          <ActionButton onClick={() => onAction("change-avatar", { title: "Change avatar" })}>Change avatar</ActionButton>
        </div>
      </div>
    </section>
  </div>
);

const DevicesSessions = ({ linkedDevices, onAction }) => {
  const currentDevice = linkedDevices.find((device) => device.current) || linkedDevices[0];
  const otherDevices = linkedDevices.filter((device) => !device.current);

  return (
    <div className="space-y-4">
      {currentDevice ? (
        <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[11px] text-[#888888]">CURRENT DEVICE</p>
              <h3 className="mt-2 text-lg font-semibold text-[#171717]">{currentDevice.name}</h3>
              <p className="text-sm text-[#4d4d4d]">{currentDevice.platform} · {currentDevice.location} · {currentDevice.lastActive}</p>
            </div>
            <StatusPill label={currentDevice.trusted ? "Trusted" : "Untrusted"} tone={currentDevice.trusted ? "success" : "warning"} />
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        {otherDevices.map((device) => (
          <div key={device.id} className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#171717]">{device.name}</p>
                <p className="mt-1 text-xs text-[#4d4d4d]">{device.app}</p>
              </div>
              <StatusPill label={device.trusted ? "Trusted" : "Review"} tone={device.trusted ? "success" : "warning"} />
            </div>
            <p className="mt-3 text-sm text-[#4d4d4d]">{device.platform} · {device.location}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-xs text-[#888888]">{device.lastActive}</span>
              <ActionButton variant="danger" onClick={() => onAction("logout-device", device)}>Log out</ActionButton>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-dashed border-[#a1a1a1] bg-[#fafafa] p-5 text-center">
        <div className="mx-auto grid h-28 w-28 grid-cols-4 gap-1 rounded-lg border border-[#ebebeb] bg-white p-3">
          {Array.from({ length: 16 }).map((_, index) => (
            <span key={index} className={`rounded-sm ${index % 3 === 0 || index === 5 ? "bg-[#171717]" : "bg-[#ebebeb]"}`} />
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-[#171717]">QR device link placeholder</p>
        <p className="mt-1 text-sm text-[#4d4d4d]">No device linking request is sent from this page.</p>
      </section>
    </div>
  );
};

const NotificationPreview = ({ settings }) => (
  <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <p className="font-mono text-[11px] text-[#888888]">NOTIFICATION PREVIEW</p>
    <div className="mt-4 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-3">
      <div className="flex items-start gap-3 rounded-lg border border-[#ebebeb] bg-white p-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#171717] text-xs font-semibold text-white">AR</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-sm font-semibold text-[#171717]">Ari from Product</p>
            <span className="text-xs text-[#888888]">now</span>
          </div>
          <p className="mt-1 text-sm text-[#4d4d4d]">
            {settings.notificationPreviews ? "Mentioned you in Launch Room: can you review the copy?" : "New TeamSphere message"}
          </p>
        </div>
      </div>
    </div>
  </section>
);

const previewDensity = {
  compact: {
    stack: "space-y-2",
    bubble: "px-3 py-1.5",
  },
  comfortable: {
    stack: "space-y-3",
    bubble: "px-4 py-2",
  },
  spacious: {
    stack: "space-y-5",
    bubble: "px-5 py-3",
  },
};

const ChatPreview = ({ settings }) => {
  const density = previewDensity[settings.chatDensity] || previewDensity.comfortable;
  const bubbleStyleClass = settings.bubbleStyle === "classic" ? "font-serif" : "";

  return (
  <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <p className="font-mono text-[11px] text-[#888888]">LIVE CHAT PREVIEW</p>
    <div className="mt-4 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4">
      <div className={density.stack} style={{ fontSize: `${settings.messageTextSize}px` }}>
        <div className="flex min-w-0 items-end gap-2">
          {settings.showAvatars ? <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-semibold text-[#171717]">M</div> : null}
          <div className="min-w-0 max-w-[78%]">
            <div className="mb-1 flex min-w-0 items-center gap-2">
              <span className="truncate text-xs font-semibold text-[#171717]">Mika</span>
              {settings.showTimestamps ? <span className="text-[11px] text-[#888888]">9:41 AM</span> : null}
            </div>
            <div className={`inline-block max-w-full border border-[#ebebeb] bg-white ${density.bubble} text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.03)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${bubbleStyleClass}`} style={{ borderRadius: `${settings.messageRadius}px` }}>
              Design review is ready. I added the final call flow.
            </div>
          </div>
        </div>
        <div className="flex min-w-0 items-end justify-end gap-2">
          <div className="flex min-w-0 max-w-[78%] flex-col items-end">
            <div className="mb-1 flex min-w-0 items-center justify-end gap-2">
              {settings.showTimestamps ? <span className="text-[11px] text-[#888888]">9:42 AM</span> : null}
              <span className="truncate text-xs font-semibold text-[#171717]">You</span>
            </div>
            <div className={`inline-block max-w-full bg-[#171717] ${density.bubble} text-white shadow-[0_1px_2px_rgba(0,0,0,0.18)] whitespace-pre-wrap break-words [overflow-wrap:anywhere] ${bubbleStyleClass}`} style={{ borderRadius: `${settings.messageRadius}px` }}>
              Looks good. Shipping notes next.
            </div>
          </div>
          {settings.showAvatars ? <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#171717] text-[10px] font-semibold text-white">Y</div> : null}
        </div>
        {settings.typingAnimation ? (
          <div className="flex items-center gap-2 px-1 text-xs italic text-[#0070f3]">
            <span>Mika is typing</span>
            <span className="inline-flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#0070f3]" />
            </span>
          </div>
        ) : null}
      </div>
    </div>
  </section>
  );
};

const AppearanceSaveBar = ({ dirty, saving, onSave, onRevert }) => (
  <section className="sticky bottom-3 z-10 rounded-lg border border-[#ebebeb] bg-white p-3 shadow-[0_12px_30px_rgba(0,0,0,0.12)]">
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[#171717]">
          {dirty ? "Unsaved appearance changes" : "Appearance is saved"}
        </p>
        <p className="mt-1 text-sm text-[#4d4d4d]">
          {dirty ? "Preview updates immediately. Save when you want this on every device." : "These preferences are synced to your account."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <ActionButton disabled={!dirty || saving} onClick={onRevert}>Revert</ActionButton>
        <button
          type="button"
          disabled={!dirty || saving}
          onClick={onSave}
          className={`inline-flex min-h-10 items-center justify-center rounded-md border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0070f3] focus:ring-offset-2 disabled:cursor-not-allowed ${
            dirty
              ? "border-[#0070f3] bg-[#0070f3] text-white hover:bg-[#005bd1]"
              : "border-[#d3e5ff] bg-[#eef6ff] text-[#0761d1]"
          }`}
        >
          {saving ? "Saving..." : "Save appearance"}
        </button>
      </div>
    </div>
  </section>
);

const ChatOrganizationCard = ({ settings }) => (
  <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <p className="font-mono text-[11px] text-[#888888]">CHAT ORGANIZATION</p>
    <div className="mt-4 grid gap-3 sm:grid-cols-4">
      {["All", "Work", "Unread", "Archived"].map((label, index) => (
        <div key={label} className={`rounded-lg border p-3 ${index === 0 ? "border-[#171717] bg-white" : "border-[#ebebeb] bg-[#fafafa]"}`}>
          <p className="text-sm font-semibold text-[#171717]">{label}</p>
          <p className="mt-1 text-xs text-[#4d4d4d]">{settings.chatFolders ? `${12 - index * 2} chats` : "Hidden"}</p>
        </div>
      ))}
    </div>
  </section>
);

const AudioVideoDevices = ({ settings, updateSetting, deviceOptions, onAction }) => (
  <SettingsGroupCard title="Devices" description="Select call devices. Browser device names appear when permission allows.">
    <DeviceRow label="Microphone" description="Choose the input device used for voice calls." value={settings.microphone} options={deviceOptions.microphone} onChange={(value) => updateSetting("microphone", value)} />
    <DeviceRow label="Speaker" description="Choose the output device used for calls and notification tones." value={settings.speaker} options={deviceOptions.speaker} onChange={(value) => updateSetting("speaker", value)} />
    <DeviceRow label="Camera" description="Choose the video input device for calls." value={settings.camera} options={deviceOptions.camera} onChange={(value) => updateSetting("camera", value)} />
    <div className="flex min-h-[72px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <div>
        <p className="text-sm font-semibold text-[#171717]">Device tests</p>
        <p className="mt-1 text-sm text-[#4d4d4d]">Run sample speaker and microphone checks without capturing media.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <ActionButton onClick={() => onAction("test-speaker", { title: "Test speaker" })}>Test speaker</ActionButton>
        <ActionButton onClick={() => onAction("test-microphone", { title: "Test microphone" })}>Test mic</ActionButton>
      </div>
    </div>
    <div className="px-4 pb-4 sm:px-5">
      <div className="grid gap-3 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-4 sm:grid-cols-[1fr_160px]">
        <div>
          <p className="text-sm font-semibold text-[#171717]">Camera preview</p>
          <p className="mt-1 text-sm text-[#4d4d4d]">Preview placeholder only. No camera stream is requested.</p>
        </div>
        <div className="flex h-24 items-center justify-center rounded-lg bg-[#171717] text-xs font-medium text-white">Camera off</div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#ebebeb]">
        <div className="h-full rounded-full bg-[#0070f3]" style={{ width: `${settings.inputSensitivity}%` }} />
      </div>
    </div>
  </SettingsGroupCard>
);

const DeviceRow = ({ label, description, value, options, onChange }) => (
  <div className="flex min-h-[72px] flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
    <div>
      <p className="text-sm font-semibold text-[#171717]">{label}</p>
      <p className="mt-1 text-sm text-[#4d4d4d]">{description}</p>
    </div>
    <SelectControl label={label} value={value} options={options} onChange={onChange} />
  </div>
);

const PrivacyCheckup = ({ settings, onAction }) => {
  const checks = [
    { label: "Unknown senders filtered", active: settings.filterUnknownSenders },
    { label: "IP hidden during calls", active: settings.hideIpDuringCalls },
    { label: "Suspicious link scan", active: settings.suspiciousLinkScan },
    { label: "Read receipts controlled", active: settings.readReceipts },
  ];
  const score = Math.round((checks.filter((check) => check.active).length / checks.length) * 100);

  return (
    <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-[11px] text-[#888888]">PRIVACY CHECKUP</p>
          <h3 className="mt-2 text-lg font-semibold text-[#171717]">{score}% protected</h3>
          <p className="mt-1 text-sm text-[#4d4d4d]">Your strongest privacy controls are enabled for calls, links, and unknown senders.</p>
        </div>
        <ActionButton variant="primary" onClick={() => onAction("privacy-checkup", { title: "Privacy checkup" })}>Start checkup</ActionButton>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {checks.map((check) => (
          <div key={check.label} className="flex items-center gap-2 rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 py-2 text-sm text-[#4d4d4d]">
            <Icon name={check.active ? "check" : "x"} className={`h-4 w-4 ${check.active ? "text-[#0070f3]" : "text-[#c50000]"}`} />
            {check.label}
          </div>
        ))}
      </div>
    </section>
  );
};

const BlockedUsers = ({ blockedUsers, loading, searchQuery, onSearchChange, onAction }) => {
  const filteredUsers = blockedUsers.filter((user) => (
    `${user.nickname || ""} ${user.username || ""}`.toLowerCase().includes(searchQuery.toLowerCase())
  ));

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
        <label className="sr-only" htmlFor="blocked-search">Search blocked users</label>
        <input
          id="blocked-search"
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search blocked users"
          className="min-h-11 w-full rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 text-sm text-[#171717] outline-none focus:border-[#0070f3] focus:ring-2 focus:ring-[#d3e5ff]"
        />
        <p className="mt-3 text-sm leading-6 text-[#4d4d4d]">
          Blocked people cannot message you, call you, or see online status. Shared groups may still show limited interaction.
        </p>
      </div>

      {loading ? (
        <div className="rounded-lg border border-[#ebebeb] bg-white p-4 text-sm text-[#4d4d4d]">Loading blocked users...</div>
      ) : filteredUsers.length ? (
        <div className="overflow-hidden rounded-lg border border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
          {filteredUsers.map((user) => (
            <div key={user.id} className="flex min-h-[76px] items-center gap-3 border-b border-[#ebebeb] px-4 py-3 last:border-b-0">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={`${user.nickname || user.username} avatar`} className="h-10 w-10 rounded-md object-cover" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#171717] text-xs font-semibold text-white">
                  {(user.nickname || user.username || "U").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#171717]">{user.nickname || user.username}</p>
                <p className="truncate text-xs text-[#4d4d4d]">@{user.username}</p>
              </div>
              <ActionButton onClick={() => onAction("unblock-user", user)}>Unblock</ActionButton>
            </div>
          ))}
        </div>
      ) : (
        <EmptyStateCard title="No settings found." description="No blocked users match this search, or your local blocked list is empty." />
      )}
    </section>
  );
};

const ContactsPreview = () => (
  <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <p className="font-mono text-[11px] text-[#888888]">PROFILE QR</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-[130px_1fr] sm:items-center">
      <div className="grid h-28 w-28 grid-cols-5 gap-1 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-3">
        {Array.from({ length: 25 }).map((_, index) => (
          <span key={index} className={`rounded-sm ${index % 4 === 0 || index === 12 ? "bg-[#171717]" : "bg-white"}`} />
        ))}
      </div>
      <p className="text-sm leading-6 text-[#4d4d4d]">
        Contact sync is privacy-sensitive, so this page only toggles local preferences and shows clear permission state.
      </p>
    </div>
  </section>
);

const StorageUsage = ({ cacheClearing, onAction }) => (
  <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[11px] text-[#888888]">STORAGE OVERVIEW</p>
        <h3 className="mt-2 text-lg font-semibold text-[#171717]">8.6 GB used</h3>
        <p className="mt-1 text-sm text-[#4d4d4d]">Images, videos, files, voice messages, and local cache.</p>
      </div>
      <ActionButton variant="primary" onClick={() => onAction("review-large-files", { title: "Review large files" })}>Review large files</ActionButton>
    </div>
    <div className="mt-5 overflow-hidden rounded-full bg-[#ebebeb]">
      <div className="flex h-3 w-full">
        {storageSegments.map((segment, index) => (
          <span key={segment.label} className={index % 2 === 0 ? "bg-[#171717]" : "bg-[#0070f3]"} style={{ width: `${segment.value}%` }} />
        ))}
      </div>
    </div>
    <div className="mt-4 grid gap-2 sm:grid-cols-5">
      {storageSegments.map((segment) => (
        <div key={segment.label} className="rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 py-2">
          <p className="text-xs font-medium text-[#171717]">{segment.label}</p>
          <p className="mt-1 font-mono text-[11px] text-[#888888]">{segment.size}</p>
        </div>
      ))}
    </div>
    {cacheClearing ? <p className="mt-3 text-sm text-[#0070f3]">Clearing cache...</p> : null}
  </section>
);

const BackupStatus = ({ settings }) => (
  <section className={`rounded-lg border p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)] ${settings.backupFrequency === "off" ? "border-[#ffefcf] bg-[#fff8ea]" : "border-[#ebebeb] bg-white"}`}>
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="font-mono text-[11px] text-[#888888]">BACKUP STATUS</p>
        <h3 className="mt-2 text-lg font-semibold text-[#171717]">
          {settings.backupFrequency === "off" ? "Backups disabled" : "Encrypted backup ready"}
        </h3>
        <p className="mt-1 text-sm text-[#4d4d4d]">Last simulated backup completed today at 9:42 AM.</p>
      </div>
      <StatusPill label={settings.encryptedBackup ? "Encrypted" : "Not encrypted"} tone={settings.encryptedBackup ? "success" : "warning"} />
    </div>
  </section>
);

const IntegrationsList = ({ onAction }) => (
  <section className="overflow-hidden rounded-lg border border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
    <div className="border-b border-[#ebebeb] px-4 py-4 sm:px-5">
      <h3 className="text-base font-semibold text-[#171717]">Connected apps</h3>
      <p className="mt-1 text-sm text-[#4d4d4d]">Manage connected accounts and permission summaries.</p>
    </div>
    {integrations.map((integration) => (
      <div key={integration.id} className="flex min-h-[82px] flex-col gap-3 border-b border-[#ebebeb] px-4 py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-[#ebebeb] bg-[#fafafa] text-sm font-semibold text-[#171717]">
            {integration.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-[#171717]">{integration.name}</p>
              <StatusPill label={integration.status} tone={integration.tone} />
            </div>
            <p className="mt-1 truncate text-sm text-[#4d4d4d]">{integration.account} · {integration.permissions}</p>
          </div>
        </div>
        <ActionButton onClick={() => onAction("manage-integration", { title: integration.name })}>Manage</ActionButton>
      </div>
    ))}
    <SettingsGroupCard title="Bots" description="Installed bot permissions are local sample rows.">
      <SettingsRow
        row={{
          title: "Release notes bot",
          description: "Posts release summaries into selected project rooms.",
          control: { type: "button", label: "Remove", action: "remove-bot", variant: "danger" },
          badge: "Installed",
        }}
        onAction={onAction}
      />
      <SettingsRow
        row={{
          title: "File access",
          description: "Allow connected apps to read selected files only when attached.",
          control: { type: "status", label: "Scoped", tone: "success" },
        }}
        onAction={onAction}
      />
    </SettingsGroupCard>
  </section>
);

export default SettingsSection;