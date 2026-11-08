<script lang="ts">
	import { onMount } from 'svelte';
	import type { PhotoItem } from '#lib/types.js';

	interface Props {
		totalPhotos?: number;
		featuredPhotos?: PhotoItem[];
	}

	let { totalPhotos = 0, featuredPhotos = [] }: Props = $props();

	const fallbackSlides = [
		{
			id: -1,
			url: '/assets/venue/hero-stage.webp',
			title: 'Formasi Delegasi FST UT Bandung di Panggung Utama INNODEL 2026'
		},
		{
			id: -2,
			url: '/assets/venue/ballroom-ambient.webp',
			title: 'Suasana Ballroom Utama El Hotel Bandung'
		},
		{
			id: -3,
			url: '/assets/venue/hotel-lobby.webp',
			title: 'Kebersamaan Peserta di Lobi El Hotel Bandung'
		}
	];

	let heroSlides = $derived.by(() => {
		if (!featuredPhotos || featuredPhotos.length === 0) {
			return fallbackSlides;
		}
		// Follow the exact Featured (Unggulan) sort_order set in the Admin Dashboard
		return featuredPhotos.slice(0, 6).map((p) => ({
			id: p.id,
			url: p.image_url || p.thumbnail_url,
			title: p.title
		}));
	});

	let activeSlide = $state(0);
	let paused = $state(false);

	$effect(() => {
		if (activeSlide >= heroSlides.length) {
			activeSlide = 0;
		}
	});

	function selectSlide(idx: number) {
		activeSlide = idx;
	}

	onMount(() => {
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const timer = setInterval(() => {
			if (!paused && heroSlides.length > 1) {
				activeSlide = (activeSlide + 1) % heroSlides.length;
			}
		}, 5000);

		return () => clearInterval(timer);
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<section
	id="hero"
	onmouseenter={() => (paused = true)}
	onmouseleave={() => (paused = false)}
	class="relative flex min-h-[100svh] w-full items-end overflow-hidden bg-[var(--canvas)] pt-36 pb-7 text-[var(--ink)] sm:pt-32 sm:pb-14 lg:pb-20"
>
	<!-- Dynamic Auto-Slideshow Background from Featured Admin Photos (LCP slide idx===0 gets fetchpriority="high") -->
	{#each heroSlides as slide, idx (slide.id)}
		<img
			src={slide.url}
			alt={slide.title}
			width="1800"
			height="1350"
			fetchpriority={idx === 0 ? 'high' : 'low'}
			loading={idx === 0 ? undefined : 'lazy'}
			decoding="async"
			class="pointer-events-none absolute inset-0 h-full w-full object-cover object-[center_18%] transition-opacity duration-1000 ease-in-out sm:object-center {idx ===
			activeSlide
				? 'opacity-100'
				: 'opacity-0'}"
		/>
	{/each}

	<!-- Adaptive Daylight / Midnight editorial scrim guaranteeing WCAG AA contrast in both Light and Dark themes -->
	<div
		class="pointer-events-none absolute inset-0 transition-opacity duration-300"
		style="background: var(--hero-scrim);"
		aria-hidden="true"
	></div>

	<div class="relative z-10 mx-auto w-full max-w-7xl px-3.5 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 items-end gap-5 sm:gap-8 lg:grid-cols-12">
			<!-- Left Editorial Masthead -->
			<div class="lg:col-span-8">
				<div class="mb-3.5 flex flex-wrap items-center gap-3 sm:mb-6 sm:gap-4">
					<img
						src="/assets/logos/innodel-2026.png"
						alt="Logo Resmi INNODEL 2026"
						width="220"
						height="76"
						class="h-12 w-auto object-contain sm:h-18 lg:h-20"
					/>
					<img
						src="/assets/logos/fst-ut-bandung.png"
						alt="Logo Fakultas Sains dan Teknologi Universitas Terbuka Bandung"
						width="64"
						height="64"
						class="h-10 w-10 rounded-full border border-[var(--border-subtle)] bg-[#fbf7ef] p-0.5 object-contain sm:h-14 sm:w-14"
					/>
				</div>

				<h1
					class="font-editorial text-[clamp(2.35rem,9vw,5.4rem)] leading-[0.96] font-bold tracking-tight text-[var(--ink)]"
				>
					INNODEL 2026
				</h1>

				<p
					class="font-editorial mt-2 text-[clamp(1.15rem,4.2vw,1.875rem)] leading-snug italic text-[var(--accent-gold)] sm:mt-3"
				>
					A Collection of Moments, Memories &amp; Innovation
				</p>

				<div
					class="mt-5 grid grid-cols-1 gap-2.5 min-[360px]:grid-cols-2 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:gap-3.5"
				>
					<a
						href="#gallery"
						class="inline-flex min-h-[46px] items-center justify-center rounded-xl bg-[var(--brand-action)] px-4 py-2.5 text-center text-xs font-bold text-[var(--brand-action-fg)] transition-transform duration-200 hover:scale-[1.02] sm:min-h-[48px] sm:px-7 sm:py-3 sm:text-sm"
					>
						Explore Memories
					</a>
					<a
						href="#showcase"
						class="inline-flex min-h-[46px] items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)]/90 px-4 py-2.5 text-center text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-elevated)] sm:min-h-[48px] sm:px-6 sm:py-3 sm:text-sm"
					>
						Photo Showcase
					</a>
				</div>

				{#if heroSlides.length > 1}
					<div
						class="mt-4 flex flex-wrap items-center gap-2 sm:mt-6"
						role="group"
						aria-label="Pemilih latar foto utama"
					>
						{#each heroSlides as slide, idx (slide.id)}
							<button
								type="button"
								onclick={() => selectSlide(idx)}
								aria-label={`Tampilkan latar foto ${idx + 1}: ${slide.title}`}
								aria-pressed={idx === activeSlide}
								class="h-2 rounded-full transition-all duration-300 {idx === activeSlide
									? 'w-8 bg-[var(--brand-action)]'
									: 'w-2.5 bg-[var(--ink)]/30 hover:bg-[var(--ink)]/55'}"
							></button>
						{/each}
						<span class="ml-1 truncate max-w-[230px] text-[11px] font-medium text-[var(--ink-muted)] sm:max-w-xs">
							{heroSlides[activeSlide]?.title}
						</span>
					</div>
				{/if}
			</div>

			<!-- Right Architectural Event Ledger -->
			<div class="lg:col-span-4">
				<div
					class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)]/92 p-4 text-sm text-[var(--ink)] shadow-sm sm:p-6"
				>
					<div class="text-[11px] font-bold tracking-wider text-[var(--accent-gold)] uppercase sm:text-xs">
						Official Event Archive
					</div>
					<dl
						class="mt-2.5 grid grid-cols-1 gap-2.5 text-xs min-[360px]:grid-cols-2 sm:mt-3 sm:text-sm lg:block lg:space-y-2.5"
					>
						<div>
							<dt class="sr-only">Fakultas dan Institusi</dt>
							<dd class="font-semibold text-[var(--ink)]">Faculty of Science and Technology</dd>
							<dd class="text-[var(--ink-muted)]">Universitas Terbuka Bandung</dd>
						</div>
						<div
							class="border-t border-[var(--border-subtle)] pt-2 min-[360px]:border-t-0 min-[360px]:border-l min-[360px]:pt-0 min-[360px]:pl-3 lg:border-t lg:border-l-0 lg:pt-2.5 lg:pl-0"
						>
							<dt class="sr-only">Tanggal dan Lokasi</dt>
							<dd class="font-semibold text-[var(--ink)]">November 4th-5th, 2026</dd>
							<dd class="text-[var(--ink-muted)]">El Hotel Bandung</dd>
						</div>
					</dl>
					{#if totalPhotos > 0}
						<div class="mt-2.5 border-t border-[var(--border-subtle)] pt-2 text-[11px] text-[var(--ink-muted)] sm:text-xs">
							<span class="font-bold text-[var(--accent-gold)]">{totalPhotos}</span> curated photographs
							available in full resolution
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>
