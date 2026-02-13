<script lang="ts">
	import { goto } from '$app/navigation';
	import { authService } from '$lib/services/auth.service';
	import { userStore } from '$lib/stores/userStore.svelte';
	import { ChevronsUpDown, LogOutIcon, SettingsIcon } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Button from '$lib/components/ui/button/button.svelte';

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

{#if userStore.user}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			<Button variant="ghost" class="relative ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
				<span class="font-medium mr-2">{userStore.user.name}</span>
                <ChevronsUpDown class="-ml-1 h-4 w-4" />
				<span class="sr-only">Open user menu</span>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content align="end" class="w-56">
			<div class="flex items-center justify-start gap-2 p-2">
				<div class="flex flex-col space-y-1 leading-none">
					<p class="font-medium">{userStore.user.name}</p>
					<p class="text-xs leading-none text-muted-foreground">{userStore.user.email}</p>
				</div>
			</div>
			<DropdownMenu.Separator />
			<DropdownMenu.Item onclick={() => goto('/settings')}>
				<SettingsIcon class="mr-2 h-4 w-4" />
				Settings
			</DropdownMenu.Item>
			<DropdownMenu.Item onclick={handleLogout} class="text-destructive focus:text-destructive cursor-pointer">
				<LogOutIcon class="mr-2 h-4 w-4" />
				<span>Log out</span>
			</DropdownMenu.Item>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{:else}
	<Button variant="ghost" href="/login">Login</Button>
{/if}
