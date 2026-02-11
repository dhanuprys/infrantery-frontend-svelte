<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { ShieldCheck, Save, Loader2, Plus, Trash2 } from '@lucide/svelte';
	import { cryptoService } from '$lib/services/cryptoService';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';
	import { nodeService } from '$lib/services/node.service';
	import { toast } from 'svelte-sonner';
	import * as Card from '$lib/components/ui/card';
	import { onMount } from 'svelte';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';

	import { untrack } from 'svelte';

	let { data } = $props();
	let node = $derived(data.node);
	let readme = $state('');
	let dict = $state<{ key: string; value: string }[]>([]);
	let isSaving = $state(false);
	let isLoading = $state(true);

	// Effect 2: Decrypt when node or keys change
	$effect(() => {
		// Explicitly track dependencies
		const currentNode = node;
		const keys = projectSessionStore.keys;

		// Run decryption without tracking internal reads
		untrack(() => {
			isLoading = true;
			decryptData(currentNode, keys).finally(() => {
				isLoading = false;
			});
		});
	});

	async function decryptData(currentNode: typeof node, keys: typeof projectSessionStore.keys) {
		if (!keys) return;

		try {
			// Decrypt Readme
			if (currentNode.encrypted_readme) {
				readme = await cryptoService.decryptWithPrivateKey(
					keys.encryptionPrivateKey,
					currentNode.encrypted_readme
				);
			} else {
				readme = '';
			}

			// Decrypt Dictionary
			if (currentNode.encrypted_dict) {
				const dictJson = await cryptoService.decryptWithPrivateKey(
					keys.encryptionPrivateKey,
					currentNode.encrypted_dict
				);
				try {
					const parsed = JSON.parse(dictJson);
					dict = Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
				} catch (e) {
					console.error('Failed to parse dictionary JSON', e);
					dict = [];
				}
			} else {
				dict = [];
			}
		} catch (e) {
			console.error('Decryption failed', e);
			toast.error('Failed to decrypt node data');
		}
	}

	function addDictItem() {
		dict = [...dict, { key: '', value: '' }];
	}

	function removeDictItem(index: number) {
		dict = dict.filter((_, i) => i !== index);
	}

	async function handleSave() {
		if (!projectSessionStore.keys) {
			toast.error('Project keys missing');
			return;
		}

		isSaving = true;
		try {
			// Encrypt Readme
			const encryptedReadme = await cryptoService.encryptWithPublicKey(
				projectSessionStore.keys.encryptionPublicKey,
				readme
			);
			const readmeSignature = await cryptoService.signData(
				projectSessionStore.keys.signingPrivateKey,
				encryptedReadme
			);

			// Encrypt Dictionary
			const dictObj = dict.reduce(
				(acc, item) => {
					if (item.key) acc[item.key] = item.value;
					return acc;
				},
				{} as Record<string, string>
			);
			const dictJson = JSON.stringify(dictObj);
			const encryptedDict = await cryptoService.encryptWithPublicKey(
				projectSessionStore.keys.encryptionPublicKey,
				dictJson
			);
			const dictSignature = await cryptoService.signData(
				projectSessionStore.keys.signingPrivateKey,
				encryptedDict
			);

			const updatedNode = await nodeService.updateNode(
				$page.params.projectId!,
				$page.params.diagramId!,
				node.id,
				{
					encrypted_readme: encryptedReadme,
					encrypted_readme_signature: readmeSignature,
					encrypted_dict: encryptedDict,
					encrypted_dict_signature: dictSignature
				}
			);

			node = updatedNode.data;
			toast.success('Node updated successfully');
		} catch (e: any) {
			console.error('Save failed', e);
			toast.error(e.message || 'Failed to save node');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="flex h-screen flex-col overflow-hidden bg-background">
	<ProjectHeader appType="diagram" />
	<div class="flex-1 overflow-auto p-6">
		<div class="container mx-auto max-w-7xl space-y-6">
			<div class="flex items-center justify-between">
				<h2 class="text-2xl font-bold tracking-tight">Node Details</h2>
				<div class="flex gap-2">
					<Button
						variant="outline"
						onclick={() =>
							goto(
								`/projects/${$page.params.projectId}/diagrams/${$page.params.diagramId}/node/${node.id}/vault`
							)}
					>
						<ShieldCheck class="mr-2 size-4" />
						Open Vault
					</Button>
					<Button onclick={handleSave} disabled={isSaving || isLoading}>
						{#if isSaving}
							<Loader2 class="mr-2 size-4 animate-spin" />
						{:else}
							<Save class="mr-2 size-4" />
						{/if}
						Save Changes
					</Button>
				</div>
			</div>

			{#if isLoading}
				<div class="flex h-64 items-center justify-center">
					<Loader2 class="size-8 animate-spin text-muted-foreground" />
				</div>
			{:else}
				<div class="grid gap-6 md:grid-cols-2">
					<!-- Readme Section -->
					<Card.Root class="h-full">
						<Card.Header>
							<Card.Title>Readme</Card.Title>
							<Card.Description>Markdown documentation for this node.</Card.Description>
						</Card.Header>
						<Card.Content class="h-[500px]">
							<Textarea
								placeholder="Write your documentation here..."
								class="h-full resize-none font-mono"
								bind:value={readme}
							/>
						</Card.Content>
					</Card.Root>

					<!-- Dictionary Section -->
					<Card.Root class="h-full">
						<Card.Header>
							<div class="flex items-center justify-between">
								<div>
									<Card.Title>Dictionary</Card.Title>
									<Card.Description>Key-value pairs for metadata.</Card.Description>
								</div>
								<Button variant="ghost" size="sm" onclick={addDictItem}>
									<Plus class="mr-2 size-4" />
									Add Item
								</Button>
							</div>
						</Card.Header>
						<Card.Content class="h-[500px] overflow-y-auto pr-2">
							<div class="space-y-4">
								{#each dict as item, i}
									<div class="flex items-start gap-2">
										<div class="grid flex-1 gap-2">
											<Input placeholder="Key" bind:value={item.key} />
											<Textarea
												placeholder="Value"
												class="min-h-[60px] resize-y font-mono text-xs"
												bind:value={item.value}
											/>
										</div>
										<Button
											variant="ghost"
											size="icon"
											class="text-destructive hover:bg-destructive/10 hover:text-destructive"
											onclick={() => removeDictItem(i)}
										>
											<Trash2 class="size-4" />
										</Button>
									</div>
								{/each}
								{#if dict.length === 0}
									<div class="py-8 text-center text-sm text-muted-foreground">
										No dictionary items. Click "Add Item" to create one.
									</div>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				</div>
			{/if}
		</div>
	</div>
</div>
