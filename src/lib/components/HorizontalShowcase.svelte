<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, Search, Plus } from '@lucide/svelte';
	import type { PhotoItem } from '#lib/types.js';

	interface Props {
		photos: PhotoItem[];
		totalPublished: number;
		onSelectPhoto: (photo: PhotoItem, collection: PhotoItem[]) => void;
	}

	let { photos, totalPublished, onSelectPhoto }: Props = $props();

	let scrollerEl = $state<HTMLDivElement | null>(null);
	let canScrollLeft = $state(false);
	let canScrollRight = $state(true);
	let scrollProgress = $state(0);

	// Mouse drag-to-scroll state for desktop
	let isPointerDown = false;
	let didDrag = false;
	let startX = 0;
	let startScrollLeft = 0;

	let brokenIds = $state<Record<number, boolean>>({});
	let loadedIds = $state<Record<number, boolean>>({});

	function watchImg(node: HTMLImageElement, id: number) {
		if (node.complete && node.naturalWidth > 0) {
			loadedIds[id] = true;
		}
		return {
			update(nextId: number) {
				if (node.complete && node.naturalWidth > 0) {
					loadedIds[nextId] = true;
				}
			}
		};
	}

	function updateScrollIndicators() {
		if (!scrollerEl) return;
		const maxScroll = Math.max(0, scrollerEl.scrollWidth - scrollerEl.clientWidth);
		canScrollLeft = scrollerEl.scrollLeft > 8;
		canScrollRight = scrollerEl.scrollLeft < maxScroll - 8;
		scrollProgress =
			maxScroll > 0 ? Math.min(100, Math.round((scrollerEl.scrollLeft / maxScroll) * 100)) : 100;
	}

	function scrollHorizontal(direction: -1 | 1) {
		if (!scrollerEl) return;
		const step = Math.min(440, Math.round(scrollerEl.clientWidth * 0.8));
		scrollerEl.scrollBy({ left: direction * step, behavior: 'smooth' });
	}

	function handlePointerDown(e: PointerEvent) {
		if (!scrollerEl || e.pointerType === 'touch' || e.button !== 0) return;
		isPointerDown = true;
		didDrag = false;
		startX = e.clientX;
		startScrollLeft = scrollerEl.scrollLeft;
	}

	function handlePointerMove(e: PointerEvent) {
		if (!isPointerDown || !scrollerEl) return;
		const dx = e.clientX - startX;
		if (Math.abs(dx) > 6) {
			didDrag = true;
			scrollerEl.scrollLeft = startScrollLeft - dx;
		}
	}

	function handlePointerUp() {
		isPointerDown = false;
		setTimeout(() => {
			didDrag = false;
		}, 40);
	}

	function handleCardActivate(photo: PhotoItem) {
		if (didDrag) return;
		onSelectPhoto(photo, photos);
	}

	onMount(() => {
		updateScrollIndicators();
		window.addEventListener('resize', updateScrollIndicators);
		return () => window.removeEventListener('resize', updateScrollIndicators);
	});

	$effect(() => {
		if (photos.length >= 0) {
			queueMicrotask(updateScrollIndicators);
		}
	});
</script>

