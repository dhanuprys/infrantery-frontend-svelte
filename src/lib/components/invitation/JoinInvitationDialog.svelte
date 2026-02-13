<script lang="ts">
	import { goto } from '$app/navigation';
	import type { InvitationResponse } from '$lib/types/api';
	import { invitationService } from '$lib/services/invitation.service';
	import { cryptoService } from '$lib/services/cryptoService';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { toast } from '$lib/components/ui/sonner';
	import { Loader2, ShieldCheck, Lock, ArrowRight, ArrowLeft } from '@lucide/svelte';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Badge } from '$lib/components/ui/badge';
	import type { Keyring } from '$lib/services/secureKeyringSession';

	let { open = $bindable(false), initialInvitationId = '', onSuccess } = $props<{
		open: boolean;
		initialInvitationId?: string;
		onSuccess?: () => void;
	}>();

	let loading = $state(false);
	let joining = $state(false);
	let invitation = $state<InvitationResponse | null>(null);
	let error = $state<string | null>(null);

	// Step 1 input
	let invitationId = $derived(initialInvitationId);

	// Step 2 inputs
	let invitationPassword = $state('');
	let masterPassword = $state('');

	// Validations
	const validations = $derived({
		length: masterPassword.length >= 8,
		uppercase: /[A-Z]/.test(masterPassword),
		lowercase: /[a-z]/.test(masterPassword),
		number: /[0-9]/.test(masterPassword),
		special: /[^A-Za-z0-9]/.test(masterPassword)
	});
	const isValid = $derived(Object.values(validations).every(Boolean) && invitationPassword.length > 0);

	// Reset state when dialog opens/closes or initial ID changes
	$effect(() => {
		if (open) {
			if (initialInvitationId) {
				invitationId = initialInvitationId;
				findInvitation(); // Auto-fetch if ID provided
			} else {
				resetStep();
			}
		}
	});

	async function findInvitation() {
		if (!invitationId) return;
		loading = true;
		error = null;
		
		try {
			const res = await invitationService.getInvitation(invitationId);
			invitation = res.data;
		} catch (err: any) {
			console.error('Failed to load invitation:', err);
			error = err.response?.data?.error?.message || 'Failed to find invitation. Please check the ID.';
			invitation = null;
		} finally {
			loading = false;
		}
	}

	async function handleJoin() {
		if (!invitation || !isValid) return;
		joining = true;

		try {
			// 1. Decrypt invitation keyrings with exchange password
			let keyrings: Keyring[];
			try {
				const decryptedKeyringsJson = await cryptoService.decryptWithPassphrase(
					invitationPassword,
					cryptoService.parseEncryptedData(invitation.encrypted_keyrings)
				);
				keyrings = JSON.parse(decryptedKeyringsJson);
			} catch (err) {
				throw new Error('Invalid invitation password. Could not decrypt project keys.');
			}

			// 2. Generate new User Keys (Encryption & Signing)
			const userEncKeys = await cryptoService.generateEncryptionKeys();
			
			// 3. Encrypt User Private Key with Master Password
			const encryptedUserPrivateKey = await cryptoService.encryptWithPassphrase(
				masterPassword,
				userEncKeys.privateKey
			);
			const formattedUserPrivateKey = cryptoService.formatEncryptedData(encryptedUserPrivateKey);

			// 4. Re-encrypt Shared Secrets for each keyring
			const reEncryptedKeyrings = await Promise.all(keyrings.map(async (k) => {
				const secretPassphrase = await cryptoService.encryptWithPublicKey(
					userEncKeys.publicKey,
					k.passphrase
				);
				const secretSigningKey = await cryptoService.encryptWithPublicKey(
					userEncKeys.publicKey,
					k.signing_private_key
				);
				
				return {
					epoch: k.epoch,
					secret_passphrase: secretPassphrase,
					secret_signing_private_key: secretSigningKey,
					signing_public_key: k.signing_public_key
				};
			}));

			// 5. Submit Acceptance
			const res = await invitationService.acceptInvitation(invitation.id, {
				keyrings: reEncryptedKeyrings,
				public_key: userEncKeys.publicKey,
				encrypted_private_key: formattedUserPrivateKey
			});

			toast.success('Successfully joined project');
			open = false;
			if (onSuccess) onSuccess();
			goto(`/projects/${res.data.project_id}`);

		} catch (err: any) {
			console.error('Failed to join project:', err);
			toast.error(err.message || err.response?.data?.error?.message || 'Failed to join project');
		} finally {
			joining = false;
		}
	}

	function resetStep() {
		invitation = null;
		error = null;
		invitationPassword = '';
		// Keep invitationId if it was manually entered, so user can edit it?
		// But if coming from "Join by ID" blank, we want clear.
		if (!initialInvitationId) {
			invitationId = '';
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[450px]">
		<Dialog.Header>
			<Dialog.Title>Join Project</Dialog.Title>
			<Dialog.Description>
				{#if invitation}
					Review invitation details and set security credentials.
				{:else}
					Enter invitation ID to find the project.
				{/if}
			</Dialog.Description>
		</Dialog.Header>

		{#if !invitation}
			<!-- Step 1: Find Invitation -->
			<form onsubmit={(e) => { e.preventDefault(); findInvitation(); }} class="space-y-4 py-4">
				<div class="space-y-2">
					<Label for="invitation-id">Invitation ID</Label>
					<Input 
						id="invitation-id" 
						bind:value={invitationId} 
						placeholder="e.g. inv_12345..."
						disabled={loading || !!initialInvitationId}
						autofocus
					/>
				</div>

				{#if error}
					<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
						<ShieldCheck class="h-4 w-4" />
						{error}
					</div>
				{/if}

				<Dialog.Footer>
					<Button type="submit" class="w-full" disabled={loading || !invitationId}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Checking...
						{:else}
							Check Invitation
							<ArrowRight class="ml-2 h-4 w-4" />
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{:else}
			<!-- Step 2: Join Form -->
			<div class="space-y-4 py-4">
				<div class="space-y-4 rounded-md border p-4 bg-muted/30">
					<div class="space-y-1">
						<span class="text-xs font-medium text-muted-foreground">Project Name</span>
						<p class="font-semibold">{invitation.project_name}</p>
					</div>
					<div class="grid grid-cols-2 gap-4">
						<div class="space-y-1">
							<span class="text-xs font-medium text-muted-foreground">Invited By</span>
							<p class="text-sm">{invitation.inviter_name}</p>
						</div>
						<div class="space-y-1">
							<span class="text-xs font-medium text-muted-foreground">Role</span>
							<p class="text-sm capitalize"><Badge variant="outline">{invitation.role}</Badge></p>
						</div>
					</div>
				</div>

				<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); handleJoin(); }}>
					<div class="space-y-2">
						<Label for="invitation-password">Invitation Password</Label>
						<Input 
							id="invitation-password" 
							type="password" 
							bind:value={invitationPassword} 
							placeholder="Enter password from invitation link"
						/>
					</div>

					<div class="space-y-2">
						<Label for="master-password">Create Master Password</Label>
						<Input 
							id="master-password" 
							type="password" 
							bind:value={masterPassword} 
							placeholder="For encrypting your private key"
						/>
						
						<!-- Password Requirements -->
						<div class="mt-2 space-y-1 rounded-md border bg-muted/50 p-3 text-xs">
							<div class="grid grid-cols-2 gap-1">
								<div class="flex items-center gap-1 {validations.length ? 'text-green-600' : 'text-muted-foreground'}">
									<div class="h-1.5 w-1.5 rounded-full {validations.length ? 'bg-green-500' : 'bg-muted-foreground'}"></div>
									8+ chars
								</div>
								<!-- Simplified requirements for space -->
								<div class="flex items-center gap-1 {validations.special ? 'text-green-600' : 'text-muted-foreground'}">
									<div class="h-1.5 w-1.5 rounded-full {validations.special ? 'bg-green-500' : 'bg-muted-foreground'}"></div>
									Symbol
								</div>
							</div>
						</div>
					</div>

					<Dialog.Footer class="gap-2 sm:gap-0">
						<Button variant="outline" type="button" onclick={resetStep} disabled={joining}>
							Back
						</Button>
						<Button type="submit" disabled={joining || !isValid}>
							{#if joining}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Joining...
							{:else}
								Join Project
							{/if}
						</Button>
					</Dialog.Footer>
				</form>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
