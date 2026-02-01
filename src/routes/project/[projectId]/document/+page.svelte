<script lang="ts">
	import {
		Background,
		BackgroundVariant,
		Controls,
		MarkerType,
		SvelteFlow,
		type Edge,
		type Node
	} from '@xyflow/svelte';
	import ImageNode from '$lib/components/project/digrams/nodes/ImageNode.svelte';
	import * as Resizable from '$lib/components/ui/resizable';
	import '@xyflow/svelte/dist/style.css';
	import { mode } from 'mode-watcher';
	import * as Document from '$lib/components/project/layouts/document';
	import Header from '$lib/components/project/layouts/Header.svelte';

	let mdValue = $state('');
</script>

<div style:height="100vh" class="flex flex-col">
	<Header />
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
