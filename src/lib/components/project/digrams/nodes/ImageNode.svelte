<script module lang="ts">
	import { Position, type Node } from '@xyflow/svelte';

	export type ImageNodeProps = {
		label: string;
		src: string;
		alt: string;
		fit: 'cover' | 'contain';
		childDiagramId: string;
	};
	export type ImageNodeType = Node<ImageNodeProps, 'number'>;
</script>

<script lang="ts">
	import { Handle, type NodeProps } from '@xyflow/svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';

	let { id, data }: NodeProps<ImageNodeType> = $props();

	let selected = $derived(diagramStore.activeObject?.target.id === id);
</script>

<Tooltip.Root>
	<Tooltip.Trigger>
		<div
			class="flex h-22 w-22 flex-col rounded border dark:border-gray-500/40 {selected
				? 'border-2 dark:border-primary/80!'
				: ''}"
		>
			<Handle type="source" position={Position.Bottom} class={data.label && 'translate-y-1'} />
			<Handle type="target" position={Position.Top} class={data.label && 'translate-y-1'} />
			{#if data.label}
				<div class="w-full rounded-t border-b bg-background px-2 py-0.5 text-center text-[0.5rem]">
					{data.label}
				</div>
			{/if}
			<div class="relative flex-1 overflow-hidden rounded-b">
				<img
					src={data.src}
					alt={data.alt}
					class="h-full w-full bg-background/70 {data.fit === 'cover'
						? 'object-cover'
						: 'object-contain p-2 transition-all duration-300 hover:scale-110'}"
				/>
			</div>
		</div>
	</Tooltip.Trigger>
	<Tooltip.Content side="right">
		<div class="text-md">
			<p>A short description about this node</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
			<p><strong>IP Address:</strong> 192.168.10.20</p>
		</div>
	</Tooltip.Content>
</Tooltip.Root>
