import FolderSvg from "./svg/FolderSvg"
import CalendarSvg from "./svg/CalendarSvg"
import ChatsSvg from "./svg/ChatSvg";
import FriendsSvg from "./svg/FriendsSvg";
import MediaSvg from "./svg/MediaSvg";
import SettingsSvg from "./svg/SettingsSvg";
import LogoutButton from "./LogoutButton";
import useProfile from "../zustand/useProfile";
import { Link, NavLink } from "react-router-dom";

const navItems = [
  { id: 1, to: "/chat", component: <ChatsSvg className="mb-1 h-5 w-5 fill-current" />, label: "Chats" },
  { id: 2, to: "/friends", component: <FriendsSvg className="mb-1 h-6 w-6 fill-current" />, label: "Friends" },
  { id: 3, href: "#", component: <FolderSvg className="mb-1 w-5 fill-current" />, label: "Meet" },
  { id: 4, href: "#", component: <CalendarSvg className="mb-1 w-5 fill-current" />, label: "Calendar" },
  { id: 6, href: "#", component: <MediaSvg className="mb-1 h-5 w-5 stroke-current" />, label: "Media" },
  { id: 7, to: "/settings", component: <SettingsSvg className="mb-1 w-5 fill-current" />, label: "Settings" },
];

function NavigationMenu() {
  const { profile } = useProfile();
  const displayName = profile?.username || "Profile";
  const hasProfilePicture = Boolean(profile?.profilePicture);

  return (
    <div className="hidden h-dvh w-24 flex-col overflow-x-hidden border-r border-[#ebebeb] bg-white py-4 text-sm text-[#888888] md:flex md:items-center">
      <div className="w-full min-w-0 shrink-0 px-2">
        <Link
          to="/settings#profile"
          className="flex w-full min-w-0 flex-col items-center gap-2 overflow-hidden rounded-lg border border-[#ebebeb] bg-[#fafafa] px-2 py-3 text-center transition hover:border-[#a1a1a1] hover:bg-white hover:text-[#171717] focus:outline-none focus:ring-2 focus:ring-[#0070f3]"
          aria-label="Open profile settings"
        >
          {hasProfilePicture ? (
            <img
              src={profile.profilePicture}
              alt={`${displayName} profile avatar`}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#171717] text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <p className="max-w-full truncate text-center text-[11px] font-medium text-[#171717]">
            {displayName}
          </p>
        </Link>
      </div>

      <div className="mt-5 flex min-h-0 w-full flex-1 flex-col gap-3 overflow-y-auto px-2 pb-4">
        {navItems.map(item => (
          <div key={item.id}>
            {item.to ? (
              <NavLink
                to={item.to}
                className={({ isActive }) => `flex flex-col items-center gap-1 rounded-md px-2 py-1 text-center transition hover:bg-[#fafafa] hover:text-[#171717] ${isActive ? "text-[#171717]" : ""}`}
              >
                {({ isActive }) => (
                  <>
                    <span className={`flex h-10 w-10 items-center justify-center rounded-md transition ${isActive ? "bg-[#171717] text-white" : "bg-transparent text-current"}`}>
                      {item.component}
                    </span>
                    <h1 className="text-[11px]">{item.label}</h1>
                  </>
                )}
              </NavLink>
            ) : (
              <a href={item.href} className="flex flex-col items-center gap-1 rounded-md px-2 py-1 text-center transition hover:bg-[#fafafa] hover:text-[#171717]">
                <span className="flex h-10 w-10 items-center justify-center rounded-md">
                  {item.component}
                </span>
                <h1 className="text-[11px]">{item.label}</h1>
              </a>
            )}
          </div>
        ))}
      </div>
      <div className="w-full shrink-0 border-t border-[#ebebeb] pt-3" />
      <LogoutButton />
    </div>
  );
}

export default NavigationMenu;
