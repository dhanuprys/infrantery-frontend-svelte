<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { untrack } from 'svelte';

	let { open = $bindable(false), initialName = '', onsubmit } = $props();

	let name = $state(untrack(() => initialName));
	let loading = $state(false);

	$effect(() => {
		if (open) {
			name = initialName;
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name || name === initialName) return;

		loading = true;
		try {
			await onsubmit(name);
			open = false;
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Rename Note</Dialog.Title>
			<Dialog.Description>Enter a new name for your note.</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			<div class="grid grid-cols-4 items-center gap-4">
				<Label for="name" class="text-right">Name</Label>
				<Input id="name" bind:value={name} class="col-span-3" required />
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={loading || !name || name === initialName}>
					{loading ? 'Renaming...' : 'Rename Note'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
