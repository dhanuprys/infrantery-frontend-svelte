<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import VaultForm from '$lib/components/project/vault/VaultForm.svelte';
	import { vaultService } from '$lib/services/vault.service';
	import secureKeyringSession from '$lib/services/secureKeyringSession';
	import { ProjectSessionKeys } from '$lib/data/project-session-keys';
	import { cryptoService } from '$lib/services/cryptoService';
	import { toast } from 'svelte-sonner';
	import type { NodeVaultResponse } from '$lib/services/vault.service';
	import { page } from '$app/stores';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';

	let {
		open = $bindable(false),
		mode = 'create',
		typeKey,
		nodeId,
		existingItem = null,
		onSuccess
	} = $props<{
		open: boolean;
		mode: 'create' | 'edit';
		typeKey: string;
		nodeId: string;
		existingItem?: { id: string; label: string; decryptedData: any } | null;
		onSuccess?: () => void;
	}>();

	let loading = $state(false);
	let projectId = $derived($page.params.projectId as string);
	let diagramId = $derived($page.params.diagramId as string);

	async function handleSave(data: Record<string, any>) {
		if (!projectSessionStore.keyrings || !projectSessionStore.projectBrief) {
			toast.error('Project keys missing');
			return;
		}

		loading = true;
		try {
			// 0. Extract Label (should not be encrypted)
			const { label, ...dataToEncrypt } = data;

			if (!label) {
				toast.error('Label is required');
				return;
			}

			// 1. Serialize
			const jsonString = JSON.stringify(dataToEncrypt);

			// 2. Encrypt & Sign
			const wrapped = await cryptoService.wrapProjectData(
				projectSessionStore.keyrings,
				projectSessionStore.projectBrief.key_epoch,
				jsonString
			);

			if (mode === 'create') {
				await vaultService.createVaultItem(projectId, diagramId, nodeId, {
					label,
					type: typeKey,
					encrypted_value: wrapped.encrypted,
					encrypted_value_signature: wrapped.signature
				});
				toast.success('Vault item added successfully');
			} else {
				if (!existingItem?.id) throw new Error('Item ID missing for update');
				await vaultService.updateVaultItem(projectId, diagramId, nodeId, existingItem.id, {
					label,
					encrypted_value: wrapped.encrypted,
					encrypted_value_signature: wrapped.signature
				});
				toast.success('Vault item updated successfully');
			}

			open = false;
			onSuccess?.();
		} catch (err: any) {
			console.error('Failed to save vault item:', err);
			const message =
				err.response?.data?.error?.message || err.message || 'Failed to save vault item';
			toast.error(message);
		} finally {
			loading = false;
		}
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{mode === 'create' ? 'Add Vault Item' : 'Edit Vault Item'}</Dialog.Title>
			<Dialog.Description>
				{mode === 'create'
					? `Add a new ${typeKey.toLowerCase().replace('_', ' ')} entry to the vault.`
					: 'Update existing vault entry.'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="py-4">
			<VaultForm
				type={typeKey}
				initialData={existingItem
					? { ...existingItem.decryptedData, label: existingItem.label }
					: null}
				{loading}
				onSubmit={handleSave}
			/>
		</div>
	</Dialog.Content>
</Dialog.Root>
