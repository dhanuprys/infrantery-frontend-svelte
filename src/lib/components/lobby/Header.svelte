<script lang="ts" module>
	interface NavigationItem {
		label: string;
		href: string;
	}
	const navigations: NavigationItem[] = [
		{ label: 'Projects', href: '/projects' },
		{ label: 'Join Project', href: '/join' },
		{ label: 'Account & Settings', href: '/settings' }
	];
</script>

<script lang="ts">
	import ModeToggler from '$lib/components/mode-toggler.svelte';
	import Button from '../ui/button/button.svelte';
	import UserDropdown from '$lib/components/user-dropdown.svelte';
	import { afterNavigate } from '$app/navigation';

	let currentPathname = $derived(window.location.pathname);
	afterNavigate(() => {
		currentPathname = window.location.pathname;
	});
</script>

<header class="border-b-2">
	<div class="flex items-center justify-between px-8 py-2">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<h2 class="font-semibold">INFRANTERY</h2>
				<span class="text-xs text-muted-foreground">by DedanLabs</span>
			</div>
		</div>

			<div class="flex items-center gap-2">
				<div class="ml-2">
					<UserDropdown />
				</div>

				<ModeToggler />
			</div>
	</div>
</header>
<nav class="flex items-center border-b px-4 py-2 gap-2">
	{#each navigations as navigation (navigation.href)}
		<Button variant="ghost" href={navigation.href} class="border border-transparent {currentPathname === navigation.href ? 'border-gray-400/80!' : ''}">{navigation.label}</Button>
	{/each}
</nav>
