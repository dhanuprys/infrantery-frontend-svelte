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
	let hasChildDiagram = $derived(data.childDiagramId);
</script>

<Handle
	type="target"
	position={Position.Top}
	class={hasChildDiagram ? '' : data.label ? 'translate-y-1' : '-translate-y-0.5'}
/>
<Handle
	type="source"
	position={Position.Bottom}
	class={hasChildDiagram ? '-translate-y-1' : data.label ? 'translate-y-0.5' : '-translate-y-0.5'}
/>

<Tooltip.Root>
	<Tooltip.Trigger>
		<!-- Tambahkan overflow-hidden untuk memotong gradien yang berputar -->
		<div
			class="animated-border-container h-22 w-22 rounded border {hasChildDiagram
				? 'animated-border-box'
				: 'dark:border-gray-500/40'} {selected ? 'border-2 dark:border-primary/80!' : ''}"
		>
			<div class="flex size-full flex-col p-px">
				{#if data.label}
					<div
						class="z-10 w-full rounded-t border-b bg-background px-2 py-0.5 text-center text-[0.5rem]"
					>
						{data.label}
					</div>
				{/if}

				<div class="relative z-10 flex-1 overflow-hidden rounded-b">
					<img
						src={data.src}
						alt={data.alt}
						class="h-full w-full bg-background/95 {data.fit === 'cover'
							? 'object-cover'
							: 'object-contain p-2 transition-all duration-300 hover:scale-110'}"
					/>
				</div>
			</div>
		</div>
	</Tooltip.Trigger>
	<!-- ... Rest of your Tooltip.Content ... -->
</Tooltip.Root>

<style>
	/* Kontainer Utama */
	.animated-border-box {
		position: relative;
		background-clip: padding-box;
		background-color: rgb(var(--background)); /* Sesuaikan dengan theme */
		overflow: hidden;
	}

	/* Layer Animasi di belakang */
	.animated-border-box::before {
		content: '';
		position: absolute;
		/* Buat ukuran lebih besar dari kontainer agar rotasi menutupi sudut */
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		/* use blue */
		background: conic-gradient(from var(--angle), transparent 70%, #0000ff 90%, #00ffff 100%);
		animation: rotate 4s linear infinite;
		z-index: 0;
	}

	/* Pastikan konten berada di atas border */
	.animated-border-box > :not(::before) {
		z-index: 10;
	}

	@property --angle {
		syntax: '<angle>';
		initial-value: 0deg;
		inherits: false;
	}

	@keyframes rotate {
		from {
			--angle: 0deg;
		}
		to {
			--angle: 360deg;
		}
	}
</style>
