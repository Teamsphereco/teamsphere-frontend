import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NavigationMenu from "../../components/NavigationMenu";
import useUserProfile from "../../hooks/useGetProfile";
import useCreateChat from "../../hooks/useCreateChat";
import { useAuthContext } from "../../context/AuthContext";
import {
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getIncomingFriendRequests,
  getOutgoingFriendRequests,
  searchUsersByHandle,
  sendFriendRequest,
} from "../../utils/socialApi";

const getDisplayName = (user) => user?.nickname || user?.username || "Friend";
const getHandle = (user) => user?.username ? `@${user.username}` : "@friend";

const Friends = () => {
  const { authUser } = useAuthContext();
  const token = authUser?.jwt;
  const navigate = useNavigate();
  const { handleCreateChat, creatingChat } = useCreateChat();
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [actionId, setActionId] = useState(null);

  useUserProfile();

  const loadSocialState = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [friendsPayload, incomingPayload, outgoingPayload] = await Promise.all([
        getFriends({ token }),
        getIncomingFriendRequests({ token }),
        getOutgoingFriendRequests({ token }),
      ]);
      setFriends(Array.isArray(friendsPayload) ? friendsPayload : []);
      setIncomingRequests(Array.isArray(incomingPayload) ? incomingPayload : []);
      setOutgoingRequests(Array.isArray(outgoingPayload) ? outgoingPayload : []);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadSocialState();
  }, [loadSocialState]);

  useEffect(() => {
    if (!token || searchQuery.trim().length < 5) {
      setSearchResults([]);
      return undefined;
    }

    const timeoutId = setTimeout(async () => {
      setSearching(true);
      try {
        const payload = await searchUsersByHandle({ token, query: searchQuery.trim() });
        setSearchResults(Array.isArray(payload) ? payload : []);
      } catch (error) {
        toast.error(error.message);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 260);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, token]);

  const friendIds = useMemo(() => new Set(friends.map((friend) => String(friend.id))), [friends]);
  const outgoingUserIds = useMemo(
    () => new Set(outgoingRequests.map((request) => String(request.addressee?.id))),
    [outgoingRequests]
  );
  const incomingByUserId = useMemo(() => {
    const lookup = new Map();
    incomingRequests.forEach((request) => {
      if (request.requester?.id) {
        lookup.set(String(request.requester.id), request);
      }
    });
    return lookup;
  }, [incomingRequests]);

  const openChat = async (friend, callType = null) => {
    setActionId(friend.id);
    const chat = await handleCreateChat(friend.id, {
      username: getDisplayName(friend),
      profileImageUrl: friend.profilePicture,
    });
    if (!chat?.id) {
      setActionId(null);
      return;
    }
    navigate("/chat");
    if (callType) {
      sessionStorage.setItem("teamsphere-pending-call", JSON.stringify({ chatId: chat.id, callType }));
    }
    setActionId(null);
  };

  const requestFriend = async (user) => {
    setActionId(user.id);
    try {
      await sendFriendRequest({ token, userId: user.id });
      toast.success("Friend request sent");
      await loadSocialState();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  const acceptRequest = async (request) => {
    setActionId(request.id);
    try {
      await acceptFriendRequest({ token, requestId: request.id });
      toast.success("Friend request accepted");
      await loadSocialState();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  const declineRequest = async (request) => {
    setActionId(request.id);
    try {
      await declineFriendRequest({ token, requestId: request.id });
      toast.success("Friend request declined");
      await loadSocialState();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="h-dvh overflow-hidden bg-[#fafafa] text-[#171717]">
      <div className="flex h-full w-full flex-col md:flex-row">
        <NavigationMenu />
        <main className="flex min-h-0 flex-1 flex-col">
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-[#ebebeb] bg-white px-4 md:h-16 md:px-6">
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-[#888888]">TEAMSPHERE</p>
              <h1 className="truncate text-base font-semibold text-[#171717]">Friends</h1>
            </div>
            <Link to="/chat" className="inline-flex h-9 items-center rounded-md border border-[#ebebeb] bg-white px-3 text-sm font-medium text-[#171717] transition hover:border-[#a1a1a1]">
              Chats
            </Link>
          </header>

          <section className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-5 lg:px-6">
            <div className="mx-auto w-full max-w-5xl space-y-4">
              <SearchPanel
                query={searchQuery}
                searching={searching}
                results={searchResults}
                friendIds={friendIds}
                outgoingUserIds={outgoingUserIds}
                incomingByUserId={incomingByUserId}
                actionId={actionId}
                onQueryChange={setSearchQuery}
                onRequestFriend={requestFriend}
                onAcceptRequest={acceptRequest}
              />

              <RequestPanel
                incomingRequests={incomingRequests}
                outgoingRequests={outgoingRequests}
                actionId={actionId}
                onAccept={acceptRequest}
                onDecline={declineRequest}
              />

              <div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
                <p className="font-mono text-[11px] text-[#888888]">FRIENDS LIST</p>
                <h2 className="mt-2 text-xl font-semibold text-[#171717]">People you know</h2>
              </div>

              {loading ? (
                <p className="rounded-lg border border-[#ebebeb] bg-white p-4 text-sm text-[#4d4d4d]">Loading friends...</p>
              ) : friends.length ? (
                <div className="space-y-3">
                  {friends.map((friend) => {
                    const busy = actionId === friend.id && creatingChat;
                    return (
                      <article key={friend.id} className="flex min-h-[92px] flex-col gap-3 rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)] sm:flex-row sm:items-center sm:justify-between">
                        <UserIdentity user={friend} />
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          <FriendAction label="Chat" disabled={busy} onClick={() => openChat(friend)} />
                          <FriendAction label="Call" disabled={busy} onClick={() => openChat(friend, "AUDIO")} />
                          <FriendAction label="Video call" disabled={busy} onClick={() => openChat(friend, "VIDEO")} />
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-[#a1a1a1] bg-white px-4 py-10 text-center">
                  <h2 className="text-base font-semibold text-[#171717]">No friends yet</h2>
                  <p className="mt-2 text-sm text-[#4d4d4d]">Search for a handle above and send a friend request.</p>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

const SearchPanel = ({
  query,
  searching,
  results,
  friendIds,
  outgoingUserIds,
  incomingByUserId,
  actionId,
  onQueryChange,
  onRequestFriend,
  onAcceptRequest,
}) => (
  <section className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
    <p className="font-mono text-[11px] text-[#888888]">ADD FRIENDS</p>
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <input
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Search exact @handle"
        className="min-h-10 flex-1 rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 text-sm text-[#171717] outline-none focus:border-[#171717]"
      />
    </div>
    {query.trim().length > 0 && query.trim().length < 5 ? (
      <p className="mt-2 text-xs text-[#888888]">Handles are at least 5 characters.</p>
    ) : null}
    {query.trim().length >= 5 ? (
      <div className="mt-3 space-y-2">
        {searching ? (
          <p className="text-sm text-[#4d4d4d]">Searching...</p>
        ) : results.length ? (
          results.map((user) => {
            const incomingRequest = incomingByUserId.get(String(user.id));
            const isFriend = friendIds.has(String(user.id));
            const outgoing = outgoingUserIds.has(String(user.id));
            const busy = actionId === user.id || actionId === incomingRequest?.id;
            return (
              <div key={user.id} className="flex min-h-[72px] flex-col gap-3 rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                <UserIdentity user={user} compact />
                {isFriend ? (
                  <StatusLabel label="Friends" />
                ) : incomingRequest ? (
                  <FriendAction label="Accept request" disabled={busy} onClick={() => onAcceptRequest(incomingRequest)} />
                ) : outgoing ? (
                  <StatusLabel label="Pending" />
                ) : (
                  <FriendAction label="Add friend" disabled={busy} onClick={() => onRequestFriend(user)} />
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-[#4d4d4d]">No handles found.</p>
        )}
      </div>
    ) : null}
  </section>
);

const RequestPanel = ({ incomingRequests, outgoingRequests, actionId, onAccept, onDecline }) => {
  if (!incomingRequests.length && !outgoingRequests.length) {
    return null;
  }

  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {incomingRequests.length ? (
        <RequestList title="Incoming requests" requests={incomingRequests} type="incoming" actionId={actionId} onAccept={onAccept} onDecline={onDecline} />
      ) : null}
      {outgoingRequests.length ? (
        <RequestList title="Sent requests" requests={outgoingRequests} type="outgoing" actionId={actionId} />
      ) : null}
    </section>
  );
};

const RequestList = ({ title, requests, type, actionId, onAccept, onDecline }) => (
  <div className="rounded-lg border border-[#ebebeb] bg-white p-4 shadow-[0_1px_1px_rgba(0,0,0,0.03)]">
    <p className="font-mono text-[11px] text-[#888888]">{title.toUpperCase()}</p>
    <div className="mt-3 space-y-2">
      {requests.map((request) => {
        const user = type === "incoming" ? request.requester : request.addressee;
        const busy = actionId === request.id;
        return (
          <div key={request.id} className="flex min-h-[68px] flex-col gap-3 rounded-md border border-[#ebebeb] bg-[#fafafa] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <UserIdentity user={user} compact />
            {type === "incoming" ? (
              <div className="flex gap-2">
                <FriendAction label="Accept" disabled={busy} onClick={() => onAccept(request)} />
                <FriendAction label="Decline" disabled={busy} onClick={() => onDecline(request)} />
              </div>
            ) : (
              <StatusLabel label="Pending" />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

const UserIdentity = ({ user, compact = false }) => (
  <div className="flex min-w-0 items-center gap-3">
    {user?.profilePicture ? (
      <img src={user.profilePicture} alt={`${getDisplayName(user)} avatar`} className={`${compact ? "h-10 w-10" : "h-12 w-12"} rounded-md object-cover`} />
    ) : (
      <div className={`${compact ? "h-10 w-10" : "h-12 w-12"} flex items-center justify-center rounded-md bg-[#171717] text-sm font-semibold text-white`}>
        {getDisplayName(user).charAt(0).toUpperCase()}
      </div>
    )}
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-[#171717]">{getDisplayName(user)}</p>
      <p className="truncate text-xs text-[#4d4d4d]">{getHandle(user)}</p>
    </div>
  </div>
);

const FriendAction = ({ label, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="inline-flex h-9 items-center justify-center rounded-md border border-[#ebebeb] bg-white px-3 text-xs font-medium text-[#171717] transition hover:border-[#a1a1a1] disabled:cursor-not-allowed disabled:opacity-60"
  >
    {label}
  </button>
);

const StatusLabel = ({ label }) => (
  <span className="inline-flex h-8 items-center rounded-md border border-[#ebebeb] bg-white px-3 text-xs font-medium text-[#4d4d4d]">
    {label}
  </span>
);

export default Friends;
