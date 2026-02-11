<script lang="ts">
	import type { Node } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CommentNodeProps } from '$lib/components/project/digrams/nodes/CommentNode.svelte';
	import { Textarea } from '$lib/components/ui/textarea';

	let { node }: { node: Node<CommentNodeProps, 'number'> } = $props();
	let contentValue = $derived(node.data.content);

	function updateContent(e: Event) {
		contentValue = (e.target as HTMLInputElement).value;
		diagramStore.setNodes(
			diagramStore.nodes.map((n) => {
				if (n.id === node.id) {
					return {
						...n,
						data: {
							...n.data,
							content: contentValue
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
			<Field.Label for="username">Content</Field.Label>
			<Textarea id="username" bind:value={contentValue} oninput={updateContent} />
			<Field.Description>Content for the comment.</Field.Description>
		</Field.Field>
	</Field.Group>
	<Field.Group>
		<Field.Field>
			<Button id="delete-btn" variant="destructive" onclick={deleteNode}>Delete</Button>
		</Field.Field>
	</Field.Group>
</Field.Set>
