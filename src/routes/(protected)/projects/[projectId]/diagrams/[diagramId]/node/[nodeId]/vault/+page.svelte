<script lang="ts">
	import { page } from '$app/stores';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import * as Vault from '$lib/components/project/layouts/vault';
	import * as Empty from '$lib/components/ui/empty';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		Copy,
		EllipsisVertical,
		Eye,
		Loader2,
		Pencil,
		Plus,
		Trash2,
		ShieldCheck,
		Lock
	} from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { vaultService, type NodeVaultResponse } from '$lib/services/vault.service';
	import { vaultTypes } from '$lib/data/vault-type';
	import { toast } from 'svelte-sonner';
	import VaultItemDialog from '$lib/components/project/dialogs/VaultItemDialog.svelte';
	import secureProjectSession from '$lib/services/secureProjectSession';
	import { ProjectSessionKeys } from '$lib/data/project-session-keys';
	import { cryptoService } from '$lib/services/cryptoService';

	let { data } = $props();
	let projectId = $derived($page.params.projectId as string);
	let nodeId = $derived($page.params.nodeId as string);

	let diagramId = $derived($page.params.diagramId as string);

	let items = $state<NodeVaultResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	// Dialog State
	let dialogOpen = $state(false);
	let dialogMode = $state<'create' | 'edit'>('create');
	let selectedtypeKey = $state('TEXT');
	let selectedItem = $state<{ id: string; label: string; decryptedData: any } | null>(null);

	// Decryption State
	let decryptingId = $state<string | null>(null);

	async function loadVaultItems() {
		loading = true;
		// Reset state
		items = [];
		error = null;

		try {
			const res = await vaultService.getVaultItems(projectId, diagramId, nodeId);
			items = res.data || [];
		} catch (err: any) {
			console.error('Failed to load vault items:', err);
			error = 'Failed to load vault items.';
		} finally {
			loading = false;
		}
	}

	function openCreateDialog(type: string) {
		selectedtypeKey = type;
		dialogMode = 'create';
		selectedItem = null;
		dialogOpen = true;
	}

	async function getKeys() {
		const encryptKey = await secureProjectSession.getItem(
			ProjectSessionKeys.ENCRYPTION_PRIVATE_KEY,
			projectId
		);
		const signKey = await secureProjectSession.getItem(
			ProjectSessionKeys.SIGNING_PUBLIC_KEY,
			projectId
		);

		if (!encryptKey || !signKey) {
			toast.error('Project keys not found. Please re-authorize.');
			throw new Error('Keys missing');
		}
		return { encryptKey, signKey };
	}

	async function decryptItem(item: NodeVaultResponse) {
		// Lazy Load: Fetch full details if encrypted_value is missing
		let fullItem = item;
		if (!item.encrypted_value || !item.encrypted_value_signature) {
			try {
				const res = await vaultService.getVaultItem(projectId, diagramId, nodeId, item.id);
				fullItem = res.data;
			} catch (err) {
				console.error('Failed to fetch full item details:', err);
				toast.error('Failed to load item details.');
				return null;
			}
		}

		if (!fullItem.encrypted_value || !fullItem.encrypted_value_signature) {
			toast.error('Item data is missing or corrupted.');
			return null;
		}

		try {
			const { encryptKey, signKey } = await getKeys();

			// 1. Verify Signature
			const isValid = await cryptoService.verifySignature(
				signKey,
				fullItem.encrypted_value_signature,
				fullItem.encrypted_value
			);

			if (!isValid) {
				toast.error('Signature verification failed! Data integrity compromised.');
				return null;
			}

			// 2. Decrypt
			const decryptedJson = await cryptoService.decryptWithPrivateKey(
				encryptKey,
				fullItem.encrypted_value
			);
			return JSON.parse(decryptedJson);
		} catch (err: any) {
			console.error('Decryption failed:', err);
			toast.error('Failed to decrypt item.');
			return null;
		}
	}

	async function handleEdit(item: NodeVaultResponse) {
		decryptingId = item.id;
		const data = await decryptItem(item);
		decryptingId = null;

		if (data) {
			selectedtypeKey = item.type;
			dialogMode = 'edit';
			selectedItem = { id: item.id, label: item.label, decryptedData: data };
			dialogOpen = true;
		}
	}

	async function handleDelete(item: NodeVaultResponse) {
		if (!confirm('Are you sure you want to delete this item? This cannot be undone.')) return;

		try {
			await vaultService.deleteVaultItem(projectId, diagramId, nodeId, item.id);
			toast.success('Item deleted successfully');
			await loadVaultItems();
		} catch (err) {
			toast.error('Failed to delete item');
		}
	}

	onMount(() => {
		loadVaultItems();
	});
