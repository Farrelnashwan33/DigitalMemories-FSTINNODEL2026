import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch }) => {
	try {
		const res = await fetch('/assets/logos/ut-official.png', { method: 'HEAD' });
		return {
			hasUtLogo: res.ok
		};
	} catch {
		return {
			hasUtLogo: false
		};
	}
};
