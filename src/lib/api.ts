import type { MemoriesPayload, PhotoItem } from './types.js';

const LOCAL_BACKEND_RE = /^https?:\/\/(localhost|127\.0\.0\.1):8000(\/storage\/.*)$/i;

export function getApiBaseUrl(): string {
	const configured = ((import.meta.env.VITE_API_BASE_URL as string | undefined) || '').trim();

	// In browser dev mode, use Vite's same-origin /api/v1 proxy when pointing to local port 8000
	// so phones on Wi-Fi LAN (192.168.x.x:5173) and localhost/127.0.0.1 all work seamlessly.
	if (
		typeof window !== 'undefined' &&
		import.meta.env.DEV &&
		(!configured || /^https?:\/\/(localhost|127\.0\.0\.1):8000\b/i.test(configured))
	) {
		return `${window.location.origin}/api/v1`;
	}

	const raw = configured || 'http://127.0.0.1:8000/api/v1';
	return raw.replace(/\/+$/, '');
}

export function getAdminUrl(): string {
	const configured = ((import.meta.env.VITE_ADMIN_URL as string | undefined) || '').trim();
	if (
		typeof window !== 'undefined' &&
		import.meta.env.DEV &&
		(!configured || /^https?:\/\/(localhost|127\.0\.0\.1):8000\b/i.test(configured))
	) {
		return `${window.location.protocol}//${window.location.hostname}:8000/admin`;
	}

	const raw = configured || 'http://127.0.0.1:8000/admin';
	return raw.replace(/\/+$/, '');
}

function normalizePhotoUrls(photo: PhotoItem): PhotoItem {
	if (!import.meta.env.DEV) return photo;
	return {
		...photo,
		image_url: photo.image_url.replace(LOCAL_BACKEND_RE, '$2'),
		thumbnail_url: photo.thumbnail_url.replace(LOCAL_BACKEND_RE, '$2')
	};
}

export async function fetchMemories(
	customFetch: typeof fetch = fetch,
	params?: { category?: string; q?: string }
): Promise<MemoriesPayload> {
	const url = new URL(`${getApiBaseUrl()}/memories`);
	if (params?.category && params.category !== 'all') {
		url.searchParams.set('category', params.category);
	}
	if (params?.q?.trim()) {
		url.searchParams.set('q', params.q.trim());
	}

	const response = await customFetch(url.toString(), {
		headers: {
			Accept: 'application/json'
		}
	});

	if (!response.ok) {
		throw new Error(`API returned status ${response.status}`);
	}

	const payload = (await response.json()) as MemoriesPayload;
	return {
		...payload,
		featured: payload.featured.map(normalizePhotoUrls),
		photos: payload.photos.map(normalizePhotoUrls)
	};
}