{#if photos.length > 0}
	<section
		id="showcase"
		aria-labelledby="showcase-heading"
		class="relative scroll-mt-20 overflow-hidden py-10 text-[var(--ink)] sm:scroll-mt-24 sm:py-18"
	>
		<!-- Atmospheric Venue Backdrop matching visual reference aesthetics -->
		<img
			src="/assets/venue/ballroom-ambient.webp"
			alt=""
			aria-hidden="true"
			loading="lazy"
			width="1600"
			height="1200"
			class="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center"
		/>
		<div
			class="pointer-events-none absolute inset-0"
			style="background: var(--showcase-wash);"
			aria-hidden="true"
		></div>

		<div class="relative z-10 mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
			<!-- Signature Glass Showcase Frame (2nd and final element in R-10 blur budget) -->
			<div class="glass-showcase-frame rounded-[24px] p-4 sm:rounded-[28px] sm:p-7 lg:p-9">
				<!-- Editorial Header Row -->
				<div class="mb-5 grid grid-cols-1 items-start gap-3.5 sm:mb-7 lg:grid-cols-12 lg:items-center lg:gap-5">
					<div class="lg:col-span-4">
						<h2
							id="showcase-heading"
							class="font-editorial text-[clamp(1.75rem,6vw,2.4rem)] leading-[1.08] font-bold text-[var(--ink)]"
						>
							Highlights From<br class="hidden sm:inline" /> El Hotel Bandung
						</h2>
					</div>

					<p class="text-xs leading-relaxed text-[var(--ink-muted)] sm:text-[13px] lg:col-span-4">
						Kolaborasi akademisi, mahasiswa Fakultas Sains dan Teknologi, serta pembicara
						internasional dalam dua hari penuh inspirasi di Kota Bandung.
					</p>

					<div class="flex items-center justify-between gap-2 lg:col-span-4 lg:justify-end">
						<span class="text-[11px] font-medium text-[var(--ink-muted)] sm:text-xs">
							Geser ke samping
						</span>

						<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
							<button
								type="button"
								onclick={() => scrollHorizontal(-1)}
								disabled={!canScrollLeft}
								class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink)] transition-opacity hover:bg-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-35 sm:h-11 sm:w-11"
								aria-label="Geser foto ke kiri"
							>
								<ChevronLeft class="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
							</button>
							<button
								type="button"
								onclick={() => scrollHorizontal(1)}
								disabled={!canScrollRight}
								class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--ink)] transition-opacity hover:bg-[var(--surface-elevated)] disabled:cursor-not-allowed disabled:opacity-35 sm:h-11 sm:w-11"
								aria-label="Geser foto ke kanan"
							>
								<ChevronRight class="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
							</button>
							<a
								href="#gallery"
								class="inline-flex min-h-[40px] items-center rounded-full bg-[var(--brand-action)] px-3.5 text-xs font-bold text-[var(--brand-action-fg)] transition-transform hover:scale-[1.02] sm:min-h-[44px] sm:px-4"
							>
								Full Archive
							</a>
						</div>
					</div>
				</div>

				<!-- Horizontal Filmstrip with Varied Proportions & Mobile Peek -->
				<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
				<div
					bind:this={scrollerEl}
					onscroll={updateScrollIndicators}
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerUp}
					onpointerleave={handlePointerUp}
					role="region"
					aria-label="Galeri foto sorotan horizontal"
					class="no-scrollbar flex snap-x snap-mandatory cursor-grab touch-pan-x gap-3 overflow-x-auto pb-2 select-none active:cursor-grabbing sm:snap-none sm:gap-5"
				>
					{#each photos as photo, idx (photo.id)}
						{@const isLeadStory = idx % 3 === 0}
						{@const isLandscape = photo.orientation === 'landscape'}

						{#if isLeadStory}
							<!-- Pattern A: Framed Photo + Story Caption Pill Below (matches left column of reference) -->
							<div
								class="flex w-[74vw] max-w-[266px] shrink-0 snap-start flex-col gap-3 sm:w-[356px] sm:max-w-none"
							>
								<button
									type="button"
									onclick={() => handleCardActivate(photo)}
									class="group relative h-[208px] w-full overflow-hidden rounded-[20px] bg-[var(--surface-elevated)] text-left sm:h-[288px] sm:rounded-[22px]"
									aria-label={`Buka foto ${photo.title} dalam layar penuh`}
								>
									{#if !loadedIds[photo.id] && !brokenIds[photo.id]}
										<div class="skeleton-pulse absolute inset-0" aria-hidden="true"></div>
									{/if}

									{#if brokenIds[photo.id]}
										<div
											class="flex h-full w-full items-center justify-center p-4 text-center text-xs text-[var(--ink-muted)]"
										>
											<span>Gambar tidak dapat dimuat: {photo.title}</span>
										</div>
									{:else}
										<img
											use:watchImg={photo.id}
											src={photo.thumbnail_url}
											alt={photo.title}
											width={photo.width}
											height={photo.height}
											loading={idx < 2 ? undefined : 'lazy'}
											fetchpriority={idx >= 3 ? 'low' : undefined}
											onload={() => (loadedIds[photo.id] = true)}
											onerror={() => (brokenIds[photo.id] = true)}
											draggable="false"
											class="block h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
										/>
									{/if}

									<span
										class="absolute right-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf7ef] text-[#102823] shadow-md transition-transform duration-200 group-hover:scale-110 sm:right-3.5 sm:bottom-3.5 sm:h-10 sm:w-10"
										aria-hidden="true"
									>
										<Search class="h-4 w-4" />
									</span>
								</button>

								<div
									class="flex h-[68px] items-center gap-2.5 rounded-[16px] border border-[var(--border-subtle)] bg-[var(--surface)]/95 px-3 py-2 sm:h-[72px] sm:gap-3 sm:rounded-[18px] sm:px-3.5"
								>
									<img
										src="/assets/logos/fst-ut-bandung.png"
										alt=""
										aria-hidden="true"
										width="36"
										height="36"
										class="h-8 w-8 shrink-0 rounded-full border border-[var(--border-subtle)] bg-[#fbf7ef] p-0.5 object-contain sm:h-9 sm:w-9"
									/>
									<div class="min-w-0">
										<div class="truncate text-xs font-bold text-[var(--ink)]">{photo.title}</div>
										<p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-[var(--ink-muted)]">
											{photo.description || photo.category?.name || 'Dokumentasi resmi INNODEL 2026'}
										</p>
									</div>
								</div>
							</div>
						{:else}
							<!-- Pattern B/C: Full-Height Artistic Portrait or Wide Frame (matches right columns of reference) -->
							<button
								type="button"
								onclick={() => handleCardActivate(photo)}
								class="group relative h-[288px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-[var(--surface-elevated)] text-left sm:h-[372px] sm:rounded-[22px] {isLandscape
									? 'w-[76vw] max-w-[274px] sm:w-[396px] sm:max-w-none'
									: 'w-[58vw] max-w-[214px] sm:w-[280px] sm:max-w-none'}"
								aria-label={`Buka foto ${photo.title} dalam layar penuh`}
							>
								{#if !loadedIds[photo.id] && !brokenIds[photo.id]}
									<div class="skeleton-pulse absolute inset-0" aria-hidden="true"></div>
								{/if}

								{#if brokenIds[photo.id]}
									<div
										class="flex h-full w-full items-center justify-center p-4 text-center text-xs text-[var(--ink-muted)]"
									>
										<span>Gambar tidak dapat dimuat: {photo.title}</span>
									</div>
								{:else}
									<img
										use:watchImg={photo.id}
										src={photo.thumbnail_url}
										alt={photo.title}
										width={photo.width}
										height={photo.height}
										loading={idx < 3 ? undefined : 'lazy'}
										fetchpriority={idx >= 3 ? 'low' : undefined}
										onload={() => (loadedIds[photo.id] = true)}
										onerror={() => (brokenIds[photo.id] = true)}
										draggable="false"
										class="block h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
									/>
								{/if}

								<div
									class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#081916]/90 via-[#081916]/42 to-transparent p-3.5 pt-11 sm:p-4 sm:pt-12"
								>
									<span class="block text-[10px] font-semibold text-[#e5bd68] sm:text-[11px]">
										{photo.category?.name ?? 'INNODEL 2026'}
									</span>
									<span class="mt-0.5 line-clamp-1 block pr-10 text-xs font-semibold text-[#fbf7ef]">
										{photo.title}
									</span>
								</div>

								<span
									class="absolute right-3 bottom-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf7ef] text-[#102823] shadow-md transition-transform duration-200 group-hover:scale-110 sm:right-3.5 sm:bottom-3.5 sm:h-10 sm:w-10"
									aria-hidden="true"
								>
									<Plus class="h-4 w-4" />
								</span>
							</button>
						{/if}
					{/each}
				</div>

				<!-- Subtle Scroll Progress Track -->
				<div class="mt-3.5 flex items-center gap-3 sm:mt-4">
					<div class="h-1 flex-1 overflow-hidden rounded-full bg-[var(--border-subtle)]">
						<div
							class="h-full rounded-full bg-[var(--brand-action)] transition-all duration-150"
							style={`width: ${Math.max(15, scrollProgress)}%`}
						></div>
					</div>
					<span class="shrink-0 text-[11px] font-medium text-[var(--ink-muted)]">
						{photos.length} featured frames
					</span>
				</div>
			</div>

			<!-- Bottom Editorial Reflection Strip -->
			<div
				class="mt-4 flex flex-col items-start justify-between gap-3.5 rounded-[22px] border border-[var(--border-subtle)] bg-[var(--surface)]/95 px-4 py-3.5 text-[var(--ink)] sm:mt-5 sm:flex-row sm:items-center sm:rounded-[26px] sm:px-7 sm:py-4"
			>
				<div class="flex items-center gap-3.5">
					<img
						src="/assets/venue/hotel-lobby.webp"
						alt="Suasana Lobi El Hotel Bandung"
						loading="lazy"
						width="56"
						height="56"
						class="h-11 w-11 shrink-0 rounded-full border border-[var(--accent-gold)]/50 object-cover sm:h-13 sm:w-13"
					/>
					<div class="min-w-0">
						<p class="text-xs leading-snug font-bold tracking-wide text-[var(--ink)] uppercase sm:text-sm">
							Setiap Pertemuan Menyimpan Cerita Inovasi yang Layak Dikenang
						</p>
						<p class="mt-0.5 text-xs text-[var(--ink-muted)]">
							Fakultas Sains dan Teknologi · Universitas Terbuka Bandung
						</p>
					</div>
				</div>

				<div class="flex w-full items-center justify-between gap-4 border-t border-[var(--border-subtle)] pt-2.5 sm:w-auto sm:justify-end sm:border-t-0 sm:pt-0">
					<div class="text-xs text-[var(--ink-muted)]">
						<span class="block font-bold text-[var(--accent-gold)]">{totalPublished} Dokumentasi</span>
						<span>4-5 November 2026</span>
					</div>
					<a
						href="#gallery"
						class="inline-flex h-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-subtle)] bg-[var(--canvas)] px-4 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--surface-elevated)] sm:h-11"
					>
						Jelajahi Galeri
					</a>
				</div>
			</div>
		</div>
	</section>
{/if}
