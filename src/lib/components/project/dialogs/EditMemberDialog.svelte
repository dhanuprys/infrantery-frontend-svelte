<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { projectService } from '$lib/services/project.service';
	import { toast } from '$lib/components/ui/sonner';
	import { Loader2 } from '@lucide/svelte';
	import type { ProjectMemberResponse } from '$lib/types/api';

	let { open = $bindable(false), projectId, member, onSuccess } = $props<{
		open: boolean;
		projectId: string;
		member: ProjectMemberResponse | null;
		onSuccess?: () => void;
	}>();

	let loading = $state(false);
	let role = $state({ value: 'member', label: 'Member' });

	// map member role to state when dialog opens
	$effect(() => {
		if (member && open) {
			const found = roles.find(r => r.value === member.role);
			if (found) role = found;
		}
	});

	const roles = [
		{ value: 'admin', label: 'Admin (Full Access)' },
		{ value: 'member', label: 'Member (Edit)' },
		{ value: 'viewer', label: 'Viewer (Read Only)' }
	];

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!member) return;
		loading = true;

		try {
			await projectService.updateMember(projectId, member.user_id, {
				role: role.value,
				permissions: [] // Default permissions handled by backend
			});
			if (onSuccess) onSuccess();
			open = false;
			toast.success('Member updated successfully');
		} catch (err: any) {
			console.error('Failed to update member:', err);
			toast.error(err.response?.data?.error?.message || 'Failed to update member');
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Member</Dialog.Title>
			<Dialog.Description>
				Change the role for {member?.user_name}.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label>Role</Label>
				<Select.Root type="single" bind:value={role.value}>
					<Select.Trigger>
						{roles.find(r => r.value === role.value)?.label ?? 'Select a role'}
					</Select.Trigger>
					<Select.Content>
						{#each roles as r}
							<Select.Item value={r.value} label={r.label}>{r.label}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
			
			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => open = false}>Cancel</Button>
				<Button type="submit" disabled={loading}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						Save Changes
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
