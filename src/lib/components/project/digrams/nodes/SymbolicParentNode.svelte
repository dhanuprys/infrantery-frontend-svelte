<script module lang="ts">
	import { Position, type Node } from '@xyflow/svelte';

	export type SymbolicParentNodeProps = {
		label: string;
		parentDiagramId: string;
	};
	export type SymbolicParentNodeType = Node<SymbolicParentNodeProps, 'number'>;
</script>

<script lang="ts">
	import { Handle, type NodeProps } from '@xyflow/svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';

	let { id, data }: NodeProps<SymbolicParentNodeType> = $props();

	let selected = $derived(diagramStore.activeObject?.target.id === id);
</script>

<div
	class="flex h-22 w-22 flex-col rounded border dark:border-gray-500/40 {selected
		? 'border-2 dark:border-primary/80!'
		: ''}"
>
	<Handle type="source" position={Position.Bottom} />
	{#if data.label}
		<div class="w-full rounded-t border-b bg-background px-2 py-0.5 text-center text-[0.5rem]">
			{data.label}
		</div>
	{/if}
	<div
		class="relative flex flex-1 items-center justify-center overflow-hidden rounded-b bg-background/70"
	>
		<div class="ball transition-all duration-300 hover:scale-110"></div>
		<!-- <img
			src={data.src}
			alt={data.alt}
			class="h-full w-full bg-background/70 object-contain p-2"
		/> -->
	</div>
</div>

<style>
	:global(.ball) {
		width: 30%;
		aspect-ratio: calc(1 / 1);
		border-radius: 100px;
		animation: spinBall 1.5s linear infinite;
		background-color: #fff;
		box-shadow:
            /* 1. Inner Ring (Defines the shape without being too dark) */
			inset 0 0 20px rgba(0, 0, 0, 0.1),
			/* 2. Inner Color Glow (Darker colors so they pop against white) */ inset 6px 0 18px
				darkviolet,
			inset -6px 0 18px darkcyan,
			/* 3. Deep Inner Saturation (Intense core) */ inset 6px 0 30px rgba(148, 0, 211, 0.5),
			inset -6px 0 30px rgba(0, 139, 139, 0.5),
			/* 4. Outer Glow (The "Halo") */
			/* Note: We use high opacity because the background is bright */ -6px 0 25px
				rgba(148, 0, 211, 0.6),
			/* Violet Halo */ 6px 0 25px rgba(0, 206, 209, 0.6); /* Cyan Halo */
	}

	:global(.dark .ball) {
		box-shadow:
			inset 0 0 18px #fff,
			inset 6px 0 18px violet,
			inset -6px 0 18px #0ff,
			inset 6px 0 30px violet,
			inset -6px 0 30px #0ff,
			0 0 18px #fff,
			-4px 0 18px violet,
			4px 0 18px #0ff;
	}

	@keyframes spinBall {
		100% {
			transform: rotate(360deg);
		}
	}
</style>
