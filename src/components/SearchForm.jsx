import { useEffect, useRef, useState } from "react";
import SearchSvg from "./svg/SearchSvg";
import useSearch from "../hooks/useSearch";
import useSearchResults from "../zustand/useSearch";
import useCreateChat from "../hooks/useCreateChat";
import useProfile from "../zustand/useProfile";
import useSettings from "../zustand/useSettings";

const densityClasses = {
	compact: {
		wrapper: "mb-2",
		input: "h-9 py-1.5",
		results: "space-y-1 p-1.5",
		card: "px-2 py-1.5",
		avatar: "h-8 w-8",
	},
	comfortable: {
		wrapper: "mb-3",
		input: "h-10 py-2",
		results: "space-y-2 p-2",
		card: "px-3 py-2",
		avatar: "h-10 w-10",
	},
	spacious: {
		wrapper: "mb-4",
		input: "h-12 py-3",
		results: "space-y-3 p-3",
		card: "px-4 py-3",
		avatar: "h-12 w-12",
	},
};

const SearchForm = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef(null);
	const { searchResults, setSearchResults } = useSearchResults();
	const { search } = useSearch();
	const { profile } = useProfile();
	const { settings } = useSettings();
	const density = densityClasses[settings.chatDensity] || densityClasses.comfortable;

	useEffect(() => {
		if (searchQuery.trim().length < 1) {
			setSearchResults([]);
			return;
		}

		const handler = setTimeout(() => {
			search(searchQuery.trim());
		}, 350);

		return () => clearTimeout(handler);
	}, [search, searchQuery, setSearchResults]);

	useEffect(() => {
		const focusInput = () => {
			inputRef.current?.focus();
		};
		window.addEventListener("focus-dm-search", focusInput);
		return () => window.removeEventListener("focus-dm-search", focusInput);
	}, []);

	const clearSearchResults = () => {
		setSearchResults([]);
		setSearchQuery("");
	};

	const filteredUsers = (searchResults || []).filter((user) => user?.id !== profile?.id);

	return (
		<div className={`relative w-full ${density.wrapper}`}>
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="font-mono text-[11px] uppercase text-[#888888]">
					New direct message
				</p>
			</div>

			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
					<SearchSvg aria-hidden="true" />
				</div>
				<input
					ref={inputRef}
					type="search"
					value={searchQuery}
					onChange={(event) => setSearchQuery(event.target.value)}
					className={`block w-full rounded-md border border-[#ebebeb] bg-white pl-10 pr-4 text-sm text-[#171717] placeholder:text-[#888888] focus:border-[#171717] focus:outline-none ${density.input}`}
					placeholder="Search people..."
				/>
			</div>

			{filteredUsers.length > 0 ? (
				<div className={`absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border border-[#ebebeb] bg-white ${density.results} shadow-[0_12px_36px_rgba(0,0,0,0.12)]`}>
					{filteredUsers.map((user) => (
						<UserCard
							key={user.id}
							user={user}
							density={density}
							onCreated={clearSearchResults}
						/>
					))}
				</div>
			) : null}
		</div>
	);
};

export default SearchForm;

function UserCard({ user, density, onCreated }) {
	const { creatingChat, handleCreateChat } = useCreateChat();

	const handleDirectChatClick = async () => {
		await handleCreateChat(user.id, {
			username: user.nickname || user.username,
			profileImageUrl: user.profilePicture,
		});
		onCreated();
	};

	return (
		<div className={`flex items-center justify-between rounded-md bg-[#fafafa] ${density.card}`}>
			<div className="flex items-center gap-3">
				{user.profilePicture ? (
					<img className={`${density.avatar} rounded-md object-cover`} src={user.profilePicture} alt='user avatar' />
				) : (
					<div className={`flex ${density.avatar} items-center justify-center rounded-md bg-[#f5f5f5] text-sm font-semibold text-[#171717]`}>
						{user.username?.charAt(0)?.toUpperCase() || "U"}
					</div>
				)}
				<div>
					<p className="text-sm font-semibold text-[#171717]">{user.nickname || user.username}</p>
					<p className="text-xs text-[#888888]">@{user.username}</p>
				</div>
			</div>
			<button
				onClick={handleDirectChatClick}
				className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
					creatingChat
						? "cursor-not-allowed bg-[#f5f5f5] text-[#888888]"
						: "bg-[#171717] text-white hover:bg-[#4d4d4d]"
				}`}
				disabled={creatingChat}
			>
				{creatingChat ? "..." : "Message"}
			</button>
		</div>
	);
}
