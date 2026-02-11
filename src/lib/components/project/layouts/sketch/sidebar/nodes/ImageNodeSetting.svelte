<script lang="ts">
	import type { ImageNodeProps } from '$lib/components/project/digrams/nodes/ImageNode.svelte';
	import { useSvelteFlow, type Node } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Input } from '$lib/components/ui/input';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import { ChevronsUpDownIcon, ExternalLink, Network, ShieldCheck } from '@lucide/svelte';
	import { nodeImages } from '$lib/data/node-images';
	import { Separator } from '$lib/components/ui/separator';
	import Button from '$lib/components/ui/button/button.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';
	import { cryptoService } from '$lib/services/cryptoService';
	import { diagramService } from '$lib/services/diagram.service';
	import { toast } from 'svelte-sonner';
	import type { DiagramData } from '$lib/types';
	import { NodeTypeKey } from '$lib/data/node-types';
	import { ObjectId } from 'bson';
	import { nodeService } from '$lib/services/node.service';

	let { node }: { node: Node<ImageNodeProps, 'number'> } = $props();
	const { fitView } = useSvelteFlow();
	let labelValue = $state(node.data.label);
	let isCreatingChild = $state(false);

	function updateLabel(e: Event) {
		if (labelValue.length > 20) return;
		labelValue = (e.target as HTMLInputElement).value;
		diagramStore.setNodes(
			diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							label: labelValue
						}
					};
				}
				return n;
			})
		);
		diagramStore.markDirty();
	}

	function updateNodeImage(image: (typeof nodeImages)[number]) {
		diagramStore.setNodes(
			diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							src: image.src,
							alt: image.alt,
							fit: image.fit,
							image_label: image.label
						}
					};
				}
				return n;
			})
		);
		diagramStore.markDirty();
	}

	function deleteNode() {
		diagramStore.deleteNode(node.id);
		diagramStore.markDirty();
	}

	async function handleChildDiagram() {
		const projectId = page.params.projectId;
		const currentDiagramId = page.params.diagramId;

		if (node.data.childDiagramId) {
			goto(`/projects/${projectId}/diagrams/${node.data.childDiagramId}`);
			toast.success('Child diagram opened');
			setTimeout(() => fitView({ padding: 0.1 }), 500);
			return;
		}

		if (!projectSessionStore.keys || !projectId || !currentDiagramId) {
			toast.error('Project keys or ID missing');
			return;
		}

		isCreatingChild = true;
		try {
			// --- 1. Create Child Diagram (Clean state with Symbolic Parent) ---
			const initialChildData: DiagramData = {
				nodes: [
					{
						id: new ObjectId().toString(),
						type: NodeTypeKey.SYMBOLIC_PARENT,
						position: { x: 0, y: 0 },
						data: {
							label: 'Master',
							parentDiagramId: currentDiagramId
						}
					}
				],
				edges: []
			};
			const childJson = JSON.stringify(initialChildData);

			const childEncrypted = await cryptoService.encryptWithPublicKey(
				projectSessionStore.keys.encryptionPublicKey,
				childJson
			);
			const childSignature = await cryptoService.signData(
				projectSessionStore.keys.signingPrivateKey,
				childEncrypted
			);

			const res = await diagramService.createDiagram(projectId, {
				diagram_name: `Child of ${node.data.label || 'Node'}`,
				description: `Child diagram created from node ${node.id}`,
				parent_diagram_id: currentDiagramId,
				encrypted_data: childEncrypted,
				encrypted_data_signature: childSignature
			});

			const newChildId = res.data.id;

			// --- 2. Update Parent Diagram (Link to Child) ---
			// We must save the parent diagram explicitly to persist the 'childDiagramId' link.
			// We do NOT switch the diagramStore to the child nodes yet, to preserve the parent view during save.

			const updatedParentNodes = diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							childDiagramId: newChildId
						}
					};
				}
				return n;
			});

			const parentData: DiagramData = {
				nodes: updatedParentNodes,
				edges: diagramStore.edges
			};

			const parentJson = JSON.stringify(parentData);
			const parentEncrypted = await cryptoService.encryptWithPublicKey(
				projectSessionStore.keys.encryptionPublicKey,
				parentJson
			);
			const parentSignature = await cryptoService.signData(
				projectSessionStore.keys.signingPrivateKey,
				parentEncrypted
			);

			await diagramService.updateDiagram(projectId, currentDiagramId, {
				encrypted_data: parentEncrypted,
				encrypted_data_signature: parentSignature
			});

			// Update local store to match the saved state and mark as clean
			diagramStore.setNodes(updatedParentNodes);
			diagramStore.markSaved();

			toast.success('Child diagram created');
			goto(`/projects/${projectId}/diagrams/${newChildId}`);
		} catch (error: any) {
			console.error('Failed to create child diagram:', error);
			toast.error(error.message || 'Failed to create child diagram');
		} finally {
			isCreatingChild = false;
		}
	}
