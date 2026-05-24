import { create } from "zustand";

const STORAGE_KEY = "teamsphere-settings";

export const defaultSettings = {
  status: "online",
  showOnlineStatus: true,
  showLastActive: true,
  customStatus: "Available for focused work",
  statusExpiration: "today",
  twoFactorAuth: true,
  passkeys: false,
  recoveryEmail: true,
  trustedDevices: true,
  newLoginAlerts: true,
  suspiciousActivityAlerts: true,
  sessionTimeout: "30m",
  requireBiometrics: false,
  requireDeviceApproval: true,
  notifyNewSignIn: true,
  notificationsEnabled: true,
  notificationPreviews: true,
  badgeCount: true,
  notificationSound: "pulse",
  vibration: true,
  directMessages: true,
  groupChats: true,
  mentions: true,
  replies: true,
  reactions: false,
  contactJoined: false,
  quietHoursEnabled: true,
  quietHoursStart: "22:00",
  quietHoursEnd: "07:00",
  muteDuringCalls: true,
  weekendQuietMode: false,
  allowUrgentMentions: true,
  theme: "system",
  chatDensity: "comfortable",
  bubbleStyle: "soft",
  messageRadius: 12,
  showAvatars: true,
  showTimestamps: true,
  showReadStates: true,
  appFontSize: 16,
  messageTextSize: 15,
  codeFontSize: 13,
  reduceMotion: false,
  animatedEmoji: true,
  typingAnimation: true,
  enterToSend: true,
  autoSaveDrafts: true,
  spellcheck: true,
  smartReplies: false,
  linkPreviews: true,
  defaultReaction: "thumbs-up",
  autoplayGifs: false,
  autoplayVoice: true,
  forwardingBehavior: "ask",
  chatFolders: true,
  archivedChats: true,
  pinnedChats: true,
  unreadFilters: true,
  sortOrder: "recent",
  disappearingTimer: "off",
  keepStarredMessages: true,
  expiryWarning: true,
  microphone: "system",
  speaker: "system",
  camera: "system",
  noiseSuppression: true,
  echoCancellation: true,
  autoGainControl: true,
  inputSensitivity: 64,
  hdVideo: true,
  backgroundBlur: false,
  mirrorVideo: true,
  lowLightCorrection: true,
  joinMuted: false,
  cameraOffByDefault: true,
  callRingtone: "signal",
  pushToTalk: false,
  callDiagnostics: false,
  profilePhotoVisibility: "contacts",
  bioVisibility: "everyone",
  onlineStatusVisibility: "contacts",
  lastSeenVisibility: "contacts",
  readReceipts: true,
  typingIndicators: true,
  whoCanMessage: "contacts",
  messageRequests: true,
  filterUnknownSenders: true,
  groupInvitations: "contacts",
  unknownMentions: false,
  whoCanCall: "contacts",
  silenceUnknownCallers: true,
  hideIpDuringCalls: true,
  requireCallApproval: true,
  sensitiveContentFilter: true,
  linkPreviewProtection: true,
  suspiciousLinkScan: true,
  syncContacts: false,
  suggestedContacts: true,
  findByPhone: false,
  findByHandle: true,
  mutualContacts: true,
  readingFontSize: 16,
  highContrast: false,
  reduceTransparency: true,
  messageSpacing: "comfortable",
  animatedStickers: true,
  autoplayMedia: false,
  flashingEffects: false,
  keyboardShortcuts: true,
  focusIndicators: true,
  largeTouchTargets: false,
  screenReaderOptimization: false,
  liveCaptions: false,
  monoAudio: false,
  visualCallAlerts: true,
  autoDownloadWifi: true,
  autoDownloadCellular: false,
  uploadQuality: "balanced",
  downloadQuality: "standard",
  saveMediaToDevice: false,
  keepMediaPeriod: "90d",
  dataSaver: false,
  reduceCallData: true,
  backupFrequency: "weekly",
  backupDestination: "icloud",
  includeVideosBackup: false,
  encryptedBackup: true,
  backupEnabled: true,
  appLanguage: "en",
  translationLanguage: "en",
  spellcheckLanguage: "en-us",
  region: "us",
  timeZone: "auto",
  dateFormat: "mmm-d-yyyy",
  timeFormat: "12h",
  developerMode: false,
  copyMessageIds: false,
  showDebugInfo: false,
  experimentalFeatures: false,
  networkDiagnostics: true,
  crashReports: true,
  hardwareAcceleration: true,
  lowMemoryMode: false,
  backgroundSync: true,
};

