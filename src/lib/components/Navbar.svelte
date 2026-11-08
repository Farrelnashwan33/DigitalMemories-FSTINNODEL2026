<script lang="ts">
	import { onMount } from 'svelte';
	import { Menu, X, Search, Sun, Moon } from '@lucide/svelte';

	interface Props {
		onQuickSearch?: () => void;
	}

	let { onQuickSearch }: Props = $props();

	let mobileOpen = $state(false);
	let isDark = $state(true);

	function resolveIsDark(): boolean {
		if (typeof window === 'undefined') return true;
		const rootTheme = document.documentElement.dataset.theme;
		if (rootTheme === 'dark') return true;
		if (rootTheme === 'light') return false;
		const stored = localStorage.getItem('innodel-color-scheme');
		if (stored === 'dark') return true;
		if (stored === 'light') return false;
		return window.matchMedia('(prefers-color-scheme: dark)').matches;
	}

	function applyTheme(target: 'light' | 'dark') {
		const meta = document.querySelector('meta[name="color-scheme"]');
		const sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		const systemScheme = sysDark ? 'dark' : 'light';

		if (target === systemScheme) {
			localStorage.removeItem('innodel-color-scheme');
			if (meta) meta.setAttribute('content', 'light dark');
			delete document.documentElement.dataset.theme;
		} else {
			localStorage.setItem('innodel-color-scheme', target);
			if (meta) meta.setAttribute('content', target);
			document.documentElement.dataset.theme = target;
		}
		isDark = target === 'dark';
	}

	function toggleColorScheme() {
		if (typeof window === 'undefined') return;
		const next = resolveIsDark() ? 'light' : 'dark';
		applyTheme(next);
	}

	function handleQuickSearch() {
		mobileOpen = false;
		onQuickSearch?.();
	}

	onMount(() => {
		isDark = resolveIsDark();
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		const onChange = () => {
			isDark = resolveIsDark();
		};
		const onStorage = (e: StorageEvent) => {
			if (e.key === 'innodel-color-scheme') {
				const meta = document.querySelector('meta[name="color-scheme"]');
				if (e.newValue === 'light' || e.newValue === 'dark') {
					if (meta) meta.setAttribute('content', e.newValue);
					document.documentElement.dataset.theme = e.newValue;
				} else {
					if (meta) meta.setAttribute('content', 'light dark');
					delete document.documentElement.dataset.theme;
				}
				isDark = resolveIsDark();
			}
		};
		const onResize = () => {
			if (window.innerWidth >= 768 && mobileOpen) {
				mobileOpen = false;
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && mobileOpen) mobileOpen = false;
		};

		mql.addEventListener('change', onChange);
		window.addEventListener('storage', onStorage);
		window.addEventListener('resize', onResize);
		window.addEventListener('keydown', onKey);
		return () => {
			mql.removeEventListener('change', onChange);
			window.removeEventListener('storage', onStorage);
			window.removeEventListener('resize', onResize);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<header class="fixed top-2.5 right-0 left-0 z-40 px-2.5 sm:top-4 sm:px-6">
	<div
		class="glass-navbar mx-auto max-w-7xl rounded-[18px] px-3 py-2 text-[var(--ink)] transition-colors duration-200 sm:rounded-[20px] sm:px-5 sm:py-2.5"
	>
		<div class="flex items-center justify-between gap-2">
			<a
				href="#hero"
				class="flex min-h-[42px] min-w-0 shrink-0 items-center gap-2.5 rounded-xl px-1 transition-opacity hover:opacity-90 sm:gap-3"
				aria-label="INNODEL 2026 Digital Memories Beranda"
			>
				<img
					src="/assets/logos/innodel-2026.png"
					alt="Logo Resmi INNODEL 2026"
					width="116"
					height="40"
					class="h-8 w-auto shrink-0 object-contain sm:h-10"
				/>
				<div class="hidden border-l border-[var(--border-subtle)] pl-3 sm:block">
					<span class="block text-xs font-bold tracking-wide text-[var(--ink)]">
						DIGITAL MEMORIES
					</span>
					<span class="block text-[11px] text-[var(--ink-muted)]">FST UT Bandung · 2026</span>
				</div>
			</a>

			<nav class="hidden items-center gap-2 md:flex" aria-label="Navigasi Utama">
				<a
					href="#hero"
					class="inline-flex min-h-[40px] items-center rounded-full bg-[var(--nav-chip)] px-4 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--nav-chip-hover)]"
				>
					Home
				</a>
				<a
					href="#showcase"
					class="inline-flex min-h-[40px] items-center rounded-full bg-[var(--nav-chip)] px-4 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--nav-chip-hover)]"
				>
					Showcase
				</a>
				<a
					href="#gallery"
					class="inline-flex min-h-[40px] items-center rounded-full bg-[var(--nav-chip)] px-4 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--nav-chip-hover)]"
				>
					Photo Gallery
				</a>
				<a
					href="#event-info"
					class="inline-flex min-h-[40px] items-center rounded-full bg-[var(--nav-chip)] px-4 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-[var(--nav-chip-hover)]"
				>
					Event Info
				</a>
			</nav>

			<div class="flex shrink-0 items-center gap-1.5 sm:gap-2">
				<button
					type="button"
					onclick={handleQuickSearch}
					class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[var(--nav-chip)] text-[var(--ink)] transition-colors hover:bg-[var(--nav-chip-hover)] sm:h-11 sm:w-11"
					aria-label="Cari foto di galeri"
				>
					<Search class="h-4 w-4" aria-hidden="true" />
				</button>

				<button
					type="button"
					onclick={toggleColorScheme}
					class="inline-flex h-10 items-center gap-1.5 rounded-full bg-[var(--brand-action)] px-3 text-xs font-bold text-[var(--brand-action-fg)] transition-transform hover:scale-[1.02] sm:h-11 sm:gap-2 sm:px-3.5"
					aria-label={isDark ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'}
				>
					{#if isDark}
						<Sun class="h-4 w-4 shrink-0" aria-hidden="true" />
						<span class="hidden min-[380px]:inline">Light</span>
					{:else}
						<Moon class="h-4 w-4 shrink-0" aria-hidden="true" />
						<span class="hidden min-[380px]:inline">Dark</span>
					{/if}
				</button>

				<button
					type="button"
					onclick={() => (mobileOpen = !mobileOpen)}
					class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--nav-chip)] text-[var(--ink)] transition-colors hover:bg-[var(--nav-chip-hover)] sm:h-11 sm:w-11 md:hidden"
					aria-expanded={mobileOpen}
					aria-controls="mobile-nav-drawer"
					aria-label={mobileOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
				>
					{#if mobileOpen}
						<X class="h-5 w-5" aria-hidden="true" />
					{:else}
						<Menu class="h-5 w-5" aria-hidden="true" />
					{/if}
				</button>
			</div>
		</div>

		{#if mobileOpen}
			<nav
				id="mobile-nav-drawer"
				aria-label="Navigasi Seluler"
				class="mt-2.5 flex flex-col gap-1 border-t border-[var(--border-subtle)] pt-2.5 md:hidden"
			>
				<a
					href="#hero"
					onclick={() => (mobileOpen = false)}
					class="flex min-h-[44px] items-center rounded-xl px-3.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--nav-chip)]"
				>
					Home
				</a>
				<a
					href="#showcase"
					onclick={() => (mobileOpen = false)}
					class="flex min-h-[44px] items-center rounded-xl px-3.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--nav-chip)]"
				>
					Horizontal Photo Experience
				</a>
				<a
					href="#gallery"
					onclick={() => (mobileOpen = false)}
					class="flex min-h-[44px] items-center rounded-xl px-3.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--nav-chip)]"
				>
					Photo Gallery
				</a>
				<a
					href="#event-info"
					onclick={() => (mobileOpen = false)}
					class="flex min-h-[44px] items-center rounded-xl px-3.5 text-sm font-semibold text-[var(--ink)] hover:bg-[var(--nav-chip)]"
				>
					Event Information
				</a>
			</nav>
		{/if}
	</div>
</header>
