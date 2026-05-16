import { settingsGroups, categories } from "../../utils/settingsData";
import { Icon, StatusPill } from "./SettingsControls";

const categoryById = categories.reduce((lookup, category) => ({ ...lookup, [category.id]: category }), {});

const SettingsSidebar = ({ activeCategory, onSelectCategory, mobile = false }) => (
  <nav aria-label="Settings categories" className={mobile ? "space-y-6" : "space-y-6"}>
    {settingsGroups.map((group) => (
      <div key={group.label}>
        <p className="mb-2 font-mono text-[11px] text-[#888888]">{group.label}</p>
        <div className="space-y-1">
          {group.categories.map((categoryId) => {
            const category = categoryById[categoryId];
            const active = category.id === activeCategory;

            return (
              <button
                type="button"
                key={category.id}
                onClick={() => onSelectCategory(category.id)}
                className={`relative flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#0070f3] ${
                  active
                    ? "border-[#ebebeb] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.03)]"
                    : "border-transparent text-[#4d4d4d] hover:border-[#ebebeb] hover:bg-white hover:text-[#171717]"
                }`}
              >
                {active ? <span className="absolute left-0 top-2 h-7 w-0.5 rounded-full bg-[#0070f3]" /> : null}
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#ebebeb] bg-[#fafafa]">
                  <Icon name={category.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.label}</span>
                {category.badge ? <StatusPill label={category.badge} tone={category.badge === "Needs attention" ? "warning" : "neutral"} /> : null}
              </button>
            );
          })}
        </div>
      </div>
    ))}
  </nav>
);

export default SettingsSidebar;