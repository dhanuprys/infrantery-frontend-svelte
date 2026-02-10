<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';
	import { Label } from '$lib/components/ui/label';
	import { NoteIcons } from '$lib/data/note-icons';
	import { cn } from '$lib/utils';
	import type { NoteResponse } from '$lib/types/api';

	let {
		open = $bindable(false),
		note,
		onsubmit
	} = $props<{
		open: boolean;
		note: NoteResponse | null;
		onsubmit: (name: string, icon: string) => Promise<void>;
	}>();

	let name = $state('');
	let selectedIcon = $state('file');
	let loading = $state(false);

	$effect(() => {
		if (open && note) {
			name = note.file_name;
			selectedIcon = note.icon || 'file';
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name) return;

		loading = true;
		try {
			await onsubmit(name, selectedIcon);
			open = false;
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Edit Note</Dialog.Title>
			<Dialog.Description>Update the name and icon for your note.</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-6 py-4">
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" bind:value={name} required />
			</div>

			<div class="grid gap-2">
				<Label>Icon</Label>
				<ScrollArea class="h-72 w-full rounded-md">
					<div class="grid grid-cols-6 gap-2 pt-4 pr-4">
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
								{#if typeof Icon === 'string'}
									<span class="flex h-5 w-5 items-center justify-center">{Icon}</span>
								{:else}
									<Icon class="h-5 w-5" />
								{/if}
							</button>
						{/each}
					</div>
				</ScrollArea>
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={loading || !name}>
					{loading ? 'Saving...' : 'Save Changes'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
