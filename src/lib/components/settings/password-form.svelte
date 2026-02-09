<script lang="ts">
	import { authService } from '$lib/services/auth.service';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import * as Card from '$lib/components/ui/card';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/userStore.svelte';

	let loading = $state(false);
	let error = $state<string | null>(null);
	let success = $state<string | null>(null);

	let formData = $state({
		old_password: '',
		new_password: '',
		confirm_password: ''
	});

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = null;
		success = null;

		if (formData.new_password !== formData.confirm_password) {
			error = 'New passwords do not match';
			loading = false;
			return;
		}

		try {
			await authService.changePassword({
				current_password: formData.old_password,
				new_password: formData.new_password
			});
			success = 'Password changed successfully. Redirecting to login...';

			// Logout after password change
			setTimeout(async () => {
				await authService.logout();
				userStore.clearUser();
				goto('/login');
			}, 2000);
		} catch (err: any) {
			console.error('Change password error:', err);
			error = err.response?.data?.error?.message || 'Failed to change password';
			loading = false; // Only stop loading on error, keep it for redirect on success
		}
	}
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Security</Card.Title>
		<Card.Description>Manage your password and security settings.</Card.Description>
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
				<Label for="old_password">Current Password</Label>
				<Input id="old_password" type="password" bind:value={formData.old_password} required />
			</div>

			<div class="space-y-2">
				<Label for="new_password">New Password</Label>
				<Input
					id="new_password"
					type="password"
					bind:value={formData.new_password}
					required
					minlength={8}
				/>
			</div>

			<div class="space-y-2">
				<Label for="confirm_password">Confirm New Password</Label>
				<Input
					id="confirm_password"
					type="password"
					bind:value={formData.confirm_password}
					required
					minlength={8}
				/>
			</div>

			<div class="flex justify-end">
				<Button type="submit" variant="destructive" disabled={loading}>
					{loading ? 'Processing...' : 'Change Password'}
				</Button>
			</div>
		</form>
	</Card.Content>
</Card.Root>
