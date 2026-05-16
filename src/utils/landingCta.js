export const HAS_LOGGED_IN_BEFORE_KEY = "hasLoggedInBefore";

export const setHasLoggedInBefore = () => {
	localStorage.setItem(HAS_LOGGED_IN_BEFORE_KEY, "true");
};

export const hasLoggedInBefore = () =>
	localStorage.getItem(HAS_LOGGED_IN_BEFORE_KEY) === "true";

export const getLandingCtaTarget = (authUser) => {
	if (authUser?.accessToken) {
		return "/chat";
	}

	return hasLoggedInBefore() ? "/login" : "/signup";
};
