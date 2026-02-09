<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Document from '$lib/components/project/layouts/document';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';

	let mdValue = $state('');
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader />
	<Document.ToolBar />
	<main class="flex flex-1">
		<Resizable.PaneGroup direction="horizontal">
			<Resizable.Pane minSize={20}>
				<Document.Sidebar />
			</Resizable.Pane>
			<Resizable.Handle />
			<Resizable.Pane defaultSize={40}>
				<Document.Editor bind:value={mdValue} />
			</Resizable.Pane>
			<Resizable.Handle withHandle={true} />
			<Resizable.Pane defaultSize={40}>
				<Document.Preview bind:value={mdValue} />
			</Resizable.Pane>
		</Resizable.PaneGroup>
	</main>
</div>
