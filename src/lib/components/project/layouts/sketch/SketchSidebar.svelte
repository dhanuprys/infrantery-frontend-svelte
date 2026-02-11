<script lang="ts">
	import * as Empty from '$lib/components/ui/empty';
	import { Grid2x2XIcon } from '@lucide/svelte';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';
	import SketchSidebarNode from './sidebar/SketchSidebarNode.svelte';
	import SketchSidebarEdge from './sidebar/SketchSidebarEdge.svelte';
	import { type Edge } from '@xyflow/svelte';
	import type { NodeWithType } from '$lib/types';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

	let activeObject = $derived(diagramStore.activeObject);
</script>

{#if activeObject}
	<aside class="relative h-full">
		<div class="absolute inset-0 h-full w-full">
			<ScrollArea class="h-full w-full">
				{#if activeObject.type === 'node'}
					<SketchSidebarNode node={activeObject.target as NodeWithType} />
				{:else if activeObject.type === 'edge'}
					<SketchSidebarEdge edge={activeObject.target as Edge} />
				{:else}
					ERROR
				{/if}
			</ScrollArea>
		</div>
	</aside>
{:else}
	<aside class="flex h-full items-center justify-center p-4">
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<Grid2x2XIcon />
				</Empty.Media>
				<!-- <Empty.Title></Empty.Title> -->
				<Empty.Description>Click on the node to view details</Empty.Description>
			</Empty.Header>
			<!-- <Button variant="link" class="text-muted-foreground" size="sm">
							<a href="#/">
								Learn More <ArrowUpRightIcon class="inline" />
							</a>
						</Button> -->
		</Empty.Root>
	</aside>
{/if}
