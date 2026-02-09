<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ProjectSessionKeys } from '$lib/data/project-session-keys';
	import { cryptoService } from '$lib/services/cryptoService';
	import { projectService } from '$lib/services/project.service';
	import secureProjectSession from '$lib/services/secureProjectSession';
	import type { ProjectDetailResponse } from '$lib/types/api';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';

	let { params }: PageProps = $props();
	let projectId = $derived(params.projectId);

	let project = $state<ProjectDetailResponse | null>(null);
	let password = $state('');
	let loading = $state(false);
	let authLoading = $state(false);
	let error = $state<string | null>(null);

	async function loadProject() {
		loading = true;
		try {
			// Request project with secrets for authorization
			const res = await projectService.getProject(projectId, true);
			project = res.data;
		} catch (err: any) {
			console.error('Failed to load project:', err);
			error = err.message || 'Failed to load project details';
			toast.error(error!);
		} finally {
			loading = false;
		}
	}

	async function handleAuthorize(e: Event) {
		e.preventDefault();
		if (!project) return;

		authLoading = true;
		error = null;

		try {
			// 1. Decrypt Private Keys with Master Password
			const encPrivateKey = await cryptoService.decryptWithPassphrase(
				password,
				cryptoService.parseEncryptedData(project.secret_encrypted_private_key)
			);

			const signPrivateKey = await cryptoService.decryptWithPassphrase(
				password,
				cryptoService.parseEncryptedData(project.secret_signing_private_key)
			);

			// 2. Store Keys in Secure Session
			await secureProjectSession.setItem(
				ProjectSessionKeys.ENCRYPTION_PRIVATE_KEY,
				projectId,
				encPrivateKey
			);
			await secureProjectSession.setItem(
				ProjectSessionKeys.ENCRYPTION_PUBLIC_KEY,
				projectId,
				project.encryption_public_key
			);
			await secureProjectSession.setItem(
				ProjectSessionKeys.SIGNING_PRIVATE_KEY,
				projectId,
				signPrivateKey
			);
			await secureProjectSession.setItem(
				ProjectSessionKeys.SIGNING_PUBLIC_KEY,
				projectId,
				project.signing_public_key
			);

			toast.success('Project authorized successfully');
			goto(`/projects/${projectId}`);
		} catch (err: any) {
			console.error('Authorization failed:', err);
			error = 'Invalid password or decryption failed';
			toast.error(error);
		} finally {
			authLoading = false;
		}
	}

	onMount(() => {
		if (projectId) {
			loadProject();
		}
	});
</script>

<div class="flex min-h-screen w-full items-center justify-center bg-background p-4">
	<div class="w-full max-w-md space-y-8">
		<div class="text-center">
			<h1 class="text-2xl font-bold tracking-tight">Authorize Project</h1>
			{#if project}
				<p class="mt-2 text-muted-foreground">
					Enter master password for <span class="font-medium text-foreground">{project.name}</span>
				</p>
			{:else if loading}
				<p class="mt-2 text-muted-foreground">Loading project details...</p>
			{/if}
		</div>

		<form onsubmit={handleAuthorize} class="space-y-6">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="password">Master Password</Label>
				<Input
					id="password"
					type="password"
					bind:value={password}
					placeholder="Enter your project master password"
					required
					disabled={authLoading || loading}
				/>
			</div>

			<Button type="submit" class="w-full" disabled={authLoading || loading || !project}>
				{authLoading ? 'Authorizing...' : 'Unlock Project'}
			</Button>
		</form>
	</div>
</div>
