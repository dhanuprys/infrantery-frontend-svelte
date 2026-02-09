<script lang="ts">
	import { authService } from '$lib/services/auth.service';
	import { userStore } from '$lib/stores/userStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Card from '$lib/components/ui/card';
	// Assuming toaster is available via sonner or similar, if not I'll add simple alert for now
	// import { toast } from "svelte-sonner";

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	let formData = $state({
		name: userStore.user?.name || '',
		username: userStore.user?.username || '',
		email: userStore.user?.email || ''
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = null;
		success = null;

		try {
			const res = await authService.updateProfile(formData);
			userStore.setUser(res.data);
			success = 'Profile updated successfully';
		} catch (err: any) {
			console.error('Update profile error:', err);
			error = err.response?.data?.error?.message || 'Failed to update profile';
		} finally {
			loading = false;
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Profile</Card.Title>
		<Card.Description>Update your personal information.</Card.Description>
	</Card.Header>
	<Card.Content>
		<form onsubmit={handleSubmit} class="space-y-4">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}
			{#if success}
				<div class="rounded-md bg-green-500/15 p-3 text-sm text-green-600">
					{success}
				</div>
			{/if}

			<div class="space-y-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={formData.name} placeholder="Your name" required />
			</div>

			<div class="space-y-2">
				<Label for="username">Username</Label>
				<Input id="username" bind:value={formData.username} placeholder="username" required />
			</div>

			<div class="space-y-2">
				<Label for="email">Email</Label>
				<Input
					id="email"
					type="email"
					bind:value={formData.email}
					placeholder="email@example.com"
					required
				/>
			</div>

			<div class="flex justify-end">
				<Button type="submit" disabled={loading}>
					{loading ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
