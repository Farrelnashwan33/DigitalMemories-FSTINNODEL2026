<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import Navbar from '#lib/components/Navbar.svelte';
	import HeroSection from '#lib/components/HeroSection.svelte';
	import HorizontalShowcase from '#lib/components/HorizontalShowcase.svelte';
	import PhotoGallery from '#lib/components/PhotoGallery.svelte';
	import LightboxModal from '#lib/components/LightboxModal.svelte';
	import EventInfoAndFooter from '#lib/components/EventInfoAndFooter.svelte';
	import { fetchMemories } from '#lib/api.js';
	import type { CategorySummary, PhotoItem } from '#lib/types.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let allPhotos = $state<PhotoItem[]>([]);
	let featuredPhotos = $state<PhotoItem[]>([]);
	let categories = $state<CategorySummary[]>([]);
	let totalPublished = $state(0);

	let activeCategory = $state('all');
	let searchQuery = $state('');
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);

	let searchInputEl = $state<HTMLInputElement | null>(null);

	// Lightbox state
	let lightboxItems = $state<PhotoItem[]>([]);
	let lightboxIndex = $state(0);
	let lightboxOpen = $state(false);

	// Hydrate from PageLoad result
	$effect(() => {
		if (data.initialData) {
			allPhotos = data.initialData.photos;
			featuredPhotos =
				data.initialData.featured.length > 0
					? data.initialData.featured
					: data.initialData.photos.slice(0, 8);
			categories = data.initialData.categories;
			totalPublished = data.initialData.stats.total_published;
			errorMessage = null;
		} else if (data.initialError) {
			errorMessage = data.initialError;
		}
	});

	let filteredPhotos = $derived.by(() => {
		const normalizedQuery = searchQuery.trim().toLowerCase();
		return allPhotos.filter((photo) => {
			const categoryMatch =
				activeCategory === 'all' || photo.category?.slug === activeCategory;
			if (!categoryMatch) return false;

			if (!normalizedQuery) return true;
			const haystack = `${photo.title} ${photo.description ?? ''} ${photo.category?.name ?? ''}`.toLowerCase();
			return haystack.includes(normalizedQuery);
		});
	});

	async function reloadGallery() {
		loading = true;
		errorMessage = null;
		try {
			const fresh = await fetchMemories(fetch);
			allPhotos = fresh.photos;
			featuredPhotos = fresh.featured.length > 0 ? fresh.featured : fresh.photos.slice(0, 8);
			categories = fresh.categories;
			totalPublished = fresh.stats.total_published;
		} catch {
			errorMessage =
				'Gagal menghubungi server API dokumentasi. Pastikan server Laravel berjalan di port 8000.';
		} finally {
			loading = false;
		}
	}

	function openLightbox(photo: PhotoItem, collection: PhotoItem[]) {
		const idx = collection.findIndex((p) => p.id === photo.id);
		lightboxItems = collection;
		lightboxIndex = idx >= 0 ? idx : 0;
		lightboxOpen = true;
	}

	function focusGallerySearch() {
		const gallerySection = document.getElementById('gallery');
		gallerySection?.scrollIntoView({ behavior: 'smooth' });
		setTimeout(() => {
			searchInputEl?.focus();
		}, 350);
	}

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		// Subtle editorial entrance animation on hero text block (MOTION 2)
		gsap.from('#hero h1, #hero p, #hero dl', {
			y: 18,
			opacity: 0,
			duration: 0.75,
			stagger: 0.09,
			ease: 'power2.out',
			clearProps: 'all'
		});
	});
</script>

<svelte:head>
	<title>INNODEL 2026 · Digital Memories | FST Universitas Terbuka Bandung</title>
	<meta
		name="description"
		content="Galeri dokumentasi digital resmi INNODEL 2026 Fakultas Sains dan Teknologi Universitas Terbuka Bandung, 4-5 November 2026 di El Hotel Bandung."
	/>
	<meta property="og:title" content="INNODEL 2026 · Digital Memories" />
	<meta
		property="og:description"
		content="A Collection of Moments, Memories & Innovation. Faculty of Science and Technology, Universitas Terbuka Bandung, El Hotel Bandung."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:image" content="/assets/venue/hero-stage.webp" />
</svelte:head>

<Navbar onQuickSearch={focusGallerySearch} />

<main>
	<HeroSection totalPhotos={totalPublished} {featuredPhotos} />

	<HorizontalShowcase
		photos={featuredPhotos}
		{totalPublished}
		onSelectPhoto={openLightbox}
	/>

	<PhotoGallery
		{categories}
		photos={filteredPhotos}
		{totalPublished}
		{loading}
		{errorMessage}
		{activeCategory}
		{searchQuery}
		bind:searchInputRef={searchInputEl}
		onSelectCategory={(slug) => (activeCategory = slug)}
		onSearchChange={(q) => (searchQuery = q)}
		onRetry={reloadGallery}
		onOpenPhoto={openLightbox}
	/>

	<EventInfoAndFooter hasUtLogo={Boolean(data.hasUtLogo)} />
</main>

<LightboxModal
	items={lightboxItems}
	currentIndex={lightboxIndex}
	open={lightboxOpen}
	onClose={() => (lightboxOpen = false)}
	onNavigate={(idx) => (lightboxIndex = idx)}
/>
