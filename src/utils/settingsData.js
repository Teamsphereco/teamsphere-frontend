export const settingsGroups = [
  {
    label: "Account",
    categories: ["profile", "account-security", "devices-sessions"],
  },
  {
    label: "Experience",
    categories: ["notifications", "appearance", "chats-messaging", "audio-video", "accessibility"],
  },
  {
    label: "Privacy",
    categories: ["privacy-safety", "blocked-users", "contacts"],
  },
  {
    label: "Storage",
    categories: ["data-storage", "backups"],
  },
  {
    label: "App",
    categories: ["language-region", "integrations", "advanced", "help-about"],
  },
];

export const categories = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "account-security", label: "Account & Security", icon: "shield", badge: "Needs attention" },
  { id: "devices-sessions", label: "Devices & Sessions", icon: "devices", badge: "3" },
  { id: "notifications", label: "Notifications", icon: "bell" },
  { id: "appearance", label: "Appearance", icon: "palette" },
  { id: "chats-messaging", label: "Chats & Messaging", icon: "message" },
  { id: "audio-video", label: "Audio & Video", icon: "video", badge: "Beta" },
  { id: "accessibility", label: "Accessibility", icon: "accessibility" },
  { id: "privacy-safety", label: "Privacy & Safety", icon: "lock" },
  { id: "blocked-users", label: "Blocked Users", icon: "ban", badge: "2" },
  { id: "contacts", label: "Contacts", icon: "contacts" },
  { id: "data-storage", label: "Data & Storage", icon: "database" },
  { id: "backups", label: "Backups", icon: "cloud", badge: "New" },
  { id: "language-region", label: "Language & Region", icon: "globe" },
  { id: "integrations", label: "Integrations", icon: "plug", badge: "6" },
  { id: "advanced", label: "Advanced", icon: "terminal" },
  { id: "help-about", label: "Help & About", icon: "help" },
];

export const selectOptions = {
  status: [
    { label: "Online", value: "online" },
    { label: "Away", value: "away" },
    { label: "Do not disturb", value: "dnd" },
    { label: "Invisible", value: "invisible" },
  ],
  statusExpiration: [
    { label: "Today", value: "today" },
    { label: "4 hours", value: "4h" },
    { label: "Tomorrow", value: "tomorrow" },
    { label: "Never", value: "never" },
  ],
  sessionTimeout: [
    { label: "15 minutes", value: "15m" },
    { label: "30 minutes", value: "30m" },
    { label: "1 hour", value: "1h" },
    { label: "Never", value: "never" },
  ],
  quietTime: [
    { label: "7:00 PM", value: "19:00" },
    { label: "8:00 PM", value: "20:00" },
    { label: "10:00 PM", value: "22:00" },
    { label: "11:30 PM", value: "23:30" },
    { label: "6:00 AM", value: "06:00" },
    { label: "7:00 AM", value: "07:00" },
    { label: "8:00 AM", value: "08:00" },
  ],
  notificationSound: [
    { label: "Pulse", value: "pulse" },
    { label: "Soft bell", value: "soft-bell" },
    { label: "Glass", value: "glass" },
    { label: "None", value: "none" },
  ],
  theme: [
    { label: "System", value: "system" },
    { label: "Light", value: "light" },
    { label: "Dark", value: "dark" },
    { label: "High contrast", value: "high-contrast" },
  ],
  density: [
    { label: "Compact", value: "compact" },
    { label: "Comfortable", value: "comfortable" },
    { label: "Spacious", value: "spacious" },
  ],
  bubbleStyle: [
    { label: "Soft", value: "soft" },
    { label: "Minimal", value: "minimal" },
    { label: "Classic", value: "classic" },
  ],
  defaultReaction: [
    { label: "Thumbs up", value: "thumbs-up" },
    { label: "Heart", value: "heart" },
    { label: "Check", value: "check" },
    { label: "Party", value: "party" },
  ],
  forwardingBehavior: [
    { label: "Ask every time", value: "ask" },
    { label: "Include sender", value: "include-sender" },
    { label: "Clean copy", value: "clean" },
  ],
  sortOrder: [
    { label: "Most recent", value: "recent" },
    { label: "Unread first", value: "unread" },
    { label: "Pinned first", value: "pinned" },
  ],
  disappearingTimer: [
    { label: "Off", value: "off" },
    { label: "24 hours", value: "24h" },
    { label: "7 days", value: "7d" },
    { label: "30 days", value: "30d" },
  ],
  ringtone: [
    { label: "Signal", value: "signal" },
    { label: "Orbit", value: "orbit" },
    { label: "Chime", value: "chime" },
    { label: "None", value: "none" },
  ],
  visibility: [
    { label: "Everyone", value: "everyone" },
    { label: "Contacts", value: "contacts" },
    { label: "Nobody", value: "nobody" },
  ],
  messagePermissions: [
    { label: "Everyone", value: "everyone" },
    { label: "Contacts", value: "contacts" },
    { label: "Nobody", value: "nobody" },
  ],
  mediaPeriod: [
    { label: "30 days", value: "30d" },
    { label: "90 days", value: "90d" },
    { label: "1 year", value: "1y" },
    { label: "Forever", value: "forever" },
  ],
  quality: [
    { label: "Data saver", value: "data-saver" },
    { label: "Balanced", value: "balanced" },
    { label: "Original", value: "original" },
    { label: "Standard", value: "standard" },
  ],
  backupFrequency: [
    { label: "Off", value: "off" },
    { label: "Daily", value: "daily" },
    { label: "Weekly", value: "weekly" },
    { label: "Monthly", value: "monthly" },
  ],
  backupDestination: [
    { label: "iCloud Drive", value: "icloud" },
    { label: "Google Drive", value: "google-drive" },
    { label: "Local folder", value: "local" },
  ],
  language: [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "Spanish", value: "es" },
    { label: "Portuguese", value: "pt" },
  ],
  spellcheckLanguage: [
    { label: "English (US)", value: "en-us" },
    { label: "English (UK)", value: "en-gb" },
    { label: "French", value: "fr" },
    { label: "Spanish", value: "es" },
  ],
  region: [
    { label: "United States", value: "us" },
    { label: "Nigeria", value: "ng" },
    { label: "United Kingdom", value: "gb" },
    { label: "Germany", value: "de" },
  ],
  timeZone: [
    { label: "Automatic", value: "auto" },
    { label: "Africa/Lagos", value: "africa-lagos" },
    { label: "UTC", value: "utc" },
    { label: "America/New York", value: "america-new-york" },
  ],
  dateFormat: [
    { label: "May 14, 2026", value: "mmm-d-yyyy" },
    { label: "14 May 2026", value: "d-mmm-yyyy" },
    { label: "2026-05-14", value: "yyyy-mm-dd" },
  ],
  timeFormat: [
    { label: "12-hour", value: "12h" },
    { label: "24-hour", value: "24h" },
  ],
};

