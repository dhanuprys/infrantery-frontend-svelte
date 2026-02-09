<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { NoteIcons } from '$lib/data/note-icons';
	import { cn } from '$lib/utils';

	let { open = $bindable(false), onsubmit } = $props();

	let name = $state('');
	let selectedIcon = $state('file');
	let loading = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name) return;

		loading = true;
		try {
			await onsubmit(name, selectedIcon);
			open = false;
			name = '';
			selectedIcon = 'file';
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Create New Note</Dialog.Title>
			<Dialog.Description>Enter a name and select an icon for your new note.</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} placeholder="e.g. Project Plan" required />
			</div>

			<div class="grid gap-2">
				<Label>Icon</Label>
				<div class="grid grid-cols-6 gap-2">
					{#each Object.entries(NoteIcons) as [key, Icon]}
						<button
							type="button"
							class={cn(
								'flex h-10 w-10 items-center justify-center rounded-md border text-muted-foreground transition-all hover:bg-accent hover:text-accent-foreground',
								selectedIcon === key &&
									'border-primary bg-primary/10 text-primary hover:bg-primary/20'
							)}
							onclick={() => (selectedIcon = key)}
							title={key}
						>
							<Icon class="h-5 w-5" />
						</button>
					{/each}
				</div>
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={loading || !name}>
					{loading ? 'Creating...' : 'Create Note'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
