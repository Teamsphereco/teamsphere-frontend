const API_BASE_URL = import.meta.env.VITE_API_HOST || "http://localhost:5454";

export const socialRequest = async (path, token, options = {}) => {
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
    throw new Error(payload?.message || payload?.error || payload?.detail || "Request failed");
  }

  return payload;
};

export const getFriends = ({ token }) => socialRequest("/api/social/friends", token, { method: "GET" });

export const searchUsersByHandle = ({ token, query }) => (
  socialRequest(`/api/user/search?name=${encodeURIComponent(query)}`, token, { method: "GET" })
);

export const sendFriendRequest = ({ token, userId }) => (
  socialRequest(`/api/social/friends/requests/${userId}`, token, { method: "POST" })
);

export const getIncomingFriendRequests = ({ token }) => (
  socialRequest("/api/social/friends/requests/incoming", token, { method: "GET" })
);

export const getOutgoingFriendRequests = ({ token }) => (
  socialRequest("/api/social/friends/requests/outgoing", token, { method: "GET" })
);

export const acceptFriendRequest = ({ token, requestId }) => (
  socialRequest(`/api/social/friends/requests/${requestId}/accept`, token, { method: "POST" })
);

export const declineFriendRequest = ({ token, requestId }) => (
  socialRequest(`/api/social/friends/requests/${requestId}/decline`, token, { method: "POST" })
);

export const getBlockedUsers = ({ token }) => socialRequest("/api/social/blocks", token, { method: "GET" });

export const unblockUser = ({ token, userId }) => socialRequest(`/api/social/blocks/${userId}`, token, { method: "DELETE" });

export const acceptChatRequest = ({ token, chatId }) => (
  socialRequest(`/api/chat/${chatId}/requests/accept`, token, { method: "POST" })
);

export const declineChatRequest = ({ token, chatId, blockUser = false }) => (
  socialRequest(`/api/chat/${chatId}/requests/decline`, token, {
    method: "POST",
    body: JSON.stringify({ blockUser }),
  })
);