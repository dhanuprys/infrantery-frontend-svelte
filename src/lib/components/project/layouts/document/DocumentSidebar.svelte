<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import FileIcon from '@lucide/svelte/icons/file';
	import Plus from '@lucide/svelte/icons/plus';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { ComponentProps } from 'svelte';
	import type { NoteResponse } from '$lib/types/api';
	import { Button } from '$lib/components/ui/button';
	import { NoteIcons } from '$lib/data/note-icons';

	let {
		notes = [],
		currentNoteId = null,
		onSelectNote,
		onCreateNote,
		onRenameNote,
		onDeleteNote,
		...restProps
	}: {
		notes: NoteResponse[];
		currentNoteId: string | null;
		onSelectNote: (note: NoteResponse) => void;
		onCreateNote: () => void;
		onRenameNote: (note: NoteResponse) => void;
		onDeleteNote: (note: NoteResponse) => void;
	} & ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Content>
	<Sidebar.Group>
		<div class="flex items-center justify-between px-2">
			<Sidebar.GroupLabel>Notes</Sidebar.GroupLabel>
			<Button variant="ghost" size="icon" class="h-6 w-6" onclick={onCreateNote}>
				<Plus class="h-4 w-4" />
			</Button>
		</div>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#if notes.length === 0}
					<div class="p-4 text-center text-sm text-muted-foreground">
						No notes yet. <br />
						Click + to create one.
					</div>
				{:else}
					{#each notes as note (note.id)}
						{@const Icon = NoteIcons[note.icon || 'file'] || FileIcon}
						<Sidebar.MenuItem>
							<div class="group/item flex w-full items-center">
								<Sidebar.MenuButton
									isActive={note.id === currentNoteId}
									onclick={() => onSelectNote(note)}
									class="flex-1"
								>
									<Icon class="h-4 w-4" />
									<span class="truncate">{note.file_name}</span>
								</Sidebar.MenuButton>

								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button
												variant="ghost"
												size="icon"
												class="h-6 w-6 opacity-0 transition-opacity group-hover/item:opacity-100"
												{...props}
											>
												<MoreHorizontal class="h-3 w-3" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content>
										<DropdownMenu.Item onclick={() => onRenameNote(note)}>
											<Pencil class="mr-2 h-4 w-4" />
											Rename
										</DropdownMenu.Item>
										<DropdownMenu.Item
											onclick={() => onDeleteNote(note)}
											class="text-destructive focus:text-destructive"
										>
											<Trash2 class="mr-2 h-4 w-4" />
											Delete
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</div>
						</Sidebar.MenuItem>
					{/each}
				{/if}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
</Sidebar.Content>
