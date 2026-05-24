import useSettings from "../../zustand/useSettings";
import { getCategory, previewCopy } from "../../utils/settingsData";
import { Icon, StatusPill } from "./SettingsControls";

const SettingsPreviewPane = ({ activeCategory }) => {
  const { settings } = useSettings();
  const category = getCategory(activeCategory);

  return (
    <aside className="hidden min-w-0 xl:block">
      <div className="sticky top-4 space-y-4">
        <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#ebebeb] bg-[#fafafa] text-[#171717]">
              <Icon name={category?.icon || "help"} className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-[#171717]">{category?.label}</p>
              <p className="font-mono text-[11px] text-[#888888]">CONTEXT</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#4d4d4d]">{previewCopy[activeCategory]}</p>
        </section>

        <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
          <p className="font-mono text-[11px] text-[#888888]">QUICK STATE</p>
          <div className="mt-3 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#4d4d4d]">Notifications</span>
              <StatusPill label={settings.notificationsEnabled ? "On" : "Off"} tone={settings.notificationsEnabled ? "success" : "neutral"} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#4d4d4d]">Privacy score</span>
              <StatusPill label="86%" tone="success" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[#4d4d4d]">Backups</span>
              <StatusPill label={settings.backupFrequency === "off" ? "Off" : "Ready"} tone={settings.backupFrequency === "off" ? "warning" : "success"} />
            </div>
          </div>
        </section>
      </div>
    </aside>
  );
};

export default SettingsPreviewPane;