const row = (id, title, description, control, extra = {}) => ({
  id,
  title,
  description,
  control,
  ...extra,
});

const toggle = (key, toast) => ({ type: "toggle", key, toast });
const select = (key, options, toast) => ({ type: "select", key, options, toast });
const segmented = (key, options, toast) => ({ type: "segmented", key, options, toast });
const range = (key, min, max, step, suffix, toast) => ({
  type: "range",
  key,
  min,
  max,
  step,
  suffix,
  toast,
});
const button = (label, action, variant = "secondary") => ({ type: "button", label, action, variant });
const status = (label, tone = "neutral") => ({ type: "status", label, tone });

export const settingsContent = {
  profile: {
    title: "Profile",
    description: "Shape how your name, photo, presence, and identity appear across TeamSphere.",
    groups: [
      {
        title: "Public profile",
        description: "These details are visible to people who can find or message you.",
        rows: [
          row("display-name", "Display name", "Shown in chats, calls, mentions, and search results.", button("Edit", "edit-profile"), { metadata: "Synced from profile" }),
          row("username", "Username", "Your memorable TeamSphere handle for invites and mentions.", button("Edit", "edit-profile"), { metadata: "Public" }),
          row("bio", "Bio", "A short profile line that helps teammates recognize you.", button("Edit", "edit-profile")),
          row("profile-photo", "Profile photo", "Use your current avatar or open the existing photo flow later.", button("Change", "change-avatar")),
          row("status-message", "Custom status", "Share a short note beside your presence indicator.", button("Update", "status-message"), { metadata: "Available for focused work" }),
        ],
      },
      {
        title: "Presence",
        rows: [
          row("status", "Current status", "Choose how TeamSphere shows your availability.", select("status", selectOptions.status, "Status updated.")),
          row("show-online", "Show online status", "Let contacts know when you are actively using TeamSphere.", toggle("showOnlineStatus", "Presence visibility updated.")),
          row("last-active", "Show last active", "Display an approximate last active time on your profile.", toggle("showLastActive", "Last active visibility updated.")),
          row("status-expiration", "Status expiration", "Automatically clear your custom status after a set period.", select("statusExpiration", selectOptions.statusExpiration)),
        ],
      },
      {
        title: "Account identity",
        rows: [
          row("email", "Email address", "Used for login, receipts, and security alerts.", status("Verified", "success"), { metadata: "Primary" }),
          row("phone", "Phone number", "Optional recovery and contact discovery identifier.", button("Add", "add-phone")),
          row("connected", "Connected accounts", "Google and workspace identity providers connected to this account.", button("Manage", "manage-connections"), { badge: "2 connected" }),
          row("verified", "Verified account", "A verified identity badge helps contacts trust your profile.", status("Active", "success")),
        ],
      },
    ],
  },
  "account-security": {
    title: "Account & Security",
    description: "Protect sign-in, recovery options, and high-risk account actions.",
    groups: [
      {
        title: "Login",
        rows: [
          row("password", "Password", "Last changed 43 days ago.", button("Change", "change-password")),
          row("passkeys", "Passkeys", "Use device passkeys for faster, phishing-resistant sign-in.", toggle("passkeys", "Passkey preference updated."), { badge: "Recommended" }),
          row("two-factor", "Two-factor authentication", "Require a second factor when signing in on a new device.", toggle("twoFactorAuth", "Two-factor preference updated.")),
          row("recovery-email", "Recovery email", "Keep a fallback email for account recovery.", toggle("recoveryEmail")),
          row("trusted-devices", "Trusted devices", "Skip extra challenges on devices you approve.", toggle("trustedDevices")),
        ],
      },
      {
        title: "Security alerts",
        rows: [
          row("login-alerts", "New login alerts", "Notify you whenever a new device signs in.", toggle("newLoginAlerts")),
          row("activity-alerts", "Suspicious activity alerts", "Warn about unusual location, device, or session activity.", toggle("suspiciousActivityAlerts")),
          row("timeout", "Session timeout", "Lock idle web sessions after a chosen time.", select("sessionTimeout", selectOptions.sessionTimeout)),
          row("biometrics", "Require biometrics to open app", "Ask for Face ID, Touch ID, or a device unlock before opening TeamSphere.", toggle("requireBiometrics")),
        ],
      },
      {
        title: "Danger zone",
        danger: true,
        rows: [
          row("export-data", "Export account data", "Prepare a downloadable archive of account and message metadata.", button("Export", "export-data")),
          row("deactivate", "Deactivate account", "Temporarily hide your profile and pause new messages.", button("Deactivate", "deactivate-account", "danger")),
          row("delete", "Delete account", "Permanently remove your account after a confirmation step.", button("Delete", "delete-account", "danger")),
        ],
      },
    ],
  },
  "devices-sessions": {
    title: "Devices & Sessions",
    description: "Review where you are signed in and how new devices are approved.",
    groups: [
      {
        title: "Add device",
        rows: [
          row("link-device", "Link new device", "Open TeamSphere on another device and scan the QR placeholder.", button("Show QR", "show-qr")),
          row("trusted", "Trust this device", "Mark the current device as trusted for fewer prompts.", status("Trusted", "success")),
        ],
      },
      {
        title: "Session security",
        rows: [
          row("approval", "Require approval for new devices", "New sign-ins must be approved from an existing trusted device.", toggle("requireDeviceApproval")),
          row("notify", "Notify on new sign-in", "Send a push and email alert when a new session starts.", toggle("notifyNewSignIn")),
          row("logout-all", "Log out all other devices", "End every session except the current device.", button("Review", "logout-all-devices", "danger")),
        ],
      },
    ],
  },
  notifications: {
    title: "Notifications",
    description: "Tune alerts for messages, mentions, quiet hours, and priority chats.",
    groups: [
      {
        title: "Global notifications",
        rows: [
          row("enabled", "Enable notifications", "Receive desktop, mobile, and browser notifications.", toggle("notificationsEnabled", "Notification preference updated.")),
          row("previews", "Show message previews", "Include sender and message snippets in notifications.", toggle("notificationPreviews")),
          row("badge", "Badge count", "Show unread counts on app icons and tabs.", toggle("badgeCount")),
          row("sound", "Sound", "Choose a compact notification tone.", select("notificationSound", selectOptions.notificationSound)),
          row("vibration", "Vibration", "Vibrate supported mobile devices for incoming alerts.", toggle("vibration")),
          row("test", "Test notification", "Preview the current notification style.", button("Test", "test-notification", "primary")),
        ],
      },
      {
        title: "Message notifications",
        rows: [
          row("direct", "Direct messages", "Alert for one-on-one messages.", toggle("directMessages")),
          row("groups", "Group chats", "Alert for messages in group conversations.", toggle("groupChats")),
          row("mentions", "Mentions", "Always alert when someone mentions you.", toggle("mentions")),
          row("replies", "Replies", "Alert when someone replies to your message.", toggle("replies")),
          row("reactions", "Reactions", "Notify when a teammate reacts to your messages.", toggle("reactions")),
          row("joined", "Contact joined", "Tell you when someone from contacts joins TeamSphere.", toggle("contactJoined")),
        ],
      },
      {
        title: "Quiet hours",
        rows: [
          row("quiet", "Do not disturb schedule", "Mute non-urgent notifications during your quiet window.", toggle("quietHoursEnabled")),
          row("quiet-start", "Start", "When quiet hours begin.", select("quietHoursStart", selectOptions.quietTime)),
          row("quiet-end", "End", "When quiet hours end.", select("quietHoursEnd", selectOptions.quietTime)),
          row("calls", "Mute during calls", "Suppress message pings while you are in a TeamSphere call.", toggle("muteDuringCalls")),
          row("weekend", "Weekend quiet mode", "Use a calmer weekend notification schedule.", toggle("weekendQuietMode")),
          row("urgent", "Allow urgent mentions", "Let urgent mentions bypass quiet hours.", toggle("allowUrgentMentions")),
        ],
      },
      {
        title: "Per-chat overrides",
        rows: [
          row("muted", "Muted chats", "Three conversations are muted until you re-enable them.", button("Review", "review-muted"), { badge: "3 muted" }),
          row("tones", "Custom tones", "Assign tones to key contacts and project rooms.", button("Manage", "custom-tones")),
          row("priority", "Priority conversations", "Promote key chats above normal notification rules.", button("Manage", "priority-conversations"), { badge: "5" }),
        ],
      },
    ],
  },
  appearance: {
    title: "Appearance",
    description: "Adjust theme, density, typography, motion, and chat display details.",
    groups: [
      {
        title: "Theme",
        rows: [
          row("theme", "Theme", "Follow the system theme or choose a fixed appearance.", segmented("theme", selectOptions.theme, "Theme updated.")),
        ],
      },
      {
        title: "Chat display",
        rows: [
          row("density", "Density", "Control vertical spacing in chat lists and message threads.", segmented("chatDensity", selectOptions.density)),
          row("bubble", "Bubble style", "Choose a message shape that fits your reading preference.", segmented("bubbleStyle", selectOptions.bubbleStyle)),
          row("radius", "Message radius", "Fine-tune message bubble corner radius.", range("messageRadius", 4, 20, 1, "px")),
          row("avatars", "Show avatars", "Display sender avatars in threads and previews.", toggle("showAvatars")),
          row("timestamps", "Show timestamps", "Display message sent times inline.", toggle("showTimestamps")),
          row("reads", "Show read states", "Show sent, delivered, and read indicators where available.", toggle("showReadStates")),
        ],
      },
      {
        title: "Typography",
        rows: [
          row("font-size", "App font size", "Adjust the base interface font size.", range("appFontSize", 14, 20, 1, "px")),
          row("message-size", "Message text size", "Adjust message body text independently.", range("messageTextSize", 13, 20, 1, "px")),
          row("code-size", "Code block font size", "Adjust code snippets and mono metadata.", range("codeFontSize", 12, 18, 1, "px")),
        ],
      },
      {
        title: "Motion",
        rows: [
          row("motion", "Reduce motion", "Minimize movement across panels, previews, and toasts.", toggle("reduceMotion")),
          row("emoji", "Animated emoji", "Play animated emoji and sticker reactions.", toggle("animatedEmoji")),
          row("typing", "Typing animation", "Show typing indicator dots in active chats.", toggle("typingAnimation")),
        ],
      },
    ],
  },
  "chats-messaging": {
    title: "Chats & Messaging",
    description: "Control composing, message behavior, organization, and disappearing messages.",
    groups: [
      {
        title: "Compose behavior",
        rows: [
          row("enter", "Enter to send", "Press Enter to send. Shift+Enter keeps adding a line break.", toggle("enterToSend")),
          row("drafts", "Auto-save drafts", "Keep unfinished messages across chat switches.", toggle("autoSaveDrafts")),
          row("spellcheck", "Spellcheck", "Use browser spelling suggestions while composing.", toggle("spellcheck")),
          row("smart", "Smart replies", "Suggest short replies in fast-moving conversations.", toggle("smartReplies"), { badge: "Beta" }),
        ],
      },
      {
        title: "Message behavior",
        rows: [
          row("links", "Link previews", "Show preview cards for supported links.", toggle("linkPreviews")),
          row("reaction", "Default reaction", "Pick the reaction used by double tap or quick action.", select("defaultReaction", selectOptions.defaultReaction)),
          row("gifs", "Auto-play GIFs", "Play GIFs automatically in the message thread.", toggle("autoplayGifs")),
          row("voice", "Auto-play voice messages", "Continue voice notes hands-free after playback starts.", toggle("autoplayVoice")),
          row("forward", "Forwarding behavior", "Choose how forwarded messages carry attribution.", select("forwardingBehavior", selectOptions.forwardingBehavior)),
        ],
      },
      {
        title: "Organization",
        rows: [
          row("folders", "Chat folders", "Group chats into personal, work, and project folders.", toggle("chatFolders")),
          row("archived", "Archived chats", "Keep archived conversations out of the main list.", toggle("archivedChats")),
          row("pinned", "Pinned chats", "Show pinned conversations at the top.", toggle("pinnedChats")),
          row("unread", "Unread filters", "Quickly filter to unread conversations.", toggle("unreadFilters")),
          row("sort", "Sort order", "Choose how conversations are ordered.", select("sortOrder", selectOptions.sortOrder)),
        ],
      },
      {
        title: "Disappearing messages",
        rows: [
          row("timer", "Default timer", "Apply an expiration timer to newly created chats.", select("disappearingTimer", selectOptions.disappearingTimer)),
          row("starred", "Keep starred messages", "Never expire messages you explicitly star.", toggle("keepStarredMessages")),
          row("warning", "Expiry warning", "Warn before messages disappear from active conversations.", toggle("expiryWarning")),
        ],
      },
    ],
  },
  "audio-video": {
    title: "Audio & Video",
    description: "Manage call devices, voice processing, camera defaults, and diagnostics.",
    groups: [
      {
        title: "Voice processing",
        rows: [
          row("noise", "Noise suppression", "Reduce background noise during calls.", toggle("noiseSuppression")),
          row("echo", "Echo cancellation", "Prevent audio feedback from speakers and microphones.", toggle("echoCancellation")),
          row("gain", "Automatic gain control", "Balance your microphone volume automatically.", toggle("autoGainControl")),
          row("sensitivity", "Input sensitivity", "Set how easily TeamSphere detects speech.", range("inputSensitivity", 0, 100, 1, "%")),
        ],
      },
      {
        title: "Video",
        rows: [
          row("hd", "HD video", "Prefer high resolution when bandwidth allows.", toggle("hdVideo")),
          row("blur", "Background blur", "Soften your background before joining calls.", toggle("backgroundBlur")),
          row("mirror", "Mirror video", "Show your own camera preview mirrored.", toggle("mirrorVideo")),
          row("low-light", "Low-light correction", "Improve camera visibility in darker rooms.", toggle("lowLightCorrection")),
        ],
      },
      {
        title: "Calls",
        rows: [
          row("muted", "Join muted", "Start calls with microphone muted.", toggle("joinMuted")),
          row("camera-off", "Camera off by default", "Join video calls without sending camera until enabled.", toggle("cameraOffByDefault")),
          row("ringtone", "Call ringtone", "Choose the incoming call sound.", select("callRingtone", selectOptions.ringtone)),
          row("ptt", "Push-to-talk", "Hold a shortcut to temporarily unmute.", toggle("pushToTalk")),
          row("diagnostics", "Call diagnostics", "Show network and media stats during calls.", toggle("callDiagnostics")),
        ],
      },
    ],
  },
  accessibility: {
    title: "Accessibility",
    description: "Make TeamSphere easier to read, navigate, hear, and operate.",
    groups: [
      {
        title: "Reading",
        rows: [
          row("reading-size", "Font size", "Increase or reduce text size for readability.", range("readingFontSize", 14, 22, 1, "px")),
          row("contrast", "High contrast", "Use stronger contrast for text, controls, and rails.", toggle("highContrast")),
          row("transparency", "Reduce transparency", "Minimize translucent surfaces and overlays.", toggle("reduceTransparency")),
          row("spacing", "Message spacing", "Adjust spacing between message groups.", segmented("messageSpacing", selectOptions.density)),
        ],
      },
      {
        title: "Motion and effects",
        rows: [
          row("reduce-motion", "Reduce motion", "Respect reduced motion across interface transitions.", toggle("reduceMotion")),
          row("stickers", "Animated stickers", "Play animated stickers in conversations.", toggle("animatedStickers")),
          row("media", "Autoplay media", "Start media playback automatically where supported.", toggle("autoplayMedia")),
          row("flashing", "Flashing effects", "Permit flashing effects in reactions and shared media.", toggle("flashingEffects")),
        ],
      },
      {
        title: "Input",
        rows: [
          row("shortcuts", "Keyboard shortcuts", "Enable app-wide keyboard shortcuts.", toggle("keyboardShortcuts")),
          row("focus", "Focus indicators", "Always show visible keyboard focus rings.", toggle("focusIndicators")),
          row("touch", "Large touch targets", "Increase control height for touch-first use.", toggle("largeTouchTargets")),
          row("screen-reader", "Screen reader optimization", "Prefer descriptive labels and simplified live regions.", toggle("screenReaderOptimization")),
        ],
      },
      {
        title: "Calls",
        rows: [
          row("captions", "Live captions", "Show captions during supported calls.", toggle("liveCaptions"), { badge: "Beta" }),
          row("mono", "Mono audio", "Play call audio through both channels equally.", toggle("monoAudio")),
          row("visual", "Visual call alerts", "Flash a clear visual alert for incoming calls.", toggle("visualCallAlerts")),
        ],
      },
    ],
  },
  "privacy-safety": {
    title: "Privacy & Safety",
    description: "Decide who can see you, contact you, call you, and interact safely.",
    groups: [
      {
        title: "Visibility",
        rows: [
          row("photo", "Profile photo", "Choose who can see your avatar.", select("profilePhotoVisibility", selectOptions.visibility)),
          row("bio", "Bio", "Choose who can see your profile bio.", select("bioVisibility", selectOptions.visibility)),
          row("online", "Online status", "Choose who can see when you are online.", select("onlineStatusVisibility", selectOptions.visibility)),
          row("last-seen", "Last seen", "Choose who can see approximate last active times.", select("lastSeenVisibility", selectOptions.visibility)),
          row("read", "Read receipts", "Let people know when you have read their messages.", toggle("readReceipts")),
          row("typing", "Typing indicators", "Show when you are composing a reply.", toggle("typingIndicators")),
        ],
      },
      {
        title: "Messaging permissions",
        rows: [
          row("message-me", "Who can message me", "Control who can start a new direct conversation.", select("whoCanMessage", selectOptions.messagePermissions)),
          row("requests", "Message requests", "Route unknown senders into requests before they reach your inbox.", toggle("messageRequests")),
          row("unknown", "Filter unknown senders", "Separate messages from people outside your contacts.", toggle("filterUnknownSenders")),
          row("invites", "Group invitations", "Choose who can add you to group chats.", select("groupInvitations", selectOptions.messagePermissions)),
          row("mentions", "Mentions from unknown users", "Allow people outside contacts to mention you.", toggle("unknownMentions")),
        ],
      },
      {
        title: "Calls",
        rows: [
          row("call-me", "Who can call me", "Control who can start voice and video calls.", select("whoCanCall", selectOptions.messagePermissions)),
          row("silence", "Silence unknown callers", "Send unknown callers to missed calls without ringing.", toggle("silenceUnknownCallers")),
          row("hide-ip", "Hide IP during calls", "Route supported calls to protect your network address.", toggle("hideIpDuringCalls")),
          row("approval", "Require call approval", "Ask before connecting unknown callers.", toggle("requireCallApproval")),
        ],
      },
      {
        title: "Safety",
        rows: [
          row("sensitive", "Sensitive content filter", "Blur potentially sensitive images before opening.", toggle("sensitiveContentFilter")),
          row("preview", "Link preview protection", "Fetch link previews without exposing your device context.", toggle("linkPreviewProtection")),
          row("scan", "Suspicious link scan", "Warn before opening links that look risky.", toggle("suspiciousLinkScan")),
          row("reported", "Reported users history", "Review users you reported in the last 90 days.", button("View", "reported-history")),
          row("checkup", "Privacy checkup", "Review visibility, calls, and message permissions in one pass.", button("Start", "privacy-checkup", "primary")),
        ],
      },
    ],
  },
  "blocked-users": {
    title: "Blocked Users",
    description: "Manage people who cannot message you, call you, or see your online status.",
    groups: [],
  },
  contacts: {
    title: "Contacts",
    description: "Control contact sync, discovery, invites, and profile sharing.",
    groups: [
      {
        title: "Contact sync",
        rows: [
          row("sync", "Sync contacts", "Upload address book hashes to help find people you know.", toggle("syncContacts")),
          row("import", "Import contacts", "Upload a contacts file from another service.", button("Import", "import-contacts")),
          row("permissions", "Permissions", "Contacts permission is currently not granted in this browser.", button("Grant access", "grant-contacts"), { badge: "Not granted" }),
          row("suggested", "Suggested contacts", "Recommend teammates based on mutual groups and synced contacts.", toggle("suggestedContacts")),
        ],
      },
      {
        title: "Discovery",
        rows: [
          row("phone", "Find by phone", "Let people who have your phone number find you.", toggle("findByPhone")),
          row("handle", "Find by handle", "Let people search your public @handle.", toggle("findByHandle")),
          row("mutual", "Mutual contacts", "Show mutual contact context in search results.", toggle("mutualContacts")),
        ],
      },
      {
        title: "Invites",
        rows: [
          row("invite", "Invite friends", "Create a shareable invite to TeamSphere.", button("Invite", "invite-friends")),
          row("share", "Share profile link", "Copy your profile link for direct connection requests.", button("Copy", "copy-profile-link")),
          row("qr", "QR profile code", "Show a QR placeholder for in-person profile sharing.", button("Show", "show-profile-qr")),
        ],
      },
    ],
  },
  "data-storage": {
    title: "Data & Storage",
    description: "Review storage usage, media handling, cleanup, and network controls.",
    groups: [
      {
        title: "Media handling",
        rows: [
          row("wifi", "Auto-download on Wi-Fi", "Download media automatically on trusted Wi-Fi networks.", toggle("autoDownloadWifi")),
          row("cellular", "Auto-download on cellular", "Download media automatically when using mobile data.", toggle("autoDownloadCellular")),
          row("upload-quality", "Upload quality", "Choose the default media upload quality.", select("uploadQuality", selectOptions.quality)),
          row("download-quality", "Download quality", "Choose the default media download quality.", select("downloadQuality", selectOptions.quality)),
          row("save", "Save media to device", "Save downloaded media into the device photo library or downloads folder.", toggle("saveMediaToDevice")),
        ],
      },
      {
        title: "Cleanup",
        rows: [
          row("cache", "Clear cache", "Remove cached media and temporary files from this device.", button("Clear", "clear-cache", "danger")),
          row("review", "Review large files", "Find videos, archives, and images taking the most space.", button("Review", "review-large-files", "primary")),
          row("old", "Delete old media", "Choose how long TeamSphere keeps downloaded media locally.", select("keepMediaPeriod", selectOptions.mediaPeriod)),
        ],
      },
      {
        title: "Network",
        rows: [
          row("saver", "Data saver", "Reduce image previews, auto downloads, and background traffic.", toggle("dataSaver")),
          row("call-data", "Reduce call data usage", "Use more efficient call settings on slower connections.", toggle("reduceCallData")),
          row("usage", "Network usage", "Review sent, received, and call data totals.", button("View", "network-usage")),
        ],
      },
    ],
  },
  backups: {
    title: "Backups",
    description: "Prepare recoverable chat backups and exports without connecting fake services.",
    groups: [
      {
        title: "Chat backup",
        rows: [
          row("frequency", "Frequency", "Choose how often TeamSphere prepares local backup metadata.", select("backupFrequency", selectOptions.backupFrequency)),
          row("destination", "Destination", "Pick a destination placeholder for future backups.", select("backupDestination", selectOptions.backupDestination)),
          row("videos", "Include videos", "Videos make backups much larger.", toggle("includeVideosBackup")),
          row("encrypted", "Encrypted backup", "Protect backup contents with end-to-end encryption.", toggle("encryptedBackup")),
          row("last", "Last backup", "Most recent simulated backup status.", status("Today, 9:42 AM", "success")),
        ],
      },
      {
        title: "Restore",
        rows: [
          row("restore", "Restore from backup", "Select a backup file or connected storage provider later.", button("Restore", "restore-backup")),
          row("health", "Backup health", "No issues found in the latest backup check.", status("Healthy", "success")),
          row("export", "Export backup", "Create a local export for safekeeping.", button("Export", "export-backup")),
        ],
      },
    ],
  },
  "language-region": {
    title: "Language & Region",
    description: "Set language, translation, time, date, and regional formatting.",
    groups: [
      {
        title: "Language",
        rows: [
          row("app", "App language", "Language used across TeamSphere.", select("appLanguage", selectOptions.language)),
          row("translation", "Translation language", "Default language for translated messages.", select("translationLanguage", selectOptions.language)),
          row("spellcheck", "Spellcheck language", "Language used by compose spellcheck.", select("spellcheckLanguage", selectOptions.spellcheckLanguage)),
        ],
      },
      {
        title: "Region",
        rows: [
          row("region", "Region", "Used for local formatting and compliance defaults.", select("region", selectOptions.region)),
          row("timezone", "Time zone", "Choose a fixed time zone or use device settings.", select("timeZone", selectOptions.timeZone)),
          row("date", "Date format", "How dates appear in chat lists and messages.", select("dateFormat", selectOptions.dateFormat)),
          row("time", "Time format", "How message and call times are displayed.", select("timeFormat", selectOptions.timeFormat)),
        ],
      },
    ],
  },
  integrations: {
    title: "Integrations",
    description: "Review connected apps, bots, and permission scopes.",
    groups: [],
  },
  advanced: {
    title: "Advanced",
    description: "Developer controls, diagnostics, performance preferences, and reset actions.",
    groups: [
      {
        title: "Developer",
        rows: [
          row("dev", "Developer mode", "Expose technical labels and experimental panels.", toggle("developerMode"), { metadata: "flag.dev_mode" }),
          row("ids", "Copy message IDs", "Show copy controls for message, chat, and user IDs.", toggle("copyMessageIds"), { metadata: "flag.copy_ids" }),
          row("debug", "Show debug info", "Display latency, route, and state metadata in app panels.", toggle("showDebugInfo"), { metadata: "flag.debug_ui" }),
          row("experiments", "Experimental features", "Try features that may change or disappear.", toggle("experimentalFeatures"), { badge: "Lab" }),
        ],
      },
      {
        title: "Diagnostics",
        rows: [
          row("network", "Network diagnostics", "Run connection checks for chat, calls, and notifications.", toggle("networkDiagnostics"), { metadata: "diag.net" }),
          row("logs", "Export logs", "Create a local diagnostic bundle for support.", button("Export", "export-logs"), { metadata: "logs.local" }),
          row("crash", "Crash reports", "Send anonymized crash reports to help improve TeamSphere.", toggle("crashReports"), { metadata: "telemetry.crash" }),
          row("database", "Clear local database", "Remove local drafts, cached metadata, and temporary storage.", button("Clear", "clear-local-database", "danger")),
          row("reset", "Reset app data", "Restore local settings and sample settings data to defaults.", button("Reset", "reset-app-data", "danger")),
        ],
      },
      {
        title: "Performance",
        rows: [
          row("gpu", "Hardware acceleration", "Use GPU acceleration for previews and video where available.", toggle("hardwareAcceleration")),
          row("memory", "Low memory mode", "Reduce background work and media caching.", toggle("lowMemoryMode")),
          row("sync", "Background sync", "Keep messages and notifications synchronized while minimized.", toggle("backgroundSync")),
        ],
      },
    ],
  },
  "help-about": {
    title: "Help & About",
    description: "Find support, send feedback, and review app details.",
    groups: [
      {
        title: "Support",
        rows: [
          row("help", "Help center", "Browse guides and troubleshooting articles.", button("Open", "help-center")),
          row("support", "Contact support", "Send logs and a short note to TeamSphere support.", button("Contact", "contact-support")),
          row("bug", "Report a bug", "Share reproduction details with the team.", button("Report", "report-bug")),
          row("feedback", "Send feedback", "Tell us what should feel better.", button("Send", "send-feedback")),
        ],
      },
      {
        title: "About",
        rows: [
          row("version", "App version", "TeamSphere frontend build.", status("0.0.0", "neutral"), { metadata: "Vite" }),
          row("release", "Release notes", "See what changed in the latest release.", button("View", "release-notes")),
          row("terms", "Terms", "Review TeamSphere service terms.", button("Open", "terms")),
          row("privacy", "Privacy policy", "Review how TeamSphere handles data.", button("Open", "privacy-policy")),
          row("licenses", "Licenses", "Open-source notices for bundled packages.", button("View", "licenses")),
        ],
      },
    ],
  },
};

