<script lang="ts">
	import type { Node } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { AreaNodeProps } from '$lib/components/project/digrams/nodes/AreaNode.svelte';
	import { Textarea } from '$lib/components/ui/textarea';

	let { node }: { node: Node<AreaNodeProps, 'number'> } = $props();
	let contentValue = $state(node.data.label);

	function updateLabel(e: Event) {
		contentValue = (e.target as HTMLInputElement).value;
		diagramStore.setNodes(
			diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							label: contentValue
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
</script>

<Field.Set>
	<Field.Group>
		<Field.Field>
			<Field.Label for="username">Label</Field.Label>
			<Input id="username" bind:value={contentValue} maxlength={20} oninput={updateLabel} />
			<Field.Description>Label for the area.</Field.Description>
		</Field.Field>
	</Field.Group>
	<Field.Group>
		<Field.Field>
			<Button id="delete-btn" variant="destructive" onclick={deleteNode}>Delete</Button>
		</Field.Field>
	</Field.Group>
</Field.Set>