const defaultBlockedUsers = [
  {
    id: "blocked-1",
    name: "Mara Stone",
    handle: "@mara.stone",
    blockedDate: "Blocked Apr 28",
    avatar: "MS",
  },
  {
    id: "blocked-2",
    name: "Noah West",
    handle: "@nowest",
    blockedDate: "Blocked May 4",
    avatar: "NW",
  },
];

const defaultLinkedDevices = [
  {
    id: "session-current",
    name: "MacBook Pro",
    app: "TeamSphere Desktop",
    platform: "macOS Sonoma",
    location: "Lagos, Nigeria",
    lastActive: "Active now",
    trusted: true,
    current: true,
  },
  {
    id: "session-iphone",
    name: "iPhone 15",
    app: "TeamSphere iOS",
    platform: "iOS 18",
    location: "Lagos, Nigeria",
    lastActive: "12 minutes ago",
    trusted: true,
    current: false,
  },
  {
    id: "session-chrome",
    name: "Chrome Browser",
    app: "TeamSphere Web",
    platform: "Windows 11",
    location: "Abuja, Nigeria",
    lastActive: "Yesterday",
    trusted: false,
    current: false,
  },
];

const readStoredSettings = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error("Could not read local TeamSphere settings.", error);
    return {};
  }
};

const persistSettings = (settings) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Could not persist local TeamSphere settings.", error);
  }
};

const storedState = readStoredSettings();

const useSettings = create((set, get) => ({
  settings: { ...defaultSettings, ...(storedState.settings || {}) },
  blockedUsers: storedState.blockedUsers || defaultBlockedUsers,
  linkedDevices: storedState.linkedDevices || defaultLinkedDevices,
  cacheClearing: false,
  updateSetting: (key, value) => {
    const nextSettings = { ...get().settings, [key]: value };
    persistSettings({
      settings: nextSettings,
      blockedUsers: get().blockedUsers,
      linkedDevices: get().linkedDevices,
    });
    set({ settings: nextSettings });
  },
  unblockUser: (userId) => {
    const blockedUsers = get().blockedUsers.filter((user) => user.id !== userId);
    persistSettings({ settings: get().settings, blockedUsers, linkedDevices: get().linkedDevices });
    set({ blockedUsers });
  },
  removeLinkedDevice: (deviceId) => {
    const linkedDevices = get().linkedDevices.filter((device) => device.id !== deviceId);
    persistSettings({ settings: get().settings, blockedUsers: get().blockedUsers, linkedDevices });
    set({ linkedDevices });
  },
  removeOtherDevices: () => {
    const linkedDevices = get().linkedDevices.filter((device) => device.current);
    persistSettings({ settings: get().settings, blockedUsers: get().blockedUsers, linkedDevices });
    set({ linkedDevices });
  },
  clearCache: () => {
    set({ cacheClearing: true });
    return new Promise((resolve) => {
      window.setTimeout(() => {
        set({ cacheClearing: false });
        resolve();
      }, 900);
    });
  },
  resetSettings: () => {
    persistSettings({
      settings: defaultSettings,
      blockedUsers: defaultBlockedUsers,
      linkedDevices: defaultLinkedDevices,
    });
    set({
      settings: defaultSettings,
      blockedUsers: defaultBlockedUsers,
      linkedDevices: defaultLinkedDevices,
    });
  },
}));

export default useSettings;