export const integrations = [
  { id: "google-drive", name: "Google Drive", account: "devine@teamsphere.co", permissions: "Backups and file picker", status: "Connected", tone: "success" },
  { id: "calendar", name: "Calendar", account: "Workspace calendar", permissions: "Availability and meeting links", status: "Connected", tone: "success" },
  { id: "github", name: "GitHub", account: "Teamsphereco", permissions: "Issue links and previews", status: "Connected", tone: "success" },
  { id: "notion", name: "Notion", account: "Not connected", permissions: "Page previews", status: "Available", tone: "neutral" },
  { id: "figma", name: "Figma", account: "Design workspace", permissions: "File embeds", status: "Connected", tone: "success" },
  { id: "zoom", name: "Zoom", account: "Not connected", permissions: "Meeting handoff", status: "Available", tone: "neutral" },
];

export const storageSegments = [
  { label: "Images", value: 32, size: "2.8 GB" },
  { label: "Videos", value: 27, size: "2.3 GB" },
  { label: "Files", value: 18, size: "1.5 GB" },
  { label: "Voice", value: 9, size: "760 MB" },
  { label: "Cache", value: 14, size: "1.2 GB" },
];

export const previewCopy = {
  profile: "A compact identity preview shows how contacts see your profile.",
  "account-security": "Security changes stay local in this demo, with confirmations for risky actions.",
  "devices-sessions": "Linked sessions can be reviewed and removed without contacting the backend.",
  notifications: "Notification previews update from your local preferences.",
  appearance: "Theme, density, typography, and motion controls drive the live chat preview.",
  "chats-messaging": "Compose and organization defaults mirror common messaging app preferences.",
  "audio-video": "Device lists use browser media devices when available, with sample fallback values.",
  accessibility: "Reading, motion, input, and call accessibility are grouped as first-class settings.",
  "privacy-safety": "The privacy checkup summarizes the strongest active protections.",
  "blocked-users": "Blocked users are loaded from your account and can be unblocked with confirmation.",
  contacts: "Contact sync and discovery settings clearly separate privacy-sensitive controls.",
  "data-storage": "Storage totals are sample values with a working clear-cache action.",
  backups: "Backup settings are placeholders for future real persistence.",
  "language-region": "Language and regional choices are stored locally.",
  integrations: "Integrations show realistic connection and permission states without OAuth calls.",
  advanced: "Diagnostics and reset actions are separated from ordinary preferences.",
  "help-about": "Support and about links are present as app affordances only.",
};

export const getCategory = (categoryId) => categories.find((category) => category.id === categoryId);

export const getSearchResults = (query) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return [];
  }

  return categories.filter((category) => category.id !== "profile").flatMap((category) => {
    const content = settingsContent[category.id];
    const rows = content.groups.flatMap((group) => group.rows.map((item) => ({ ...item, group: group.title })));
    const categoryMatch = `${category.label} ${content.title} ${content.description}`.toLowerCase().includes(normalizedQuery);
    const matches = rows.filter((item) => (
      `${item.title} ${item.description} ${item.group} ${category.label}`.toLowerCase().includes(normalizedQuery)
    ));

    if (!categoryMatch && matches.length === 0) {
      return [];
    }

    return [{ category, content, matches: categoryMatch && matches.length === 0 ? rows.slice(0, 3) : matches }];
  });
};