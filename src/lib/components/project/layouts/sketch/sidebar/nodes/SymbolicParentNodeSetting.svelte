<script lang="ts">
	import type { SymbolicParentNodeProps } from '$lib/components/project/digrams/nodes/SymbolicParentNode.svelte';
	import type { Node } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Alert from '$lib/components/ui/alert';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { useSvelteFlow } from '@xyflow/svelte';

	let { node }: { node: Node<SymbolicParentNodeProps, 'number'> } = $props();
	let labelValue = $derived(node.data.label);
	const { fitView } = useSvelteFlow();

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

	function goToParentNodeDiagram() {
		const parentId = node.data.parentDiagramId;
		const projectId = diagramStore.projectId;

		if (parentId && projectId) {
			toast.success('Parent diagram opened');
			goto(`/projects/${projectId}/diagrams/${parentId}`);
			setTimeout(() => fitView({ padding: 0.1 }), 500);
		} else {
			toast.error('Parent diagram information missing');
		}
	}
</script>

<Field.Set>
	<Field.Group>
		<Field.Field>
			<Alert.Root class="bg-linear-to-br from-blue-600 to-violet-500">
				<Alert.Title class="text-white">MAGIC NODE!</Alert.Title>
				<Alert.Description class="text-white/80"
					>This is a symbolic node of parent diagram</Alert.Description
				>
			</Alert.Root>
		</Field.Field>
	</Field.Group>
	<Field.Group>
		<Field.Field>
			<Field.Label for="username">Label</Field.Label>
			<Input id="username" bind:value={labelValue} maxlength={20} oninput={updateLabel} />
			<Field.Description>Label for the node.</Field.Description>
		</Field.Field>
	</Field.Group>

	<Field.Group>
		<Field.Field>
			<Button variant="outline" onclick={goToParentNodeDiagram}>Go to Parent Node Diagram</Button>
		</Field.Field>
	</Field.Group>
</Field.Set>
