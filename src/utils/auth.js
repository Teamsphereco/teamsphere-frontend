export const normalizeAuthUser = (rawAuthUser) => {
	if (!rawAuthUser) return null;

	const accessToken =
		rawAuthUser.accessToken || rawAuthUser.jwt || rawAuthUser.token || null;
	const user =
		rawAuthUser.user ||
		(rawAuthUser.id ? rawAuthUser : null);
	const fullName =
		rawAuthUser.fullName ||
		user?.username ||
		rawAuthUser.username ||
		"";

	return {
		...rawAuthUser,
		user,
		fullName,
		accessToken,
		jwt: accessToken,
	};
};
