<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight, X, Download } from '@lucide/svelte';
	import type { PhotoItem } from '#lib/types.js';

	interface Props {
		items: PhotoItem[];
		currentIndex: number;
		open: boolean;
		onClose: () => void;
		onNavigate: (nextIndex: number) => void;
	}

	let { items, currentIndex, open, onClose, onNavigate }: Props = $props();

	let dialogEl = $state<HTMLDialogElement | null>(null);
	let imageError = $state(false);
	let touchStartX = 0;
	let touchStartY = 0;

	let currentPhoto = $derived(items[currentIndex] ?? null);

	function stepPhoto(delta: -1 | 1) {
		if (items.length <= 1) return;
		imageError = false;
		const next = (currentIndex + delta + items.length) % items.length;
		onNavigate(next);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (!open) return;
		if (e.key === 'ArrowLeft') {
			e.preventDefault();
			stepPhoto(-1);
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			stepPhoto(1);
		}
	}

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length !== 1) return;
		touchStartX = e.touches[0].clientX;
		touchStartY = e.touches[0].clientY;
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.changedTouches.length !== 1) return;
		const dx = e.changedTouches[0].clientX - touchStartX;
		const dy = e.changedTouches[0].clientY - touchStartY;
		if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.25) {
			stepPhoto(dx < 0 ? 1 : -1);
		}
	}

	$effect(() => {
		if (!dialogEl) return;
		if (open && currentPhoto) {
			imageError = false;
			if (!dialogEl.open) {
				dialogEl.showModal();
			}
		} else if (!open && dialogEl.open) {
			dialogEl.close();
		}
	});

	onMount(() => {
		const el = dialogEl;
		if (!el) return;

		// Mandatory Safari fallback for closedby="any" per modern-web-guidance light-dismiss-a-dialog
		if (!('closedBy' in HTMLDialogElement.prototype)) {
			el.addEventListener('click', (event: MouseEvent) => {
				if (event.target !== el) return;
				const rect = el.getBoundingClientRect();
				const isDialogContent =
					rect.top <= event.clientY &&
					event.clientY <= rect.top + rect.height &&
					rect.left <= event.clientX &&
					event.clientX <= rect.left + rect.width;
				if (!isDialogContent) {
					el.close();
				}
			});
		}
	});
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Native <dialog> opened via showModal(): no role="dialog" or aria-modal per modern-web-guidance -->
<dialog
	bind:this={dialogEl}
	{...({ closedby: 'any' } as Record<string, string>)}
	aria-labelledby="lightbox-photo-title"
	onclose={() => {
		if (dialogEl) dialogEl.returnValue = '';
		onClose();
	}}
	class="lightbox-dialog"
