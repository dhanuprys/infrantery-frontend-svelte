<script module lang="ts">
	export type CommentNodeType = Node<{ content: string }, 'number'>;
</script>

<script lang="ts">
	import { NodeResizer, type Node, type NodeProps } from '@xyflow/svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	let { id, data }: NodeProps<CommentNodeType> = $props();

	let selected = $derived(diagramStore.activeObject?.target.id === id);
</script>

<div class="">
	{#if selected}<NodeResizer />{/if}
	<p class="text-xs">{data.content} ini sangat pendek jika tidak diresize</p>
</div>
