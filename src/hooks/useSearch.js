import { useCallback, useState } from 'react'
import useSearchResults from '../zustand/useSearch';
import { useAuthContext } from '../context/AuthContext';
import toast from "react-hot-toast";

const useSearch = () => {
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuthContext();
  const { setSearchResults } = useSearchResults();
  const token = authUser?.jwt;

  const search = useCallback(async (query) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/user/search?name=${query}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      if (!response.ok) {
        throw new Error('Error fetching search results');
      }
      const data = await response.json();
      setSearchResults(data);
      setLoading(false);
    } catch (error) {
      toast.error(error.message);
      setLoading(false);
    }
  }, [setSearchResults, token]);

  return {search, loading}
}

export default useSearch
