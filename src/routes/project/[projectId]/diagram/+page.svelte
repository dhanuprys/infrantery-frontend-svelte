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
	import * as Sketch from '$lib/components/project/layouts/sketch';
	import Header from '$lib/components/project/layouts/Header.svelte';

	let nodeTypes = {
		image: ImageNode
	};

	let nodes = $state.raw<Node[]>([
		{
			id: '1',
			position: { x: 0, y: 0 },
			data: { label: 'Node 1' }
		},
		{
			id: '2',
			position: { x: 100, y: 100 },
			data: { label: 'Node 2' }
		},
		{
			id: '3',
			type: 'image',
			position: { x: 200, y: 200 },
			data: {
				src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTu8_n2ixd2W0hk9RHg681_JQPd1b87ttC_A&s',
				alt: 'Node 3'
			}
		},
		{
			id: '4',
			type: 'image',
			position: { x: 240, y: 240 },
			data: {
				src: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTu8_n2ixd2W0hk9RHg681_JQPd1b87ttC_A&s',
				alt: 'Node 4'
			}
		}
	]);

	let edges = $state.raw<Edge[]>([
		{
			id: '1',
			source: '1',
			target: '2',
			type: 'smoothstep',
			label: 'in to',
			markerStart: {
				type: MarkerType.Arrow
			}
		},
		{
			id: '2',
			source: '2',
			target: '3',
			type: 'smoothstep'
		}
	]);

	let colorMode = $derived(mode.current || 'light');
	let variant = $state(BackgroundVariant.Dots);
</script>

<div style:height="100vh" class="flex flex-col">
	<Header />
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
</div>
