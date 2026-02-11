<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Card from '$lib/components/ui/card';
	import { ProjectSessionKeys } from '$lib/data/project-session-keys';
	import { cryptoService } from '$lib/services/cryptoService';
	import { projectService } from '$lib/services/project.service';
	import secureKeyringSession, { type Keyring } from '$lib/services/secureKeyringSession';
	import type { ProjectDetailResponse } from '$lib/types/api';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import type { PageProps } from './$types';
	import { ShieldCheck, Lock, Loader2, KeyRound, ArrowLeftIcon } from '@lucide/svelte';

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
			if (!project.keyrings || project.keyrings.length === 0) {
				error = 'No keyrings found for project';
				return;
			}

			const currentProjectKeyring = project.keyrings.find(
				(keyring) => keyring.epoch === project?.key_epoch
			);

			if (!currentProjectKeyring) {
				error = 'No keyring found for project';
				return;
			}

			// 1. Decrypt Private Keys with Master Password
			const userPrivateKey = await cryptoService.decryptWithPassphrase(
				password,
				cryptoService.parseEncryptedData(project.user_encrypted_private_key)
			);

			const translatedKeyrings: Keyring[] = [];

			for (const keyring of project.keyrings) {
				// decrypt passphrase
				const passphrase = await cryptoService.decryptWithPrivateKey(
					userPrivateKey,
					keyring.secret_passphrase
				);
				const signingPrivateKey = await cryptoService.decryptWithPrivateKey(
					userPrivateKey,
					keyring.secret_signing_private_key
				);

				translatedKeyrings.push({
					epoch: keyring.epoch,
					passphrase,
					signing_public_key: keyring.signing_public_key,
					signing_private_key: signingPrivateKey
				});
			}
			// 2. Store Keys in Secure Session
			await secureKeyringSession.setEpoch(projectId, project.key_epoch);
			await secureKeyringSession.setItem(projectId, translatedKeyrings);

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

<div class="relative flex min-h-screen w-full items-center justify-center bg-background p-4">
	<header class="absolute top-0 right-0 left-0 flex items-center justify-between p-6">
		<Button variant="ghost" onclick={() => goto('/projects')}
			><ArrowLeftIcon class="mr-2 h-4 w-4" />
			Back to Projects
		</Button>
	</header>
	<div class="w-full max-w-lg">
		<div class="mb-8 text-center">
			<h1 class="text-2xl font-bold tracking-tight">Project Authorization</h1>
			<p class="mt-2 text-muted-foreground">Secure access to your encrypted project data</p>
		</div>

		<Card.Root class="border-border/50 shadow-lg">
			<Card.Header>
				<Card.Title>Unlock Project</Card.Title>
				<Card.Description>
					{#if project}
						Enter the master password for <span class="font-semibold text-foreground"
							>{project.name}</span
						>
					{:else if loading}
						Loading project details...
					{/if}
				</Card.Description>
			</Card.Header>
			<Card.Content>
				<form onsubmit={handleAuthorize} class="space-y-4">
					{#if error}
						<div class="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
							{error}
						</div>
					{/if}

					<div class="space-y-2">
						<Label for="password">Master Password</Label>
						<div class="relative">
							<KeyRound class="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
							<Input
								id="password"
								type="password"
								bind:value={password}
								placeholder="Enter your project master password"
								required
								disabled={authLoading || loading}
								class="pl-9"
							/>
						</div>
					</div>

					<Button
						type="submit"
						variant="destructive"
						class="w-full"
						disabled={authLoading || loading || !project}
					>
						{#if authLoading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Unlocking...
						{:else}
							Unlock Project
						{/if}
					</Button>
				</form>
			</Card.Content>
			<Card.Footer class="flex flex-col gap-4 border-t bg-muted/20 px-6 py-4">
				<div
					class="flex items-start gap-3 rounded-md border bg-background/50 p-3 text-sm text-muted-foreground"
				>
					<ShieldCheck class="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
					<div class="space-y-1">
						<p class="font-medium text-foreground">Zero-Knowledge Security</p>
						<p class="text-xs leading-relaxed">
							Your master password is used to decrypt your project keys locally in your browser. <strong
								class="font-semibold text-foreground">It is never sent to our servers.</strong
							>
						</p>
					</div>
				</div>
			</Card.Footer>
		</Card.Root>
	</div>
</div>
