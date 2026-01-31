<script module lang="ts">
	import { Handle, Position, type Node } from '@xyflow/svelte';

	export type ImageNodeType = Node<{ src: string; alt: string }, 'number'>;
</script>

<script lang="ts">
	import { type NodeProps } from '@xyflow/svelte';

	let { id, data }: NodeProps<ImageNodeType> = $props();
</script>

<div class="rounded-lg border-2">
	<Handle type="source" position={Position.Bottom} />
	<Handle type="target" position={Position.Bottom} />
	<Handle type="source" position={Position.Top} />
	<Handle type="target" position={Position.Top} />
	<Handle type="source" position={Position.Left} />
	<Handle type="target" position={Position.Left} />
	<Handle type="source" position={Position.Right} />
	<Handle type="target" position={Position.Right} />
	<img src={data.src} alt={data.alt} class="h-20 w-20 object-contain" />
</div>
