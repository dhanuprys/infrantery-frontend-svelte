<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { backupService } from '$lib/services/backup.service';
	import { toast } from '$lib/components/ui/sonner';
	import { Download, Lock, Loader2, CheckCircle2 } from '@lucide/svelte';

	let { open = $bindable(false), projectId, projectName = 'project' } = $props();

	let loading = $state(false);
	let password = $state('');
	let error = $state<string | null>(null);
	let success = $state(false);

	const isValid = $derived(password.length >= 8);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = null;
		success = false;

		try {
			await backupService.createBackup(projectId, password);
			success = true;
			toast.success('Backup downloaded successfully');
			setTimeout(() => {
				open = false;
				resetForm();
			}, 1500);
		} catch (err: any) {
			console.error('Failed to create backup:', err);
			// When responseType is 'blob', error responses are also blobs —
			// parse them back to JSON to extract the real error message.
			let msg = 'Failed to create backup. Please try again.';
			try {
				const blob = err.response?.data;
				if (blob instanceof Blob) {
					const text = await blob.text();
					const parsed = JSON.parse(text);
					msg = parsed?.error?.message || msg;
				} else if (err.response?.data?.error?.message) {
					msg = err.response.data.error.message;
				}
			} catch {
				// Parsing failed — use generic message
			}
			error = msg;
			toast.error(msg);
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		password = '';
		error = null;
		success = false;
	}
</script>

<Dialog.Root bind:open onOpenChange={() => resetForm()}>
	<Dialog.Content class="sm:max-w-[450px]">
		<Dialog.Header>
			<Dialog.Title class="flex items-center gap-2">
				<Download class="h-5 w-5 text-primary" />
				Backup Project
				<span
					class="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-amber-600 uppercase dark:text-amber-400"
					>Beta</span
				>
			</Dialog.Title>
			<Dialog.Description>
				Create an encrypted backup of <strong>{projectName}</strong>. The backup file will contain
				all diagrams, nodes, vaults, and notes.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			{#if success}
				<div
					class="flex items-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400"
				>
					<CheckCircle2 class="h-4 w-4" />
					Backup downloaded successfully!
				</div>
			{:else}
				<div class="grid gap-2">
					<Label for="backup-password">Encryption Password</Label>
					<div class="relative">
						<Lock class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							id="backup-password"
							type="password"
							bind:value={password}
							placeholder="Min. 8 characters"
							class="pl-9"
							required
							disabled={loading}
						/>
					</div>
					<p class="text-xs text-muted-foreground">
						This password encrypts the backup file. You'll need it to restore. <strong
							class="text-amber-600 dark:text-amber-400"
							>Remember this password — it cannot be recovered.</strong
						>
					</p>
				</div>
			{/if}

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				{#if !success}
					<Button type="submit" disabled={loading || !isValid}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Creating Backup...
						{:else}
							<Download class="mr-2 h-4 w-4" />
							Download Backup
						{/if}
					</Button>
				{/if}
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
