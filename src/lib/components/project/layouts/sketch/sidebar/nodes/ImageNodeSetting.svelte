<script lang="ts">
	import type { ImageNodeProps } from '$lib/components/project/digrams/nodes/ImageNode.svelte';
	import { Position, useSvelteFlow, type Node } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Input } from '$lib/components/ui/input';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import {
		ExternalLink,
		Network,
		ShieldCheck,
		ChevronUp,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		ArrowLeftRight,
		ArrowUpDown,
		type Icon as IconType
	} from '@lucide/svelte';
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
	let labelValue = $derived(node.data.label);
	let sourcePosition = $derived(node.data.handlePosition?.source || Position.Bottom);
	let targetPosition = $derived(node.data.handlePosition?.target || Position.Top);
	let isCreatingChild = $state(false);

	const positionLabels: Record<string, string> = {
		[Position.Top]: 'T',
		[Position.Bottom]: 'B',
		[Position.Left]: 'L',
		[Position.Right]: 'R'
	};

	function updateHandlePosition(handle: 'source' | 'target', position: Position) {
		diagramStore.setNodes(
			diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							handlePosition: {
								...((n.data as ImageNodeProps).handlePosition || {}),
								[handle]: position
							}
						}
					};
				}
				return n;
			})
		);
		diagramStore.requestRerender();
		diagramStore.markDirty();
	}

	function setHandlePreset(preset: 'horizontal' | 'vertical') {
		const source = preset === 'horizontal' ? Position.Right : Position.Bottom;
		const target = preset === 'horizontal' ? Position.Left : Position.Top;
		diagramStore.setNodes(
			diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							handlePosition: { source, target }
						}
					};
				}
				return n;
			})
		);
		diagramStore.requestRerender();
		diagramStore.markDirty();
	}

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

		if (
			!projectSessionStore.keyrings ||
			!projectSessionStore.projectBrief ||
			!projectId ||
			!currentDiagramId
		) {
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

			const childWrapped = await cryptoService.wrapProjectData(
				projectSessionStore.keyrings,
				projectSessionStore.projectBrief?.key_epoch,
				childJson
			);

			const res = await diagramService.createDiagram(projectId, {
				diagram_name: `Child of ${node.data.label || 'Node'}`,
				description: `Child diagram created from node ${node.id}`,
				parent_diagram_id: currentDiagramId,
				encrypted_data: childWrapped.encrypted,
				encrypted_data_signature: childWrapped.signature
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
			const parentWrapped = await cryptoService.wrapProjectData(
				projectSessionStore.keyrings,
				projectSessionStore.projectBrief?.key_epoch,
				parentJson
			);
			await diagramService.updateDiagram(projectId, currentDiagramId, {
				encrypted_data: parentWrapped.encrypted,
				encrypted_data_signature: parentWrapped.signature
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

{#snippet dpadBtn(
	pad: { value: Position; handle: 'source' | 'target'; disabled: Position },
	pos: Position,
	Icon: typeof IconType
)}
	<button
		type="button"
		disabled={pad.disabled === pos}
		class="flex size-7 items-center justify-center rounded border transition-colors {pad.value ===
		pos
			? 'bg-primary text-primary-foreground'
			: pad.disabled === pos
				? 'cursor-not-allowed opacity-30'
				: 'hover:bg-muted'}"
		onclick={() => updateHandlePosition(pad.handle, pos)}
	>
		<Icon class="size-4" />
	</button>
{/snippet}

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
		<Field.Field>
			<div class="flex items-center justify-between">
				<Field.Label class="mb-0!">Handles Position</Field.Label>
				<div class="flex gap-1">
					<button
						type="button"
						title="Left → Right"
						class="flex size-6 items-center justify-center rounded border transition-colors {sourcePosition ===
							Position.Right && targetPosition === Position.Left
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
						onclick={() => setHandlePreset('horizontal')}
					>
						<ArrowLeftRight class="size-3.5" />
					</button>
					<button
						type="button"
						title="Top → Bottom"
						class="flex size-6 items-center justify-center rounded border transition-colors {sourcePosition ===
							Position.Bottom && targetPosition === Position.Top
							? 'bg-primary text-primary-foreground'
							: 'hover:bg-muted'}"
						onclick={() => setHandlePreset('vertical')}
					>
						<ArrowUpDown class="size-3.5" />
					</button>
				</div>
			</div>
			{@const pads = [
				{
					label: 'Source',
					value: sourcePosition,
					handle: 'source' as const,
					disabled: targetPosition
				},
				{
					label: 'Target',
					value: targetPosition,
					handle: 'target' as const,
					disabled: sourcePosition
				}
			]}
			<div class="grid grid-cols-2 gap-4">
				{#each pads as pad (pad.handle)}
					<div class="flex flex-col items-center gap-1">
						<span class="text-xs text-muted-foreground">{pad.label}</span>
						<div class="grid grid-cols-3 grid-rows-3 place-items-center gap-0.5">
							<div></div>
							{@render dpadBtn(pad, Position.Top, ChevronUp)}
							<div></div>
							{@render dpadBtn(pad, Position.Left, ChevronLeft)}
							<div
								class="flex size-7 items-center justify-center text-[10px] font-semibold text-muted-foreground"
							>
								{positionLabels[pad.value]}
							</div>
							{@render dpadBtn(pad, Position.Right, ChevronRight)}
							<div></div>
							{@render dpadBtn(pad, Position.Bottom, ChevronDown)}
							<div></div>
						</div>
					</div>
				{/each}
			</div>
			<Field.Description class="text-yellow-500">
				This will trigger <span class="font-semibold">rerender</span>.
			</Field.Description>
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
