<script lang="ts" module>
	interface NavigationItem {
		label: string;
		href: string;
	}
	const navigations: NavigationItem[] = [
		{ label: 'Dashboard', href: '/' },
		{ label: 'Projects', href: '/projects' },
		{ label: 'Account & Settings', href: '/settings' }
	];
</script>

<script lang="ts">
	import ModeToggler from '$lib/components/mode-toggler.svelte';
	import Button from '../ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { authService } from '$lib/services/auth.service';
	import { userStore } from '$lib/stores/userStore.svelte';

	async function handleLogout() {
		try {
			await authService.logout();
			userStore.clearUser();
			goto('/login');
		} catch (error) {
			console.error('Logout failed:', error);
			// Even if backend fails, clear local state
			userStore.clearUser();
			goto('/login');
		}
	}
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
			<Button variant="ghost" onclick={handleLogout}>Logout</Button>
			<ModeToggler />
		</div>
	</div>
</header>
<nav class="flex items-center border-b px-4 py-2">
	{#each navigations as navigation (navigation.href)}
		<Button variant="ghost" href={navigation.href}>{navigation.label}</Button>
	{/each}
</nav>
