import { Icon } from "./SettingsControls";

const SettingsHeader = ({ searchQuery, onSearchChange }) => (
  <header className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)] sm:p-6">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-xs text-[#888888]">TEAMSPHERE SETTINGS</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-[#171717] sm:text-4xl">Settings.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[#4d4d4d] sm:text-base">
          Manage your account, privacy, notifications, devices, and messaging preferences.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 xl:w-[420px]">
        <label className="sr-only" htmlFor="settings-search">Search settings</label>
        <div className="flex min-h-11 items-center gap-2 rounded-lg border border-[#ebebeb] bg-[#fafafa] px-3 transition focus-within:border-[#0070f3] focus-within:ring-2 focus-within:ring-[#d3e5ff]">
          <Icon name="search" className="h-4 w-4 text-[#888888]" />
          <input
            id="settings-search"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search settings"
            className="min-h-10 flex-1 bg-transparent text-sm text-[#171717] outline-none placeholder:text-[#888888]"
          />
          <span className="rounded-md border border-[#ebebeb] bg-white px-2 py-1 font-mono text-[11px] text-[#888888]">⌘K</span>
        </div>
      </div>
    </div>
  </header>
);

export default SettingsHeader;