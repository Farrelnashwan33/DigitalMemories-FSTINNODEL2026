<script lang="ts">
	import { getAdminUrl } from '#lib/api.js';

	interface Props {
		hasUtLogo?: boolean;
	}

	let { hasUtLogo = false }: Props = $props();
	let utLogoError = $state(false);
	let adminPortalUrl = $derived(getAdminUrl());
</script>

<!-- Section 6: Event Information -->
<section
	id="event-info"
	aria-labelledby="event-info-heading"
	class="scroll-mt-20 border-t border-[var(--border-subtle)] bg-[var(--surface)] py-12 sm:scroll-mt-24 sm:py-22"
>
	<div class="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-12">
			<div class="lg:col-span-7">
				<p class="text-xs font-bold tracking-wider text-[var(--accent-gold)] uppercase">
					About The Gathering
				</p>
				<h2
					id="event-info-heading"
					class="font-editorial mt-2 text-[clamp(1.75rem,5.5vw,3rem)] leading-[1.18] font-bold text-[var(--ink)]"
				>
					"Celebrating innovation, collaboration, and meaningful connections through unforgettable
					moments."
				</h2>
			</div>

			<div
				class="rounded-2xl border border-[var(--border-subtle)] bg-[var(--canvas)] p-5 sm:p-8 lg:col-span-5"
			>
				<dl class="divide-y divide-[var(--border-subtle)] text-sm">
					<div class="pb-3.5 sm:pb-4">
						<dt class="text-xs font-semibold text-[var(--ink-muted)] uppercase">Conference</dt>
						<dd class="font-editorial mt-1 text-2xl font-bold text-[var(--ink)]">INNODEL 2026</dd>
					</div>
					<div class="py-3.5 sm:py-4">
						<dt class="text-xs font-semibold text-[var(--ink-muted)] uppercase">Host Institution</dt>
						<dd class="mt-1 font-semibold text-[var(--ink)]">Universitas Terbuka Bandung</dd>
						<dd class="text-[var(--ink-muted)]">Faculty of Science and Technology</dd>
					</div>
					<div class="py-3.5 sm:py-4">
						<dt class="text-xs font-semibold text-[var(--ink-muted)] uppercase">Event Date</dt>
						<dd class="mt-1 font-semibold text-[var(--ink)]">November 4th-5th, 2026</dd>
					</div>
					<div class="pt-3.5 sm:pt-4">
						<dt class="text-xs font-semibold text-[var(--ink-muted)] uppercase">Venue</dt>
						<dd class="mt-1 font-semibold text-[var(--ink)]">El Hotel Bandung</dd>
					</div>
				</dl>
			</div>
		</div>
	</div>
</section>

<!-- Section 7: Editorial Footer (adapts cleanly to both Light and Dark themes) -->
<footer class="border-t border-[var(--border-subtle)] bg-[var(--footer-bg)] py-11 text-[var(--ink)] sm:py-14">
	<div class="mx-auto max-w-7xl px-3.5 sm:px-6 lg:px-8">
		<div class="flex flex-col justify-between gap-8 md:flex-row md:items-center">
			<div>
				<div class="flex flex-wrap items-center gap-3.5 sm:gap-4">
					<img
						src="/assets/logos/innodel-2026.png"
						alt="Logo Resmi INNODEL 2026"
						loading="lazy"
						width="164"
						height="56"
						class="h-12 w-auto object-contain sm:h-14"
					/>
					<img
						src="/assets/logos/fst-ut-bandung.png"
						alt="Logo Fakultas Sains dan Teknologi Universitas Terbuka Bandung"
						loading="lazy"
						width="52"
						height="52"
						class="h-11 w-11 rounded-full border border-[var(--border-subtle)] bg-[#fbf7ef] p-0.5 object-contain sm:h-13 sm:w-13"
					/>
					{#if hasUtLogo && !utLogoError}
						<img
							src="/assets/logos/ut-official.png"
							alt="Logo Resmi Universitas Terbuka"
							loading="lazy"
							width="52"
							height="52"
							onerror={() => (utLogoError = true)}
							class="h-11 w-auto object-contain sm:h-13"
						/>
					{:else}
						<!-- Honest placeholder slot until official UT emblem is placed in /static/assets/logos/ut-official.png -->
						<div
							title="Simpan file ut-official.png di folder static/assets/logos/ untuk menampilkan Logo UT resmi"
							class="inline-flex h-10 items-center rounded-xl border border-dashed border-[var(--border-subtle)] px-3 text-xs font-semibold text-[var(--ink-muted)] sm:h-12 sm:px-3.5"
						>
							[LOGO UT]
						</div>
					{/if}
				</div>

				<p class="font-editorial mt-4 text-xl italic text-[var(--accent-gold)] sm:mt-5 sm:text-2xl">
					"Every Moment Has a Story."
				</p>
			</div>

			<div class="space-y-1 text-xs text-[var(--ink-muted)] sm:text-sm md:text-right">
				<div class="font-semibold text-[var(--ink)]">Universitas Terbuka Bandung</div>
				<div>Fakultas Sains dan Teknologi</div>
				<div>November 4th-5th, 2026 · El Hotel Bandung</div>
			</div>
		</div>

		<div
			class="mt-8 flex flex-col items-start justify-between gap-3 border-t border-[var(--border-subtle)] pt-5 text-xs text-[var(--ink-muted)] sm:mt-10 sm:flex-row sm:items-center sm:pt-6"
		>
			<p>Copyright © 2026 INNODEL FST UT Bandung.</p>
			<div class="flex items-center gap-5">
				<a href="#hero" class="min-h-[36px] py-2 font-medium hover:text-[var(--ink)]">Back to Top</a>
				<a
					href={adminPortalUrl}
					class="min-h-[36px] py-2 font-medium hover:text-[var(--accent-gold)]"
				>
					Organizer Admin Portal
				</a>
			</div>
		</div>
	</div>
</footer>
