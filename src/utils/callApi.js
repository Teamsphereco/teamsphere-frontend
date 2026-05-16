const API_BASE_URL = import.meta.env.VITE_API_HOST || "http://localhost:5454";

const callRequest = async (path, token, options = {}) => {
	if (!token) {
		throw new Error("Missing authentication token");
	}

	const response = await fetch(`${API_BASE_URL}${path}`, {
		...options,
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${token}`,
			...(options.headers || {}),
		},
	});

	const payload = await response.json().catch(() => null);
	if (!response.ok) {
		throw new Error(
			payload?.message ||
			payload?.error ||
			payload?.detail ||
			"Call request failed"
		);
	}

	return payload;
};

export const initiateCall = ({ token, chatId, callType }) =>
	callRequest("/api/calls", token, {
		method: "POST",
		body: JSON.stringify({ chatId, callType }),
	});

export const acceptCall = ({ token, callId }) =>
	callRequest(`/api/calls/${callId}/accept`, token, { method: "POST" });

export const declineCall = ({ token, callId }) =>
	callRequest(`/api/calls/${callId}/decline`, token, { method: "POST" });

export const endCall = ({ token, callId, reason }) =>
	callRequest(`/api/calls/${callId}/end`, token, {
		method: "POST",
		body: JSON.stringify({ reason }),
	});

export const createJoinToken = ({ token, callId }) =>
	callRequest(`/api/calls/${callId}/token`, token, { method: "POST" });

export const getActiveCalls = ({ token }) =>
	callRequest("/api/calls/active", token, { method: "GET" });