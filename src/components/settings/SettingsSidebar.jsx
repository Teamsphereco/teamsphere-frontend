import { settingsGroups, categories } from "../../utils/settingsData";
import { Icon, StatusPill } from "./SettingsControls";
import { useAuthContext } from "../../context/AuthContext";
import { getBlockedUsers } from "../../utils/socialApi";
import { useCallback, useEffect, useState } from "react";

const categoryById = categories.reduce((lookup, category) => ({ ...lookup, [category.id]: category }), {});

const formatBadgeCount = (count) => {
  if (!Number.isFinite(count) || count <= 0) return null;
  return count > 99 ? "99+" : String(count);
};

const SettingsSidebar = ({ activeCategory, onSelectCategory, mobile = false }) => {
  const { authUser } = useAuthContext();
  const token = authUser?.jwt;
  const [blockedCount, setBlockedCount] = useState(null);

  const loadBlockedCount = useCallback(async () => {
    if (!token) return;
    try {
      const payload = await getBlockedUsers({ token });
      setBlockedCount(Array.isArray(payload) ? payload.length : 0);
    } catch {
      setBlockedCount(null);
    }
  }, [token]);

  useEffect(() => {
    void loadBlockedCount();
  }, [loadBlockedCount]);

  useEffect(() => {
    window.addEventListener("teamsphere-blocks-changed", loadBlockedCount);
    return () => window.removeEventListener("teamsphere-blocks-changed", loadBlockedCount);
  }, [loadBlockedCount]);

  const blockedBadge = formatBadgeCount(blockedCount);

  return (
    <nav aria-label="Settings categories" className={mobile ? "space-y-6" : "space-y-6"}>
      {settingsGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-2 font-mono text-[11px] text-[#888888]">{group.label}</p>
          <div className="space-y-1">
            {group.categories.map((categoryId) => {
              const category = categoryById[categoryId];
              const active = category.id === activeCategory;
              const badge = category.id === "blocked-users" ? blockedBadge : category.badge;

              return (
                <button
                  type="button"
                  key={category.id}
                  onClick={() => onSelectCategory(category.id)}
                  className={`relative flex min-h-11 w-full items-center gap-3 rounded-lg border px-3 py-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#0070f3] ${
                    active
                      ? "border-[#171717] bg-white text-[#171717] shadow-[0_1px_1px_rgba(0,0,0,0.03)]"
                      : "border-transparent text-[#4d4d4d] hover:border-[#ebebeb] hover:bg-white hover:text-[#171717]"
                  }`}
                >
                  {active ? <span className="absolute left-0 top-2 h-7 w-0.5 rounded-full bg-[#0070f3]" /> : null}
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md border transition ${
                    active
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#ebebeb] bg-[#fafafa] text-[#4d4d4d]"
                  }`}>
                    <Icon name={category.icon} className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-medium">{category.label}</span>
                  {badge ? <StatusPill label={badge} tone={badge === "Needs attention" ? "warning" : "neutral"} /> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
};

export default SettingsSidebar;