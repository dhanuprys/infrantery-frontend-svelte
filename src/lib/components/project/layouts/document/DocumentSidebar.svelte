<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import FileIcon from '@lucide/svelte/icons/file';
	import Folder from '@lucide/svelte/icons/folder';
	import FolderPlus from '@lucide/svelte/icons/folder-plus';
	import FilePlus from '@lucide/svelte/icons/file-plus';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import type { ComponentProps } from 'svelte';
	import type { NoteResponse } from '$lib/types/api';
	import { Button } from '$lib/components/ui/button';
	import { NoteIcons } from '$lib/data/note-icons';

	import { type TreeNode, buildNoteTree } from '$lib/utils/tree';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

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
			<Collapsible.Root class="group/collapsible [&[data-state=open]>div>button>.dd]:rotate-90">
				<div class="flex w-full items-center">
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton {...props} class="w-full justify-start gap-2">
								<ChevronRight class="dd h-4 w-4 transition-transform" />
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
					{#if item.children && item.children.length > 0}
						<Sidebar.MenuSub class="mr-0! pr-0!">
							{#each item.children as child (child.id)}
								{@render Tree({ item: child })}
							{/each}
						</Sidebar.MenuSub>
					{:else}
						<Sidebar.MenuSub class="mr-0! pr-0! pl-6 text-secondary!">No item</Sidebar.MenuSub>
					{/if}
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

<Sidebar.Content class="flex h-full">
	<Sidebar.Group class="flex h-full p-0!">
		<div class="flex items-center justify-between border-b px-4">
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
		<div class="relative flex-1">
			<div class="absolute inset-0">
				<ScrollArea class="h-full">
					<Sidebar.GroupContent class="pr-3 pl-2">
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
				</ScrollArea>
			</div>
		</div>
	</Sidebar.Group>
</Sidebar.Content>