</script>

<Field.Set>
	<Field.Group>
		<Field.Field>
			<Field.Label for="name">Icon</Field.Label>

			<Accordion.Root type="single">
				<Accordion.Item value="item-1">
					<Accordion.Trigger>
						<div class="flex items-center gap-2">
							<img
								class="h-10 w-10 shrink object-contain"
								src={node.data.src}
								alt={node.data.alt}
							/>
							<div>{node.data.alt}</div>
						</div>
					</Accordion.Trigger>
					<Accordion.Content>
						<Separator class="mb-4" />
						<div class="grid grid-cols-5 gap-2">
							{#each nodeImages as image (image.id)}
								<button
									type="button"
									onclick={() => updateNodeImage(image)}
									class="flex flex-col items-center gap-2"
								>
									<img
										class="aspect-square w-full shrink rounded object-contain"
										src={image.src}
										alt={image.alt}
									/>
									<span class="text-xs text-muted-foreground">{image.label}</span>
								</button>
							{/each}
						</div>
					</Accordion.Content>
				</Accordion.Item>
			</Accordion.Root>

			<Field.Description>Icon for the node.</Field.Description>
		</Field.Field>
		<Field.Field>
			<Field.Label for="username">Label</Field.Label>
			<Input id="username" bind:value={labelValue} maxlength={20} oninput={updateLabel} />
			<Field.Description>Label for the node.</Field.Description>
		</Field.Field>
	</Field.Group>

	<Field.Group>
		<Field.Field>
			<Field.Label>Node Actions</Field.Label>
			<div class="grid gap-2">
				<Button
					variant="outline"
					class="w-full justify-start"
					onclick={async () => {
						try {
							await nodeService.initializeNode(
								page.params.projectId!,
								page.params.diagramId!,
								node.id
							);
							goto(
								`/projects/${page.params.projectId}/diagrams/${page.params.diagramId}/node/${node.id}`
							);
						} catch (e: any) {
							toast.error(e.message || 'Failed to initialize node');
						}
					}}
				>
					<ExternalLink class="mr-2 size-4" />
					Node Detail
				</Button>

				<Button
					variant="outline"
					class="w-full justify-start"
					onclick={async () => {
						try {
							await nodeService.initializeNode(
								page.params.projectId!,
								page.params.diagramId!,
								node.id
							);
							goto(
								`/projects/${page.params.projectId}/diagrams/${page.params.diagramId}/node/${node.id}/vault`
							);
						} catch (e: any) {
							toast.error(e.message || 'Failed to initialize node');
						}
					}}
				>
					<ShieldCheck class="mr-2 size-4" />
					Open Vault
				</Button>

				<div class="space-y-1 pt-2">
					<Button
						variant="outline"
						class="w-full justify-start"
						onclick={handleChildDiagram}
						disabled={isCreatingChild}
					>
						{#if node.data.childDiagramId}
							<ExternalLink class="mr-2 size-4" />
							Open Child Diagram
						{:else}
							<Network class="mr-2 size-4" />
							{isCreatingChild ? 'Creating...' : 'Create Child Diagram'}
						{/if}
					</Button>
					<p class="text-xs text-muted-foreground">
						This will create a new diagram inside this node.
					</p>
				</div>
			</div>
		</Field.Field>
		<Field.Field>
			<Button
				id="delete-btn"
				variant="destructive"
				class="w-full justify-start"
				onclick={async () => {
					try {
						await nodeService.deleteNode(page.params.projectId!, page.params.diagramId!, node.id);
						deleteNode();
					} catch (e: any) {
						toast.error(e.message || 'Failed to delete node');
					}
				}}>Delete Node</Button
			>
		</Field.Field>
	</Field.Group>
</Field.Set>
