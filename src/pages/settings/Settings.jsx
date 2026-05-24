import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";
import useUserProfile from "../../hooks/useGetProfile";
import useProfile from "../../zustand/useProfile";
import { categories, getSearchResults } from "../../utils/settingsData";
import SettingsLayout from "../../components/settings/SettingsLayout";
import SettingsSection from "../../components/settings/SettingsSection";
import EmptyStateCard from "../../components/settings/EmptyStateCard";
import { Icon } from "../../components/settings/SettingsControls";

const validCategoryIds = new Set(categories.map((category) => category.id));

const getCategoryFromHash = (hash) => {
  const categoryId = hash.replace("#", "");
  return validCategoryIds.has(categoryId) ? categoryId : categories[0].id;
};

const getInitials = (name) => name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase())
  .join("") || "TS";

const Settings = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const { profile } = useProfile();
  const [activeCategory, setActiveCategory] = useState(() => getCategoryFromHash(location.hash));
  const [showMobileDetail, setShowMobileDetail] = useState(Boolean(location.hash));
  const [searchQuery, setSearchQuery] = useState("");

  useUserProfile();

  useEffect(() => {
    const nextCategory = getCategoryFromHash(location.hash);
    setActiveCategory(nextCategory);
    if (location.hash) {
      setShowMobileDetail(true);
    }
  }, [location.hash]);

  const profileSummary = useMemo(() => {
    const authProfile = authUser?.user || {};
    const name = profile?.nickname
      || profile?.displayName
      || profile?.fullName
      || authUser?.fullName
      || authProfile.nickname
      || authProfile.username
      || "TeamSphere User";
    const handle = profile?.username || authProfile.username ? `@${profile?.username || authProfile.username}` : "@teamsphere";
    const avatarUrl = profile?.profilePicture || profile?.avatarUrl || authProfile.profilePicture || "";

    return {
      name,
      handle,
      avatarUrl,
      initials: getInitials(name),
      statusLabel: "Online",
    };
  }, [authUser, profile]);

  const searchResults = useMemo(() => getSearchResults(searchQuery), [searchQuery]);

  const handleSelectCategory = (categoryId) => {
    setActiveCategory(categoryId);
    setShowMobileDetail(true);
    navigate(`/settings#${categoryId}`);
  };

  const handleBackToCategories = () => {
    if (searchQuery) {
      setSearchQuery("");
      return;
    }
    setShowMobileDetail(false);
    navigate("/settings", { replace: true });
  };

  const showSearch = searchQuery.trim().length > 0;

  return (
    <SettingsLayout
      activeCategory={activeCategory}
      onSelectCategory={handleSelectCategory}
      onBackToCategories={handleBackToCategories}
      showMobileDetail={showMobileDetail || showSearch}
      searchQuery={searchQuery}
      onSearchChange={setSearchQuery}
      profileSummary={profileSummary}
    >
      {showSearch ? (
        <SettingsSearchResults
          query={searchQuery}
          results={searchResults}
          onSelectCategory={(categoryId) => {
            setSearchQuery("");
            handleSelectCategory(categoryId);
          }}
        />
      ) : (
        <SettingsSection categoryId={activeCategory} profileSummary={profileSummary} />
      )}
    </SettingsLayout>
  );
};

const SettingsSearchResults = ({ query, results, onSelectCategory }) => {
  if (!results.length) {
    return <EmptyStateCard title="No settings found." description="Try searching by category, setting name, or a short privacy/security phrase." />;
  }

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
        <p className="font-mono text-[11px] text-[#888888]">SEARCH RESULTS</p>
        <h2 className="mt-2 text-2xl font-semibold text-[#171717]">Results for "{query}"</h2>
        <p className="mt-2 text-sm text-[#4d4d4d]">Select a result to jump into that settings category.</p>
      </div>

      {results.map(({ category, content, matches }) => (
        <div key={category.id} className="rounded-lg border border-[#ebebeb] bg-white shadow-[0_1px_1px_rgba(0,0,0,0.03),0_8px_16px_-12px_rgba(0,0,0,0.08)]">
          <button
            type="button"
            onClick={() => onSelectCategory(category.id)}
            className="flex min-h-14 w-full items-center gap-3 border-b border-[#ebebeb] px-4 py-3 text-left transition hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md border border-[#ebebeb] bg-[#fafafa]">
              <Icon name={category.icon} className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-[#171717]">{content.title}</span>
              <span className="block truncate text-xs text-[#4d4d4d]">{content.description}</span>
            </span>
          </button>

          <div className="divide-y divide-[#ebebeb]">
            {matches.length ? matches.map((item) => (
              <button
                type="button"
                key={`${category.id}-${item.id}`}
                onClick={() => onSelectCategory(category.id)}
                className="flex min-h-[68px] w-full flex-col px-4 py-3 text-left transition hover:bg-[#fafafa] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
              >
                <span className="text-sm font-semibold text-[#171717]">
                  <Highlight text={item.title} query={query} />
                </span>
                <span className="mt-1 text-sm text-[#4d4d4d]">
                  <Highlight text={item.description} query={query} />
                </span>
              </button>
            )) : (
              <button
                type="button"
                onClick={() => onSelectCategory(category.id)}
                className="w-full px-4 py-3 text-left text-sm text-[#4d4d4d] transition hover:bg-[#fafafa]"
              >
                Open matching category
              </button>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

const Highlight = ({ text = "", query }) => {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.trim().toLowerCase();
  const index = normalizedText.indexOf(normalizedQuery);

  if (index === -1 || !normalizedQuery) {
    return text;
  }

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <mark className="rounded-sm bg-[#d3e5ff] px-0.5 text-[#0761d1]">{match}</mark>
      {after}
    </>
  );
};

export default Settings;