</script>

<div class="flex h-screen flex-col overflow-hidden bg-background">
	<ProjectHeader appType="vault" />

	<div class="flex-1 overflow-auto p-6">
		<div class="container mx-auto max-w-7xl space-y-6">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-2xl font-bold tracking-tight">Node Vault</h1>
					<p class="text-muted-foreground">Securely store credentials and secrets for this node.</p>
				</div>

				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button>
							<Plus class="mr-2 h-4 w-4" />
							Add Item
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						{#each Object.entries(vaultTypes) as [key, type] (key)}
							<DropdownMenu.Item onclick={() => openCreateDialog(key)}>
								<type.icon class="mr-2 h-4 w-4" />
								Create {type.label}
							</DropdownMenu.Item>
						{/each}
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>

			{#if loading}
				<div class="flex h-64 items-center justify-center">
					<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
				</div>
			{:else if items.length === 0}
				<div class="flex h-full flex-col items-center justify-center">
					<Empty.Root>
						<Empty.Header>
							<Empty.Media variant="icon">
								<Lock />
							</Empty.Media>
							<Empty.Title>Vault is Empty</Empty.Title>
							<Empty.Description>
								No secrets stored for this node yet. Use the "Add Item" button to create one.
							</Empty.Description>
						</Empty.Header>
					</Empty.Root>
				</div>
			{:else}
				<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each items as item (item.id)}
						{@const typeDef = vaultTypes[item.type]}
						<Card.Root>
							<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
								<div class="flex items-center gap-2">
									<div class="rounded-md bg-primary/10 p-2 text-primary">
										{#if typeDef}
											<typeDef.icon class="h-4 w-4" />
										{:else}
											<ShieldCheck class="h-4 w-4" />
										{/if}
									</div>
									<div class="flex flex-col">
										<span class="font-semibold">{item.label}</span>
										<span class="text-xs text-muted-foreground">{typeDef?.label || item.type}</span>
									</div>
								</div>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class={buttonVariants({ variant: 'ghost', size: 'icon' }) + ' -mt-1 h-8 w-8'}
									>
										<EllipsisVertical class="h-4 w-4" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item onclick={() => handleEdit(item)}>
											<Pencil class="mr-2 h-4 w-4" /> Edit
										</DropdownMenu.Item>
										<DropdownMenu.Item
											class="text-destructive focus:text-destructive"
											onclick={() => handleDelete(item)}
										>
											<Trash2 class="mr-2 h-4 w-4" /> Delete
										</DropdownMenu.Item>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Card.Header>
							<Card.Content>
								<div class="mb-4 text-xs text-muted-foreground">
									Created <span class="font-medium text-foreground"
										>{new Intl.DateTimeFormat('en-US', {
											month: 'short',
											day: 'numeric',
											year: 'numeric'
										}).format(new Date(item.created_at))}</span
									>
								</div>

								<div class="flex gap-2">
									<Button
										variant="secondary"
										size="sm"
										class="flex-1"
										onclick={() => handleEdit(item)}
										disabled={decryptingId === item.id}
									>
										{#if decryptingId === item.id}
											<Loader2 class="mr-2 h-3.5 w-3.5 animate-spin" />
										{:else}
											<Eye class="mr-2 h-3.5 w-3.5" />
											View
										{/if}
									</Button>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<VaultItemDialog
	bind:open={dialogOpen}
	mode={dialogMode}
	typeKey={selectedtypeKey}
	{nodeId}
	existingItem={selectedItem}
	onSuccess={loadVaultItems}
/>
