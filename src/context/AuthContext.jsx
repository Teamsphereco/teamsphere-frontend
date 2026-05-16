import { createContext, useContext, useState, useEffect } from "react";
import { normalizeAuthUser } from "../utils/auth";

export const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
	return useContext(AuthContext);
};

const readStoredAuthUser = () => {
	const raw = localStorage.getItem("chat-user");
	if (!raw) return null;

	try {
		return normalizeAuthUser(JSON.parse(raw));
	} catch (error) {
		console.error("Invalid auth payload in localStorage. Clearing session.", error);
		localStorage.removeItem("chat-user");
		return null;
	}
};

export const AuthContextProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(readStoredAuthUser);

	useEffect(() => {
		const checkToken = async () => {
			const token = authUser?.accessToken;
			if (!token) {
				return;
			}

			try {
				const response = await fetch(`${import.meta.env.VITE_API_HOST}/auth/verify`, {
					method: "GET",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (response.status === 401 || response.status === 403) {
					localStorage.removeItem("chat-user");
					setAuthUser(null);
					return;
				}

				// Keep session if verify endpoint is intentionally removed.
				if (response.status === 404) {
					return;
				}

				if (!response.ok) {
					console.error("Token verification failed with status:", response.status);
				}
			} catch (error) {
				console.error("Token verification request failed:", error);
			}
		};
		checkToken();
	}, [authUser?.accessToken]);

	const setNormalizedAuthUser = (nextAuthUser) => {
		setAuthUser(normalizeAuthUser(nextAuthUser));
	};

	return <AuthContext.Provider value={{ authUser, setAuthUser: setNormalizedAuthUser }}>{children}</AuthContext.Provider>;
};
