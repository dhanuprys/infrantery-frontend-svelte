<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import FileIcon from '@lucide/svelte/icons/file';
	import Folder from '@lucide/svelte/icons/folder';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import Plus from '@lucide/svelte/icons/plus';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { ComponentProps } from 'svelte';
	import type { NoteResponse } from '$lib/types/api';
	import { Button } from '$lib/components/ui/button';
	import { NoteIcons } from '$lib/data/note-icons';

	import { type TreeNode, buildNoteTree } from '$lib/utils/tree';

	let {
		notes = [],
		currentNoteId = null,
		onSelectNote,
		onCreateNote,
		onCreateFolder,
		onRenameNote,
		onDeleteNote,
		...restProps
	}: {
		notes: NoteResponse[];
		currentNoteId: string | null;
		onSelectNote: (note: NoteResponse) => void;
		onCreateNote: (parentId?: string) => void;
		onCreateFolder: (parentId?: string) => void;
		onRenameNote: (note: NoteResponse) => void;
		onDeleteNote: (note: NoteResponse) => void;
	} & ComponentProps<typeof Sidebar.Root> = $props();

	// Build tree from flat list
	let tree = $derived.by(() => buildNoteTree(notes));
</script>

{#snippet Tree({ item }: { item: TreeNode })}
	{#if item.type === 'folder'}
		<Sidebar.MenuItem>
			<Collapsible.Root
				class="group/collapsible [&[data-state=open]>div>button>svg:first-child]:rotate-90"
			>
				<div class="flex w-full items-center">
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props} class="w-full justify-start gap-2">
								<ChevronRight class="h-4 w-4 transition-transform" />
								<Folder class="h-4 w-4" />
								<span class="truncate">{item.file_name}</span>
							</Sidebar.MenuButton>
						{/snippet}
					</Collapsible.Trigger>

					<!-- Context Menu for Folder -->
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							{#snippet child({ props })}
								<Button
									variant="ghost"
									size="icon"
									class="ml-auto h-6 w-6 opacity-0 transition-opacity group-hover/collapsible:opacity-100 focus:opacity-100"
									{...props}
								>
									<MoreHorizontal class="h-3 w-3" />
								</Button>
							{/snippet}
						</DropdownMenu.Trigger>
						<DropdownMenu.Content>
							<DropdownMenu.Item onclick={() => onCreateNote(item.id)}>
								<FilePlus class="mr-2 h-4 w-4" />
								New Note
							</DropdownMenu.Item>
							<DropdownMenu.Item onclick={() => onCreateFolder(item.id)}>
								<FolderPlus class="mr-2 h-4 w-4" />
								New Folder
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item onclick={() => onRenameNote(item)}>
								<Pencil class="mr-2 h-4 w-4" />
								Rename
							</DropdownMenu.Item>
							<DropdownMenu.Item
								onclick={() => onDeleteNote(item)}
								class="text-destructive focus:text-destructive"
							>
								<Trash2 class="mr-2 h-4 w-4" />
								Delete
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
				<Collapsible.Content>
					<Sidebar.MenuSub>
						{#each item.children || [] as child (child.id)}
							{@render Tree({ item: child })}
						{/each}
					</Sidebar.MenuSub>
				</Collapsible.Content>
			</Collapsible.Root>
		</Sidebar.MenuItem>
	{:else}
		{@const Icon = NoteIcons[item.icon || 'file'] || FileIcon}
		<Sidebar.MenuItem>
			<div class="group/item flex w-full items-center">
				<Sidebar.MenuButton
					isActive={item.id === currentNoteId}
					onclick={() => onSelectNote(item)}
					class="flex-1 gap-2"
				>
					{#if typeof Icon === 'string'}
						<span class="flex h-4 w-4 items-center justify-center">{Icon}</span>
					{:else}
						<Icon class="h-4 w-4" />
					{/if}
					<span class="truncate">{item.file_name}</span>
				</Sidebar.MenuButton>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Button
								variant="ghost"
								size="icon"
								class="h-6 w-6 opacity-0 transition-opacity group-hover/item:opacity-100 focus:opacity-100"
								{...props}
							>
								<MoreHorizontal class="h-3 w-3" />
							</Button>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item onclick={() => onRenameNote(item)}>
							<Pencil class="mr-2 h-4 w-4" />
							Rename
						</DropdownMenu.Item>
						<DropdownMenu.Item
							onclick={() => onDeleteNote(item)}
							class="text-destructive focus:text-destructive"
						>
							<Trash2 class="mr-2 h-4 w-4" />
							Delete
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</Sidebar.MenuItem>
	{/if}
{/snippet}

<Sidebar.Content>
	<Sidebar.Group>
		<div class="flex items-center justify-between px-2">
			<Sidebar.GroupLabel>Notes</Sidebar.GroupLabel>
			<div class="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6"
					title="New Folder"
					onclick={() => onCreateFolder()}
				>
					<FolderPlus class="h-4 w-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					class="h-6 w-6"
					title="New Note"
					onclick={() => onCreateNote()}
				>
					<FilePlus class="h-4 w-4" />
				</Button>
			</div>
		</div>
		<Sidebar.GroupContent>
			<Sidebar.Menu>
				{#if notes.length === 0}
					<div class="p-4 text-center text-sm text-muted-foreground">
						No notes yet. <br />
						Click + to create one.
					</div>
				{:else}
					{#each tree as item (item.id)}
						{@render Tree({ item })}
					{/each}
				{/if}
			</Sidebar.Menu>
		</Sidebar.GroupContent>
	</Sidebar.Group>
</Sidebar.Content>