>
	{#if currentPhoto}
		<div
			role="group"
			aria-label="Penampil foto layar penuh"
			ontouchstart={handleTouchStart}
			ontouchend={handleTouchEnd}
			class="flex max-h-[calc(100dvh-16px)] flex-col overflow-hidden rounded-[20px] border border-[#f6f1e7]/20 bg-[#0b201c] text-[#f6f1e7] shadow-2xl sm:rounded-[24px]"
		>
			<!-- Top Bar -->
			<div
				class="flex items-center justify-between gap-2 border-b border-[#f6f1e7]/15 px-3.5 py-2.5 sm:px-6 sm:py-3"
			>
				<div class="flex min-w-0 items-center gap-2 text-xs text-[#d8cfbe]">
					<span class="shrink-0 font-bold text-[#e5bd68]">
						{currentIndex + 1} / {items.length}
					</span>
					{#if currentPhoto.category}
						<span>·</span>
						<span class="truncate">{currentPhoto.category.name}</span>
					{/if}
				</div>

				<div class="flex shrink-0 items-center gap-2">
					<a
						href={currentPhoto.image_url}
						download={`${currentPhoto.title}.webp`}
						target="_blank"
						rel="noopener"
						class="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl border border-[#f6f1e7]/25 px-3 text-xs font-semibold text-[#f6f1e7] hover:bg-[#f6f1e7]/12 sm:min-h-[42px] sm:px-3.5"
					>
						<Download class="h-4 w-4" aria-hidden="true" />
						<span>Unduh</span>
					</a>

					<form method="dialog" class="m-0">
						<button
							type="submit"
							class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#f6f1e7]/14 text-[#f6f1e7] hover:bg-[#f6f1e7]/24 sm:h-11 sm:w-11"
							aria-label="Tutup tampilan layar penuh"
						>
							<X class="h-5 w-5" aria-hidden="true" />
						</button>
					</form>
				</div>
			</div>

			<!-- Main Image Stage (full unobstructed width on phones; side gutter arrows on sm+) -->
			<div
				class="relative flex min-h-[44dvh] flex-1 items-center justify-center bg-[#071512] px-2 py-2.5 sm:px-16 sm:py-5"
			>
				{#if items.length > 1}
					<button
						type="button"
						onclick={() => stepPhoto(-1)}
						class="absolute top-1/2 left-4 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#f6f1e7]/25 bg-[#0d2420]/85 text-[#f6f1e7] hover:bg-[#173d36] sm:inline-flex"
						aria-label="Foto sebelumnya"
					>
						<ChevronLeft class="h-5 w-5" aria-hidden="true" />
					</button>
				{/if}

				{#if imageError}
					<div class="p-8 text-center text-sm text-[#d8cfbe]">
						Resolusi penuh foto ini sedang tidak dapat dimuat.
					</div>
				{:else}
					<img
						src={currentPhoto.image_url}
						alt={currentPhoto.title}
						width={currentPhoto.width}
						height={currentPhoto.height}
						onerror={() => (imageError = true)}
						class="block max-h-[60dvh] w-auto max-w-full rounded-xl object-contain sm:max-h-[66dvh]"
					/>
				{/if}

				{#if items.length > 1}
					<button
						type="button"
						onclick={() => stepPhoto(1)}
						class="absolute top-1/2 right-4 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[#f6f1e7]/25 bg-[#0d2420]/85 text-[#f6f1e7] hover:bg-[#173d36] sm:inline-flex"
						aria-label="Foto berikutnya"
					>
						<ChevronRight class="h-5 w-5" aria-hidden="true" />
					</button>
				{/if}
			</div>

			<!-- Caption & Mobile Navigation Footer -->
			<div class="border-t border-[#f6f1e7]/15 px-3.5 py-3 sm:px-6 sm:py-3.5">
				<div class="flex items-center justify-between gap-3">
					<div class="min-w-0 flex-1">
						<h2
							id="lightbox-photo-title"
							class="font-editorial text-lg leading-snug font-bold text-[#fbf7ef] sm:text-2xl"
						>
							{currentPhoto.title}
						</h2>
						{#if currentPhoto.description}
							<p class="mt-0.5 line-clamp-2 text-xs leading-relaxed text-[#d8cfbe] sm:mt-1 sm:text-sm">
								{currentPhoto.description}
							</p>
						{/if}
					</div>

					{#if items.length > 1}
						<div class="flex shrink-0 items-center gap-1.5 sm:hidden">
							<button
								type="button"
								onclick={() => stepPhoto(-1)}
								class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f6f1e7]/25 bg-[#13322c] text-[#f6f1e7]"
								aria-label="Foto sebelumnya"
							>
								<ChevronLeft class="h-5 w-5" aria-hidden="true" />
							</button>
							<button
								type="button"
								onclick={() => stepPhoto(1)}
								class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#f6f1e7]/25 bg-[#13322c] text-[#f6f1e7]"
								aria-label="Foto berikutnya"
							>
								<ChevronRight class="h-5 w-5" aria-hidden="true" />
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</dialog>
