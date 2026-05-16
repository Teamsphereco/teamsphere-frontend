import { create } from "zustand";

const useSearchResults = create((set) => ({
    searchResults: [],
    setSearchResults: (searchResults) => set({ searchResults }),
}));

export default useSearchResults;
