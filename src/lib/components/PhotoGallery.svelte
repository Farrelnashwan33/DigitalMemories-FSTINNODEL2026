<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, X, RefreshCw, ImageOff } from '@lucide/svelte';
	import type { CategorySummary, PhotoItem } from '#lib/types.js';

	interface Props {
		categories: CategorySummary[];
		photos: PhotoItem[];
		totalPublished: number;
		loading?: boolean;
		errorMessage?: string | null;
		activeCategory: string;
		searchQuery: string;
		searchInputRef?: HTMLInputElement | null;
		onSelectCategory: (slug: string) => void;
		onSearchChange: (q: string) => void;
		onRetry: () => void;
		onOpenPhoto: (photo: PhotoItem, collection: PhotoItem[]) => void;
	}

	let {
		categories,
		photos,
		totalPublished,
		loading = false,
		errorMessage = null,
		activeCategory,
		searchQuery,
		searchInputRef = $bindable(null),
		onSelectCategory,
		onSearchChange,
		onRetry,
		onOpenPhoto
	}: Props = $props();

	let loadedMap = $state<Record<number, boolean>>({});
	let errorMap = $state<Record<number, boolean>>({});
	let columnCount = $state(2);

	// Horizontal drag support for category filter strip on desktop
	let chipRail = $state<HTMLDivElement | null>(null);
	let railDown = false;
	let railStartX = 0;
	let railScrollLeft = 0;

	const defaultChapters = [
		{ slug: 'opening-ceremony', name: 'Opening Ceremony' },
		{ slug: 'main-activities', name: 'Main Activities' },
		{ slug: 'networking-collaboration', name: 'Networking & Collaboration' },
		{ slug: 'behind-the-scenes', name: 'Behind The Scenes' },
		{ slug: 'closing-ceremony', name: 'Closing Ceremony' }
	];

	let mergedCategories = $derived.by(() => {
		if (categories.length > 0) return categories;
		return defaultChapters.map((c, idx) => ({
			id: idx + 1,
			name: c.name,
			slug: c.slug,
			photos_count: 0
		}));
	});

	// Distribute photos into balanced height-aware columns in row-major order
	// so mobile phones render a compact 2-column Google Photos masonry grid without CSS multi-column bugs
	let masonryColumns = $derived.by(() => {
		const cols: PhotoItem[][] = Array.from({ length: columnCount }, () => []);
		const heights = new Array<number>(columnCount).fill(0);

		for (const photo of photos) {
			let shortestIdx = 0;
			for (let i = 1; i < columnCount; i++) {
				if (heights[i] < heights[shortestIdx]) {
					shortestIdx = i;
				}
			}
			cols[shortestIdx].push(photo);
			const ratio = photo.width > 0 && photo.height > 0 ? photo.height / photo.width : 1.25;
			heights[shortestIdx] += ratio + 0.24;
		}
		return cols;
	});

	function updateColumnCount() {
		if (typeof window === 'undefined') return;
		const w = window.innerWidth;
		if (w >= 1200) {
			columnCount = 4;
		} else if (w >= 768) {
			columnCount = 3;
		} else {
			columnCount = 2;
		}
	}

	function watchImageLoad(node: HTMLImageElement, id: number) {
		if (node.complete && node.naturalWidth > 0) {
			loadedMap[id] = true;
		}
		return {
			update(nextId: number) {
				if (node.complete && node.naturalWidth > 0) {
					loadedMap[nextId] = true;
				}
			}
		};
	}

	function retrySingleImage(id: number) {
		delete errorMap[id];
		loadedMap[id] = false;
	}

	function resetFilters() {
		onSelectCategory('all');
		onSearchChange('');
	}

	onMount(() => {
		updateColumnCount();
		window.addEventListener('resize', updateColumnCount);
		return () => window.removeEventListener('resize', updateColumnCount);
	});
</script>

<section
	id="gallery"
	aria-labelledby="gallery-heading"
	class="mx-auto max-w-7xl scroll-mt-20 px-3 py-12 sm:scroll-mt-24 sm:px-6 sm:py-20 lg:px-8"
