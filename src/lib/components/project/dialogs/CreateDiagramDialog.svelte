<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';

	let { open = $bindable(false), onsubmit } = $props();

	let name = $state('');
	let description = $state('');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name) return;

		loading = true;
		try {
			await onsubmit(name, description);
			open = false;
			name = '';
			description = '';
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create New Diagram</Dialog.Title>
			<Dialog.Description>
				Enter a name and description for your new architecture diagram.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} placeholder="e.g. Microservices Architecture" required />
			</div>

			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					bind:value={description}
					placeholder="Briefly describe the purpose of this diagram..."
				/>
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={loading || !name}>
					{loading ? 'Creating...' : 'Create Diagram'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
