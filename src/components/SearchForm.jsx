import { useEffect, useRef, useState } from "react";
import SearchSvg from "./svg/SearchSvg";
import useSearch from "../hooks/useSearch";
import useSearchResults from "../zustand/useSearch";
import useCreateChat from "../hooks/useCreateChat";
import useProfile from "../zustand/useProfile";

const SearchForm = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const inputRef = useRef(null);
	const { searchResults, setSearchResults } = useSearchResults();
	const { search } = useSearch();
	const { profile } = useProfile();

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
		<div className="relative mb-3 w-full">
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
					className="block h-10 w-full rounded-md border border-[#ebebeb] bg-white py-2 pl-10 pr-4 text-sm text-[#171717] placeholder:text-[#888888] focus:border-[#171717] focus:outline-none"
					placeholder="Search people..."
				/>
			</div>

			{filteredUsers.length > 0 ? (
				<div className="absolute z-20 mt-2 max-h-72 w-full space-y-2 overflow-y-auto rounded-lg border border-[#ebebeb] bg-white p-2 shadow-[0_12px_36px_rgba(0,0,0,0.12)]">
					{filteredUsers.map((user) => (
						<UserCard
							key={user.id}
							user={user}
							onCreated={clearSearchResults}
						/>
					))}
				</div>
			) : null}
		</div>
	);
};

export default SearchForm;

function UserCard({ user, onCreated }) {
	const { creatingChat, handleCreateChat } = useCreateChat();

	const handleDirectChatClick = async () => {
		await handleCreateChat(user.id, {
			username: user.nickname || user.username,
			profileImageUrl: user.profilePicture,
		});
		onCreated();
	};

	return (
		<div className="flex items-center justify-between rounded-md bg-[#fafafa] px-3 py-2">
			<div className="flex items-center gap-3">
				{user.profilePicture ? (
					<img className='h-10 w-10 rounded-md object-cover' src={user.profilePicture} alt='user avatar' />
				) : (
					<div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f5f5f5] text-sm font-semibold text-[#171717]">
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