>
	<!-- Section Masthead -->
	<div class="mb-6 flex flex-col justify-between gap-4 sm:mb-8 md:flex-row md:items-end">
		<div>
			<p class="text-xs font-bold tracking-wider text-[var(--accent-gold)] uppercase">
				Curated Event Archive
			</p>
			<h2
				id="gallery-heading"
				class="font-editorial mt-1 text-[clamp(2rem,7vw,3rem)] leading-tight font-bold text-[var(--ink)]"
			>
				Digital Photo Memories
			</h2>
			<p class="mt-1.5 max-w-2xl text-xs leading-relaxed text-[var(--ink-muted)] sm:mt-2 sm:text-base">
				Pilih kategori kegiatan atau ketuk foto mana pun untuk menikmati tampilan layar penuh dan
				mengunduh dokumentasi resolusi asli.
			</p>
		</div>

		<!-- Search Input -->
		<div class="relative w-full md:w-80">
			<Search
				class="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[var(--ink-muted)]"
				aria-hidden="true"
			/>
			<input
				bind:this={searchInputRef}
				type="search"
				value={searchQuery}
				oninput={(e) => onSearchChange((e.currentTarget as HTMLInputElement).value)}
				placeholder="Cari momen atau kegiatan..."
				aria-label="Cari foto dokumentasi"
				class="min-h-[44px] w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] py-2.5 pr-10 pl-10 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] sm:min-h-[46px]"
			/>
			{#if searchQuery}
				<button
					type="button"
					onclick={() => onSearchChange('')}
					class="absolute top-1/2 right-1.5 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--ink-muted)] hover:bg-[var(--surface-elevated)]"
					aria-label="Bersihkan kata kunci pencarian"
				>
					<X class="h-4 w-4" aria-hidden="true" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Interactive Horizontal Category Filter Bar -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={chipRail}
		onpointerdown={(e) => {
			if (!chipRail || e.pointerType === 'touch') return;
			railDown = true;
			railStartX = e.clientX;
			railScrollLeft = chipRail.scrollLeft;
		}}
		onpointermove={(e) => {
			if (!railDown || !chipRail) return;
			chipRail.scrollLeft = railScrollLeft - (e.clientX - railStartX);
		}}
		onpointerup={() => (railDown = false)}
		onpointerleave={() => (railDown = false)}
		role="region"
		aria-label="Filter Kategori Dokumentasi"
		class="no-scrollbar mb-6 flex touch-pan-x items-center gap-2 overflow-x-auto pb-2 sm:mb-9 sm:gap-2.5 lg:flex-wrap lg:overflow-visible"
	>
		<button
			type="button"
			onclick={() => onSelectCategory('all')}
			aria-pressed={activeCategory === 'all'}
			class="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors sm:min-h-[44px] sm:px-5 sm:text-sm {activeCategory ===
			'all'
				? 'border-transparent bg-[var(--brand-action)] text-[var(--brand-action-fg)]'
				: 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-elevated)]'}"
		>
			<span>All Memories</span>
			{#if totalPublished > 0}
				<span
					class="rounded-full px-2 py-0.5 text-[11px] font-bold {activeCategory === 'all'
						? 'bg-[var(--brand-action-fg)]/20 text-[var(--brand-action-fg)]'
						: 'bg-[var(--surface-elevated)] text-[var(--ink-muted)]'}"
				>
					{totalPublished}
				</span>
			{/if}
		</button>

		{#each mergedCategories as cat (cat.slug)}
			{@const isSelected = activeCategory === cat.slug}
			<button
				type="button"
				onclick={() => onSelectCategory(cat.slug)}
				aria-pressed={isSelected}
				class="inline-flex min-h-[42px] shrink-0 items-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors sm:min-h-[44px] sm:px-5 sm:text-sm {isSelected
					? 'border-transparent bg-[var(--brand-action)] text-[var(--brand-action-fg)]'
					: 'border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink)] hover:bg-[var(--surface-elevated)]'}"
			>
				<span>{cat.name}</span>
				{#if typeof cat.photos_count === 'number'}
					<span
						class="rounded-full px-2 py-0.5 text-[11px] font-bold {isSelected
							? 'bg-[var(--brand-action-fg)]/20 text-[var(--brand-action-fg)]'
							: 'bg-[var(--surface-elevated)] text-[var(--ink-muted)]'}"
					>
						{cat.photos_count}
					</span>
				{/if}
			</button>
		{/each}
	</div>

	<!-- UI State 1: Error State (R-27) -->
	{#if errorMessage}
		<div
			role="alert"
			class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-8 text-center sm:p-12"
		>
			<h3 class="font-editorial text-2xl font-bold text-[var(--ink)] sm:text-3xl">
				Gagal Memuat Koleksi Galeri
			</h3>
			<p class="mx-auto mt-2 max-w-md text-sm text-[var(--ink-muted)]">
				{errorMessage}
			</p>
			<button
				type="button"
				onclick={onRetry}
				class="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[var(--brand-action)] px-6 text-sm font-bold text-[var(--brand-action-fg)]"
			>
				<RefreshCw class="h-4 w-4" aria-hidden="true" />
				<span>Muat Ulang Galeri</span>
			</button>
		</div>

	<!-- UI State 2: Loading Skeleton State (R-27) -->
	{:else if loading}
		<div
			aria-busy="true"
			aria-label="Sedang memuat foto dokumentasi"
			class="grid grid-cols-2 gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4"
		>
			{#each [240, 190, 220, 250, 200, 240, 230, 210] as boxH, idx (idx)}
				<div
					class="skeleton-pulse rounded-2xl sm:rounded-[18px]"
					style={`height: ${boxH}px`}
				></div>
			{/each}
		</div>

	<!-- UI State 3: Empty State (R-27) -->
	{:else if photos.length === 0}
		<div
			class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] px-6 py-14 text-center sm:py-20"
		>
			<h3 class="font-editorial text-3xl font-bold text-[var(--ink)]">
				{activeCategory !== 'all' || searchQuery
					? 'Belum Ada Foto pada Kriteria Ini'
					: 'Galeri Dokumentasi Sedang Disiapkan'}
			</h3>
			<p class="mx-auto mt-2 max-w-lg text-sm text-[var(--ink-muted)]">
				{#if activeCategory !== 'all' || searchQuery}
					Tidak ditemukan foto untuk filter kategori atau kata kunci yang dipilih. Silakan kembali ke
					seluruh koleksi dokumentasi.
				{:else}
					Panitia sedang mengunggah dokumentasi kegiatan INNODEL 2026 melalui ruang kurasi. Silakan
					kunjungi kembali halaman ini beberapa saat lagi.
				{/if}
			</p>
			{#if activeCategory !== 'all' || searchQuery}
				<button
					type="button"
					onclick={resetFilters}
					class="mt-6 inline-flex min-h-[46px] items-center rounded-xl bg-[var(--brand-action)] px-6 text-sm font-bold text-[var(--brand-action-fg)]"
				>
					Tampilkan Semua Foto
				</button>
			{/if}
		</div>

	<!-- Populated Responsive Row-Major Editorial Masonry Grid -->
	{:else}
		<div class="grid grid-cols-2 items-start gap-2.5 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
			{#each masonryColumns as colPhotos, colIdx (colIdx)}
				<div class="flex min-w-0 flex-col gap-2.5 sm:gap-4">
					{#each colPhotos as photo (photo.id)}
						<article
							class="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] transition-shadow duration-200 hover:shadow-md sm:rounded-[18px]"
						>
							{#if errorMap[photo.id]}
								<div
									class="flex min-h-[180px] flex-col items-center justify-center gap-2.5 p-4 text-center sm:min-h-[240px] sm:p-6"
								>
									<ImageOff class="h-6 w-6 text-[var(--ink-muted)] sm:h-7 sm:w-7" aria-hidden="true" />
									<p class="text-xs font-medium text-[var(--ink-muted)]">
										Gagal memuat "{photo.title}"
									</p>
									<button
										type="button"
										onclick={() => retrySingleImage(photo.id)}
										class="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 text-xs font-semibold text-[var(--ink)]"
									>
										<RefreshCw class="h-3.5 w-3.5" aria-hidden="true" />
										<span>Coba Lagi</span>
									</button>
								</div>
							{:else}
								<button
									type="button"
									onclick={() => onOpenPhoto(photo, photos)}
									class="group block w-full text-left"
									aria-label={`Buka foto ${photo.title} dalam mode layar penuh`}
								>
									<div
										class="relative w-full overflow-hidden bg-[var(--surface-elevated)]"
										style={`aspect-ratio: ${photo.width} / ${photo.height}`}
									>
										{#if !loadedMap[photo.id]}
											<div class="skeleton-pulse absolute inset-0" aria-hidden="true"></div>
										{/if}

										<img
											use:watchImageLoad={photo.id}
											src={photo.thumbnail_url}
											alt={photo.title}
											width={photo.width}
											height={photo.height}
											loading="lazy"
											decoding="async"
											onload={() => (loadedMap[photo.id] = true)}
											onerror={() => (errorMap[photo.id] = true)}
											class="block h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
										/>
									</div>

									<div class="px-2.5 py-2 sm:px-3.5 sm:py-3">
										{#if photo.category}
											<span class="block truncate text-[10px] font-bold text-[var(--accent-gold)] sm:text-[11px]">
												{photo.category.name}
											</span>
										{/if}
										<h3 class="mt-0.5 line-clamp-2 text-xs leading-snug font-semibold text-[var(--ink)] sm:text-sm">
											{photo.title}
										</h3>
										{#if photo.description}
											<p class="mt-1 hidden line-clamp-2 text-xs text-[var(--ink-muted)] sm:block">
												{photo.description}
											</p>
										{/if}
									</div>
								</button>
							{/if}
						</article>
					{/each}
				</div>
			{/each}
		</div>
	{/if}
</section>
