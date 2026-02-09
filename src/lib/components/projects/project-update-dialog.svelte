<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { projectService } from '$lib/services/project.service';
	import { toast } from 'svelte-sonner';
	import type { ProjectResponse } from '$lib/types/api';

	let {
		open = $bindable(false),
		project,
		onSuccess
	} = $props<{
		open: boolean;
		project: ProjectResponse | null;
		onSuccess?: () => void;
	}>();

	let loading = $state(false);
	let name = $state('');
	let description = $state('');
	let error = $state<string | null>(null);

	// Pre-fill form when project changes or dialog opens
	$effect(() => {
		if (open && project) {
			name = project.name;
			description = project.description;
			error = null;
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!project) return;

		loading = true;
		error = null;

		try {
			await projectService.updateProject(project.id, {
				name,
				description
			});

			toast.success('Project updated successfully');
			open = false;
			if (onSuccess) onSuccess();
		} catch (err: any) {
			console.error('Failed to update project:', err);
			error = err.response?.data?.error?.message || 'Failed to update project';
			toast.error(error as string);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Edit Project</Dialog.Title>
			<Dialog.Description>Update your project details.</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="edit-name">Project Name</Label>
				<Input id="edit-name" bind:value={name} placeholder="My Secure Project" required />
			</div>

			<div class="grid gap-2">
				<Label for="edit-description">Description (Optional)</Label>
				<Textarea
					id="edit-description"
					bind:value={description}
					placeholder="Project description..."
				/>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading}>
					{loading ? 'Saving...' : 'Save Changes'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
