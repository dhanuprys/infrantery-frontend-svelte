<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { backupService } from '$lib/services/backup.service';
	import { toast } from '$lib/components/ui/sonner';
	import { Upload, Lock, Loader2, FileArchive, X } from '@lucide/svelte';
	import { goto } from '$app/navigation';

	let { open = $bindable(false), onSuccess } = $props();

	let loading = $state(false);
	let password = $state('');
	let error = $state<string | null>(null);
	let selectedFile = $state<File | null>(null);
	let isDragging = $state(false);
	let fileInputEl: HTMLInputElement;

	const isValid = $derived(password.length >= 8 && selectedFile !== null);

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave() {
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			selectFile(files[0]);
		}
	}

	function handleFileInput(e: Event) {
		const input = e.target as HTMLInputElement;
		if (input.files && input.files.length > 0) {
			selectFile(input.files[0]);
		}
	}

	function selectFile(file: File) {
		if (!file.name.endsWith('.infbk')) {
			error = 'Please select a valid backup file (.infbk)';
			return;
		}
		selectedFile = file;
		error = null;
	}

	function clearFile() {
		selectedFile = null;
		if (fileInputEl) fileInputEl.value = '';
	}

	function formatFileSize(bytes: number): string {
		if (bytes < 1024) return bytes + ' B';
		if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
		return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!selectedFile) return;
		loading = true;
		error = null;

		try {
			const result = await backupService.restoreBackup(selectedFile, password);
			const newProject = result.data.project;
			toast.success(`Project "${newProject.name}" restored successfully`);
			open = false;
			resetForm();
			if (onSuccess) onSuccess();
			goto(`/projects/${newProject.id}`);
		} catch (err: any) {
			console.error('Failed to restore backup:', err);
			const code = err.response?.data?.error?.code;
			if (code === 'BACKUP_DECRYPTION_FAILED') {
				error = 'Wrong password. Please check and try again.';
			} else if (code === 'BACKUP_INVALID_FORMAT') {
				error = 'Invalid backup file. The file may be corrupted.';
			} else if (code === 'BACKUP_VERSION_MISMATCH') {
				error = 'This backup was created with an incompatible version.';
			} else if (code === 'BACKUP_TOO_LARGE') {
				error = 'Backup file is too large (max 100 MB).';
			} else {
				error = err.response?.data?.error?.message || 'Restore failed. Please try again.';
			}
			toast.error(error as string);
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		password = '';
		error = null;
		selectedFile = null;
		isDragging = false;
	}
</script>

<Dialog.Root bind:open onOpenChange={() => resetForm()}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Upload class="h-5 w-5 text-primary" />
				Restore from Backup
				<span
					class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400"
					>Beta</span
				>
			</Dialog.Title>
			<Dialog.Description>
				Upload an encrypted backup file to restore a project. A new project will be created with all
				the original data.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<!-- File Drop Zone -->
			<div class="grid gap-2">
				<Label>Backup File</Label>
				{#if selectedFile}
					<div class="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
						<div class="flex items-center gap-3">
							<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
								<FileArchive class="h-5 w-5 text-primary" />
							</div>
							<div>
								<p class="text-sm font-medium">{selectedFile.name}</p>
								<p class="text-xs text-muted-foreground">
									{formatFileSize(selectedFile.size)}
								</p>
							</div>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="h-8 w-8"
							onclick={clearFile}
							disabled={loading}
						>
							<X class="h-4 w-4" />
						</Button>
					</div>
				{:else}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors {isDragging
							? 'border-primary bg-primary/5'
							: 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'}"
						role="button"
						tabindex="0"
						ondragover={handleDragOver}
						ondragleave={handleDragLeave}
						ondrop={handleDrop}
						onclick={() => fileInputEl?.click()}
						onkeydown={(e) => e.key === 'Enter' && fileInputEl?.click()}
					>
						<Upload class="mb-2 h-8 w-8 text-muted-foreground/50" />
						<p class="text-sm font-medium">
							Drop your <code class="rounded bg-muted px-1">.infbk</code> file here
						</p>
						<p class="mt-1 text-xs text-muted-foreground">or click to browse</p>
					</div>
				{/if}
				<input
					bind:this={fileInputEl}
					type="file"
					accept=".infbk"
					class="hidden"
					onchange={handleFileInput}
				/>
			</div>

			<!-- Password -->
			<div class="grid gap-2">
				<Label for="restore-password">Decryption Password</Label>
				<div class="relative">
					<Lock class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						id="restore-password"
						type="password"
						bind:value={password}
						placeholder="Enter the backup password"
						class="pl-9"
						required
						disabled={loading}
					/>
				</div>
				<p class="text-xs text-muted-foreground">
					The same password used when creating the backup.
				</p>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading || !isValid}>
					{#if loading}
						<Loader2 class="mr-2 h-4 w-4 animate-spin" />
						Restoring...
					{:else}
						<Upload class="mr-2 h-4 w-4" />
						Restore Project
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
