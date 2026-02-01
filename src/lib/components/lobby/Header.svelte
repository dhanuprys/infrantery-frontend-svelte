<script lang="ts" module>
	interface NavigationItem {
		label: string;
		href: string;
	}
	const navigations: NavigationItem[] = [
		{ label: 'Dashboard', href: '/' },
		{ label: 'Projects', href: '/project' },
		{ label: 'Account & Settings', href: '/setting' }
	];
</script>

<script lang="ts">
	import ModeToggler from '$lib/components/mode-toggler.svelte';
	import Button from '../ui/button/button.svelte';
</script>

<header class="border-b-2">
	<div class="flex items-center justify-between px-8 py-2">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<h2 class="font-semibold">INFRANTERY</h2>
				<span class="text-xs text-muted-foreground">by DedanLabs</span>
			</div>
		</div>

		<div>
			<ModeToggler />
		</div>
	</div>
</header>
<nav class="flex items-center border-b px-4 py-2">
	{#each navigations as navigation (navigation.href)}
		<Button variant="ghost" href={navigation.href}>{navigation.label}</Button>
	{/each}
</nav>
