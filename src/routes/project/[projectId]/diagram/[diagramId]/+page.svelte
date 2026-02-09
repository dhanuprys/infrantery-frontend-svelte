<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Sketch from '$lib/components/project/layouts/sketch';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader />
	<SvelteFlowProvider>
		<main class="flex flex-1">
			<Resizable.PaneGroup direction="horizontal">
				<Resizable.Pane minSize={75}>
					<div class="flex h-full w-full flex-col">
						<Sketch.ToolBar />
						<div class="flex flex-1">
							<Sketch.ShapePicker />
							<Sketch.Diagram />
						</div>
					</div>
				</Resizable.Pane>
				<Resizable.Handle withHandle={true} />
				<Resizable.Pane minSize={20}>
					<Sketch.Sidebar />
				</Resizable.Pane>
			</Resizable.PaneGroup>
		</main>
	</SvelteFlowProvider>
</div>
