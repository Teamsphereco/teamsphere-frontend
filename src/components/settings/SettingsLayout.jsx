import { Link } from "react-router-dom";
import NavigationMenu from "../NavigationMenu";
import SettingsSidebar from "./SettingsSidebar";
import SettingsHeader from "./SettingsHeader";
import SettingsPreviewPane from "./SettingsPreviewPane";
import { Icon } from "./SettingsControls";

const SettingsLayout = ({
  activeCategory,
  onSelectCategory,
  onBackToCategories,
  showMobileDetail,
  searchQuery,
  onSearchChange,
  profileSummary,
  children,
}) => (
  <div className="min-h-dvh bg-[#fafafa] text-[#171717]">
    <div className="flex min-h-dvh w-full flex-col md:flex-row">
      <NavigationMenu />

      <div className="flex min-h-dvh flex-1 flex-col">
        <div className="flex h-14 items-center justify-between border-b border-[#ebebeb] bg-white px-4 md:hidden">
          <Link
            to="/chat"
            className="inline-flex h-9 items-center gap-2 rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717]"
          >
            <Icon name="arrowLeft" className="h-4 w-4" />
            Chat
          </Link>
          <p className="font-mono text-[11px] text-[#888888]">TEAMSPHERE SETTINGS</p>
        </div>

        <div className="mx-auto flex w-full max-w-[1560px] flex-1 flex-col gap-4 px-3 py-4 sm:px-5 lg:px-6">
          <SettingsHeader searchQuery={searchQuery} onSearchChange={onSearchChange} profileSummary={profileSummary} />

          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,850px)_320px]">
            <aside className={`${showMobileDetail ? "hidden" : "block"} lg:block`}>
              <div className="sticky top-4 rounded-lg border border-[#ebebeb] bg-[#fafafa] p-2 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
                <SettingsSidebar activeCategory={activeCategory} onSelectCategory={onSelectCategory} mobile={!showMobileDetail} />
              </div>
            </aside>

            <main className={`${showMobileDetail ? "block" : "hidden"} min-w-0 lg:block`}>
              <button
                type="button"
                onClick={onBackToCategories}
                className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] lg:hidden"
              >
                <Icon name="arrowLeft" className="h-4 w-4" />
                Settings
              </button>
              {children}
            </main>

            <SettingsPreviewPane activeCategory={activeCategory} profileSummary={profileSummary} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default SettingsLayout;