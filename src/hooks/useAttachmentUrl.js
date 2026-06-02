import { useCallback, useEffect, useRef, useState } from "react";
import { useAuthContext } from "../context/AuthContext";

const API_HOST = import.meta.env.VITE_API_HOST;

// Module-level cache of signed URLs keyed by `${attachmentId}:${variant}`. Signed URLs are
// short-lived, so we expire entries a little before their real TTL and de-duplicate
// concurrent fetches for the same key via the in-flight promise map.
const urlCache = new Map(); // key -> { url, expiresAt }
const inFlight = new Map(); // key -> Promise<string>

const EARLY_EXPIRY_MS = 30_000; // refresh 30s before the server TTL elapses

function cacheKey(attachmentId, variant) {
	return `${attachmentId}:${variant}`;
}

async function fetchSignedUrl(attachmentId, variant, token) {
	const key = cacheKey(attachmentId, variant);
	const cached = urlCache.get(key);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.url;
	}
	if (inFlight.has(key)) {
		return inFlight.get(key);
	}
	const path =
		variant === "thumbnail"
			? `${API_HOST}/api/attachments/${attachmentId}/thumbnail`
			: `${API_HOST}/api/attachments/${attachmentId}/url`;
	const promise = (async () => {
		try {
			const res = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
			if (!res.ok) {
				throw new Error(`Failed to load attachment URL (${res.status})`);
			}
			const data = await res.json();
			const ttlMs = (data.ttlSeconds ? data.ttlSeconds * 1000 : 5 * 60 * 1000) - EARLY_EXPIRY_MS;
			urlCache.set(key, { url: data.url, expiresAt: Date.now() + Math.max(ttlMs, 15_000) });
			return data.url;
		} finally {
			inFlight.delete(key);
		}
	})();
	inFlight.set(key, promise);
	return promise;
}

/**
 * Resolve a short-lived signed URL for an attachment. `variant` is "original" (default) or
 * "thumbnail". Set `enabled` to false to defer the fetch (e.g. until the element is visible).
 */
const useAttachmentUrl = (attachmentId, variant = "original", enabled = true) => {
	const { authUser } = useAuthContext();
	const token = authUser?.jwt;
	const [url, setUrl] = useState(() => {
		const cached = urlCache.get(cacheKey(attachmentId, variant));
		return cached && cached.expiresAt > Date.now() ? cached.url : null;
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const mountedRef = useRef(true);

	useEffect(() => {
		mountedRef.current = true;
		return () => {
			mountedRef.current = false;
		};
	}, []);

	useEffect(() => {
		if (!enabled || !attachmentId || !token) {
			return;
		}
		const cached = urlCache.get(cacheKey(attachmentId, variant));
		if (cached && cached.expiresAt > Date.now()) {
			setUrl(cached.url);
			return;
		}
		setLoading(true);
		setError(null);
		fetchSignedUrl(attachmentId, variant, token)
			.then((resolved) => {
				if (mountedRef.current) {
					setUrl(resolved);
				}
			})
			.catch((err) => {
				if (mountedRef.current) {
					setError(err.message || "Failed to load");
				}
			})
			.finally(() => {
				if (mountedRef.current) {
					setLoading(false);
				}
			});
	}, [attachmentId, variant, enabled, token]);

	// Imperatively resolve a currently-valid signed URL (the module cache self-expires 30s
	// before the server TTL, so this never returns an already-expired URL). Used on click so a
	// stale cached URL can't land the user on an expired 403 page.
	const refresh = useCallback(() => {
		if (!attachmentId || !token) {
			return Promise.reject(new Error("Not ready"));
		}
		return fetchSignedUrl(attachmentId, variant, token).then((resolved) => {
			if (mountedRef.current) {
				setUrl(resolved);
			}
			return resolved;
		});
	}, [attachmentId, variant, token]);

	return { url, loading, error, refresh };
};

export default useAttachmentUrl;
