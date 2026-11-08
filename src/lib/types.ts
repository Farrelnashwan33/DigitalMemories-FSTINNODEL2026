export interface CategorySummary {
	id: number;
	name: string;
	slug: string;
	description?: string | null;
	photos_count?: number;
}

export interface PhotoItem {
	id: number;
	title: string;
	description: string | null;
	image_path: string;
	image_url: string;
	thumbnail_url: string;
	width: number;
	height: number;
	aspect_ratio: number;
	orientation: 'portrait' | 'landscape' | 'square';
	is_featured: boolean;
	sort_order: number;
	published_at: string | null;
	category: {
		id: number;
		name: string;
		slug: string;
	} | null;
}

export interface EventMetadata {
	name: string;
	concept: string;
	subtitle: string;
	faculty: string;
	university: string;
	dates: string;
	venue: string;
	statement: string;
	tagline: string;
}

export interface MemoriesPayload {
	event: EventMetadata;
	stats: {
		total_published: number;
		total_categories: number;
		total_featured: number;
		filtered_count: number;
	};
	categories: CategorySummary[];
	featured: PhotoItem[];
	photos: PhotoItem[];
}

