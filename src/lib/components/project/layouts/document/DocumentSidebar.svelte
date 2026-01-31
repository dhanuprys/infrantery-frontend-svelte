<script>
	import * as Empty from '$lib/components/ui/empty';
	import { Grid2x2XIcon } from '@lucide/svelte';
</script>

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
