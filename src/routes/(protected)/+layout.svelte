<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/services/auth.service';
	import secureProjectSession from '$lib/services/secureProjectSession';
	import { userStore } from '$lib/stores/userStore.svelte';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(async () => {
		try {
			const profile = await authService.getProfile();
			userStore.setUser(profile.data);
		} catch (error) {
			console.error('Failed to load profile', error);
			userStore.clearUser();
			secureProjectSession.lockProjects();
			goto('/login');
		}
	});
</script>

{#if userStore.loading}
	<div class="flex h-screen w-full items-center justify-center">
		<div class="text-muted-foreground">Loading...</div>
	</div>
{:else}
	{@render children()}
{/if}
