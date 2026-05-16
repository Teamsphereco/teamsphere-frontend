import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthContext } from "../../context/AuthContext";
import { normalizeAuthUser } from "../../utils/auth";
import { setHasLoggedInBefore } from "../../utils/landingCta";

export default function OAuthCallback() {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const { setAuthUser } = useAuthContext();

	useEffect(() => {
		const finalizeOAuth = async () => {
			const token = searchParams.get("token");
			const provider = searchParams.get("provider");
			const error = searchParams.get("error");

			if (error || !token) {
				toast.error("OAuth login failed. Please try again.");
				navigate("/login", { replace: true });
				return;
			}

			try {
				const response = await fetch(`${import.meta.env.VITE_API_HOST}/api/user/profile`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error("Unable to fetch user profile after OAuth login");
				}

				const user = await response.json();
				const authPayload = {
					status: true,
					accessToken: token,
					provider,
					user,
				};
				const normalizedAuthUser = normalizeAuthUser(authPayload);

				localStorage.setItem("chat-user", JSON.stringify(normalizedAuthUser));
				setHasLoggedInBefore();
				setAuthUser(normalizedAuthUser);
				toast.success(`Signed in with ${provider}`);
				navigate("/chat", { replace: true });
			} catch (err) {
				toast.error("OAuth login completed, but session setup failed.");
				navigate("/login", { replace: true });
			}
		};

		finalizeOAuth();
	}, [navigate, searchParams, setAuthUser]);

	return (
		<section className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
			<div className="text-gray-900 dark:text-white text-lg">Finishing sign-in...</div>
		</section>
	);
}
