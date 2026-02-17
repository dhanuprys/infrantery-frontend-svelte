<script lang="ts">
	import type { Edge } from '@xyflow/svelte';
	import { useEdges } from '@xyflow/svelte';
	import * as Field from '$lib/components/ui/field';
	import { Input } from '$lib/components/ui/input';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Select from '$lib/components/ui/select';

	let { edge }: { edge: Edge } = $props();

	const edges = useEdges();
	const currentEdge = $derived(edges.current.find((n) => n.id === edge.id));

	let labelValue = $derived(edge.label || '');
	let edgeType = $derived(edge.type || '');

	function updateLabel(e: Event) {
		if (labelValue.length > 20) return;
		labelValue = (e.target as HTMLInputElement).value;
		diagramStore.setEdges(
			diagramStore.edges.map((n) => {
				if (n.id === edge.id) {
					return {
						...n,
						label: labelValue
					};
				}
				return n;
			})
		);
		diagramStore.markDirty();
	}

	function updateEdgeType(newType: string) {
		diagramStore.setEdges(
			diagramStore.edges.map((n) => {
				if (n.id === edge.id) {
					return {
						...n,
						type: newType
					};
				}
				return n;
			})
		);
		diagramStore.markDirty();
	}

	function deleteEdge() {
		diagramStore.deleteEdge(edge.id);
		diagramStore.markDirty();
	}
</script>

<div class="p-4">
	<h1 class="text-lg font-semibold">Edge: {currentEdge?.label || 'No Label'}</h1>
	<p class="text-sm text-muted-foreground">
		{currentEdge?.source} to {currentEdge?.target}
	</p>
	<div class="mt-8">
		<Field.Set>
			<Field.Group>
				<Field.Field>
					<Field.Label for="username">Label</Field.Label>
					<Input id="username" bind:value={labelValue} maxlength={20} oninput={updateLabel} />
					<Field.Description>Label for the edge.</Field.Description>
				</Field.Field>
				<Field.Field>
					<Field.Label for="type">Type</Field.Label>
					<Select.Root type="single" bind:value={edgeType} onValueChange={(v) => updateEdgeType(v)}>
						<Select.Trigger class="w-[180px]">{edgeType || 'default'}</Select.Trigger>
						<Select.Content>
							<Select.Item value="">default</Select.Item>
							<Select.Item value="smoothstep">smoothstep</Select.Item>
						</Select.Content>
					</Select.Root>
					<Field.Description>Edge type.</Field.Description>
				</Field.Field>
			</Field.Group>

			<Field.Group>
				<Field.Field>
					<Button id="delete-btn" variant="destructive" onclick={deleteEdge}>Delete</Button>
				</Field.Field>
			</Field.Group>
		</Field.Set>
	</div>
</div>
