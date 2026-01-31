<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { type Icon as IconType, ScrollIcon, ServerIcon, TextCursorIcon } from '@lucide/svelte';

	interface Shape {
		type: string;
		icon: typeof IconType;
		label: string;
	}

	const shapes = [
		{ type: 'text', icon: TextCursorIcon, label: 'Text' },
		{ type: 'image', icon: ServerIcon, label: 'Node' },
		{ type: 'comment', icon: ScrollIcon, label: 'Comment' }
	];
</script>

{#snippet shapeButton(shape: Shape)}
	<button
		type="button"
		onclick={() => console.log(shape.type)}
		class="apsect-square flex aspect-square! w-full cursor-pointer flex-col items-center justify-center py-1"
	>
		<shape.icon class="size-5" />
		<span class="mt-1 text-[9px]">{shape.label}</span>
	</button>
{/snippet}

<div class="flex flex-col justify-end space-y-1 border-r bg-background p-2 text-foreground">
	<div class="flex flex-col gap-2">
		{#each shapes as shape}
			{@render shapeButton(shape)}
		{/each}
	</div>
	<Separator orientation="horizontal" />
</div>
