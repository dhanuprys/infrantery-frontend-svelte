<script lang="ts">
	import type { ImageNodeProps } from '$lib/components/project/digrams/nodes/ImageNode.svelte';
	import type { Node } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import * as Accordion from '$lib/components/ui/accordion';
	import { Input } from '$lib/components/ui/input';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import { ChevronsUpDownIcon } from '@lucide/svelte';
	import { nodeImages } from '$lib/data/node-images';
	import { Separator } from '$lib/components/ui/separator';
	import Button from '$lib/components/ui/button/button.svelte';

	let { node }: { node: Node<ImageNodeProps, 'number'> } = $props();
	let labelValue = $state(node.data.label);

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
	}

	function deleteNode() {
		diagramStore.setNodes(diagramStore.nodes.filter((n) => n.id !== node.id));
		diagramStore.setActiveObject(null);
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
			<Button id="delete-btn" variant="destructive" onclick={deleteNode}>Delete</Button>
		</Field.Field>
	</Field.Group>
</Field.Set>
