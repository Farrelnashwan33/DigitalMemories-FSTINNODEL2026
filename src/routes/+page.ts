import { fetchMemories } from '#lib/api.js';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, data }) => {
	try {
		const initialData = await fetchMemories(fetch);
		return {
			...data,
			initialData,
			initialError: null as string | null
		};
	} catch {
		return {
			...data,
			initialData: null,
			initialError:
				'Tidak dapat terhubung ke server galeri dokumentasi. Pastikan layanan backend Laravel telah aktif.'
		};
	}
};
