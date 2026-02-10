<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs';
	import ProfileForm from '$lib/components/settings/profile-form.svelte';
	import PasswordForm from '$lib/components/settings/password-form.svelte';

	// Wait, I recall seeing "pageTitle" and "pageDescription" snippets usage in other files or conversations?
	// "Refactor Page Headers" conversation mentioned using snippets.
	// Let's check src/routes/(user)/+page.svelte pattern if strictly needed.
	// For now I will just use standard HTML or copy header pattern if I see one.
	// I'll stick to simple layout first.
</script>

<div class="container mx-auto h-full max-w-7xl space-y-8 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Account & Settings</h2>
			<p class="text-muted-foreground">Manage your account settings and preferences.</p>
		</div>
	</div>

	<Tabs.Root value="profile" class="w-full space-y-6">
		<Tabs.List class="grid w-full grid-cols-2 lg:w-[400px]">
			<Tabs.Trigger value="profile">Profile</Tabs.Trigger>
			<Tabs.Trigger value="security">Security</Tabs.Trigger>
		</Tabs.List>
		<Tabs.Content value="profile" class="space-y-4">
			<ProfileForm />
		</Tabs.Content>
		<Tabs.Content value="security" class="space-y-4">
			<PasswordForm />
		</Tabs.Content>
	</Tabs.Root>
</div>
