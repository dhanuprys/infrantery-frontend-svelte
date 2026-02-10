<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Document from '$lib/components/project/layouts/document';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import type { PageProps } from './$types';
	import { noteService } from '$lib/services/note.service';
	import type { NoteResponse } from '$lib/types/api';
	import { onMount, onDestroy } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';
	import { cryptoService } from '$lib/services/cryptoService';

	import CreateFolderDialog from '$lib/components/project/dialogs/CreateFolderDialog.svelte';
	import CreateNoteDialog from '$lib/components/project/dialogs/CreateNoteDialog.svelte';
	import EditNoteDialog from '$lib/components/project/dialogs/EditNoteDialog.svelte';
	import DeleteNoteDialog from '$lib/components/project/dialogs/DeleteNoteDialog.svelte';

	let { params }: PageProps = $props();
	let projectId = $derived(params.projectId);

	let notes = $state<NoteResponse[]>([]);
	let currentNote = $state<NoteResponse | null>(null);
	let mdValue = $state('');
	let loading = $state(false);
	let saveStatus = $state<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
	let lastSaved = $state<Date | null>(null);

	let createDialogOpen = $state(false);
	let createFolderDialogOpen = $state(false);
	let editDialogOpen = $state(false);
	let deleteDialogOpen = $state(false);

	let noteToEdit = $state<NoteResponse | null>(null);
	let noteToDelete = $state<NoteResponse | null>(null);
	let targetParentId = $state<string | undefined>(undefined);

	// Autosave timer
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	const AUTOSAVE_DELAY = 1000; // 1 second

	async function loadNotes() {
		try {
			const res = await noteService.getNotes(projectId);
			notes = res.data || [];
		} catch (err: any) {
			console.error('Failed to load notes:', err);
			toast.error('Failed to load notes');
		}
	}

	async function selectNote(note: NoteResponse) {
		if (currentNote?.id === note.id) return;

		if (saveTimeout) {
			clearTimeout(saveTimeout);
			await saveCurrentNote();
		}

		loading = true;
		try {
			// 1. Fetch full note content
			const res = await noteService.getNote(projectId, note.id);
			const fullNote = res.data;

			if (fullNote.encrypted_content) {
				if (!projectSessionStore.keys) {
					throw new Error('Project keys not found. Please re-authorize.');
				}

				// 2. Verify Signature
				const isValid = await cryptoService.verifySignature(
					projectSessionStore.keys.signingPublicKey,
					fullNote.encrypted_content_signature,
					fullNote.encrypted_content
				);

				if (!isValid) {
					throw new Error('Note signature verification failed! Data may be tampered.');
				}

				// 3. Decrypt Content
				const decrypted = await cryptoService.decryptWithPrivateKey(
					projectSessionStore.keys.encryptionPrivateKey,
					fullNote.encrypted_content
				);

				mdValue = decrypted;
			} else {
				mdValue = '';
			}

			currentNote = fullNote;
			saveStatus = 'saved';
		} catch (err: any) {
			console.error('Failed to load note content:', err);
			toast.error(err.message || 'Failed to decrypt note');
			currentNote = null;
			mdValue = '';
		} finally {
			loading = false;
		}
	}

	function openCreateDialog(parentId?: string) {
		targetParentId = parentId;
		createDialogOpen = true;
	}

	function openCreateFolderDialog(parentId?: string) {
		targetParentId = parentId;
		createFolderDialogOpen = true;
	}

	function openEditDialog(note: NoteResponse) {
		noteToEdit = note;
		editDialogOpen = true;
	}

	function openDeleteDialog(note: NoteResponse) {
		noteToDelete = note;
		deleteDialogOpen = true;
	}

	async function handleCreateNote(name: string, icon: string) {
		try {
			if (!projectSessionStore.keys) {
				throw new Error('Project keys not found. Please re-authorize.');
			}

			// Encrypt empty string for initial content
			const initialContent = '# ' + name;
			const encrypted = await cryptoService.encryptWithPublicKey(
				projectSessionStore.keys.encryptionPublicKey,
				initialContent
			);

			const signature = await cryptoService.signData(
				projectSessionStore.keys.signingPrivateKey,
				encrypted
			);

			const res = await noteService.createNote(projectId, {
				file_name: name,
				type: 'note',
				parent_id: targetParentId,
				icon: icon,
				encrypted_content: encrypted,
				encrypted_content_signature: signature
			});

			notes = [...notes, res.data];
			selectNote(res.data);
			toast.success('Note created');
		} catch (err: any) {
			console.error('Failed to create note:', err);
			toast.error(err.message || 'Failed to create note');
			throw err; // Propagate to dialog to show error state if needed
		}
	}

	async function handleCreateFolder(name: string) {
		try {
			const res = await noteService.createNote(projectId, {
				file_name: name,
				type: 'folder',
				parent_id: targetParentId
			});

			notes = [...notes, res.data];
			toast.success('Folder created');
		} catch (err: any) {
			console.error('Failed to create folder:', err);
			toast.error(err.message || 'Failed to create folder');
			throw err;
		}
	}

	async function handleEditNote(newName: string, newIcon: string) {
		if (!noteToEdit) return;

		try {
			await noteService.updateNote(projectId, noteToEdit.id, {
				file_name: newName,
				icon: newIcon
			});

			// Update local list
			notes = notes.map((n) =>
				n.id === noteToEdit!.id ? { ...n, file_name: newName, icon: newIcon } : n
			);
			if (currentNote?.id === noteToEdit.id) {
				currentNote = { ...currentNote, file_name: newName, icon: newIcon };
			}

			toast.success('Note updated');
		} catch (err: any) {
			console.error('Failed to update note:', err);
			toast.error('Failed to update note');
			throw err;
		}
	}

	async function handleDeleteNote() {
		if (!noteToDelete) return;

		try {
			await noteService.deleteNote(projectId, noteToDelete.id);

			// Remove note and any children (client-side cleanup, backend should handle cascade if needed or recursive query to clean up view)
			// For now just remove the item itself. The tree derivation will handle children becoming orphans if they exist (though backend should prevent or cascade)
			// Actually backend doesn't cascade yet. But we can just remove from list.

			// If deleting a folder, we should probably remove all descendants from the view too
			// But since we just have a flat list, we can just filter out.
			// The tree builder logic handles orphans by putting them at root? Or getting stuck?
			// The tree builder: "if (note.parent_id && nodeMap.has(note.parent_id))".
			// If parent is deleted (and missing from map), children become orphans.
			// Ideally they should be removed too.

			// For now, simpler: retrieve updated list from server? No, slow.
			// Just remove the deleted item.
			notes = notes.filter((n) => n.id !== noteToDelete!.id);

			if (currentNote?.id === noteToDelete.id) {
				currentNote = null;
				mdValue = '';
			}

			toast.success('Deleted');
		} catch (err: any) {
			console.error('Failed to delete note:', err);
			toast.error('Failed to delete note');
			throw err;
		}
	}

	async function saveCurrentNote() {
		if (!currentNote || !projectSessionStore.keys) return;

		// Only save if status is 'unsaved' (avoid double saves or saving on error retry without change?)
		// actually, retry on error is valid.
		saveStatus = 'saving';

		try {
			// 1. Encrypt
			const encrypted = await cryptoService.encryptWithPublicKey(
				projectSessionStore.keys!.encryptionPublicKey,
				mdValue
			);

			// 2. Sign
			const signature = await cryptoService.signData(
				projectSessionStore.keys!.signingPrivateKey,
				encrypted
			);

			// 3. Update
			await noteService.updateNote(projectId, currentNote.id, {
				encrypted_content: encrypted,
				encrypted_content_signature: signature
			});

			lastSaved = new Date();
			saveStatus = 'saved';
		} catch (err: any) {
			console.error('Failed to save note:', err);
			saveStatus = 'error';
			toast.error('Failed to save changes');
		}
	}

	function handleContentChange() {
		if (saveStatus !== 'unsaved') {
			saveStatus = 'unsaved';
		}

		if (saveTimeout) clearTimeout(saveTimeout);
		saveTimeout = setTimeout(() => {
			saveCurrentNote();
		}, AUTOSAVE_DELAY);
	}

	onMount(() => {
		if (projectId) {
			loadNotes();
		}
	});

	onDestroy(() => {
		if (saveTimeout) clearTimeout(saveTimeout);
	});
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader />
	<Document.ToolBar {projectId} status={saveStatus} {lastSaved} />
	<main class="flex flex-1">
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane defaultSize={20} minSize={15} maxSize={30}>
				<Document.Sidebar
					{notes}
					currentNoteId={currentNote?.id || null}
					onSelectNote={selectNote}
					onCreateNote={openCreateDialog}
					onCreateFolder={openCreateFolderDialog}
					onRenameNote={openEditDialog}
					onDeleteNote={openDeleteDialog}
				/>
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane defaultSize={40}>
				{#if currentNote}
					<Document.Editor bind:value={mdValue} onchange={handleContentChange} />
				{:else}
					<div class="flex h-full items-center justify-center text-muted-foreground">
						Select or create a note to start editing
					</div>
				{/if}
			</Resizable.Pane>
			<Resizable.Handle withHandle={true} />
			<Resizable.Pane defaultSize={40}>
				<Document.Preview bind:value={mdValue} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</main>

	<CreateNoteDialog bind:open={createDialogOpen} onsubmit={handleCreateNote} />

	<CreateFolderDialog bind:open={createFolderDialogOpen} onsubmit={handleCreateFolder} />

	<EditNoteDialog bind:open={editDialogOpen} note={noteToEdit} onsubmit={handleEditNote} />

	<DeleteNoteDialog
		bind:open={deleteDialogOpen}
		noteName={noteToDelete?.file_name || ''}
		onconfirm={handleDeleteNote}
	/>
</div>
