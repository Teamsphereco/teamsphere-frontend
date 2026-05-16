const useOAuthLogin = () => {
	const loginWithProvider = (provider) => {
		window.location.href = `${import.meta.env.VITE_API_HOST}/auth/oauth2/${provider}`;
	};

	return { loginWithProvider };
};

export default useOAuthLogin;
