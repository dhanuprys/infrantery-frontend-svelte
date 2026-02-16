<script lang="ts">
	import * as Resizable from '$lib/components/ui/resizable';
	import * as Sketch from '$lib/components/project/layouts/sketch';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import { SvelteFlowProvider } from '@xyflow/svelte';
	import { onDestroy, untrack } from 'svelte';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';
	import { diagramService } from '$lib/services/diagram.service';
	import { cryptoService } from '$lib/services/cryptoService';
	import type { DiagramResponse } from '$lib/types/api';
	import { toast } from 'svelte-sonner';
	import type { DiagramData } from '$lib/types';
	import { diagramStore } from '$lib/stores/diagramStore.svelte';

	let { params } = $props();
	let { projectId, diagramId } = $derived(params);

	let currentDiagram = $state<DiagramResponse | null>(null);
	let saveStatus = $state<'saved' | 'saving' | 'unsaved' | 'error'>('saved');
	let lastSaved = $state<Date | null>(null);

	// Autosave timer
	let saveTimeout: ReturnType<typeof setTimeout> | null = null;
	const AUTOSAVE_DELAY = 1000;

	async function loadDiagram() {
		try {
			const res = await diagramService.getDiagram(projectId, diagramId);
			currentDiagram = res.data;
			diagramStore.setContext(projectId, diagramId, currentDiagram.parent_diagram_id);

			if (currentDiagram.encrypted_data) {
				if (!projectSessionStore.keyrings) {
					throw new Error('Project keys not found. Please re-authorize.');
				}

				// 1. Verify Signature
				const unwrapped = await cryptoService.unwrapProjectData(
					projectSessionStore.keyrings,
					currentDiagram.encrypted_data_signature,
					currentDiagram.encrypted_data
				);

				try {
					const data: DiagramData = JSON.parse(unwrapped.decryptedData);
					// Validate structure loosely
					if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
						diagramStore.setNodes(data.nodes);
						diagramStore.setEdges(data.edges);
					} else {
						console.warn('Invalid diagram data format, resetting to empty', data);
						diagramStore.setNodes([]);
						diagramStore.setEdges([]);
					}
				} catch (parseErr) {
					console.error('Failed to parse diagram JSON:', parseErr);
					diagramStore.setNodes([]);
					diagramStore.setEdges([]);
				}
			} else {
				diagramStore.setNodes([]);
				diagramStore.setEdges([]);
			}

			// Ensure we start clean
			diagramStore.markSaved();
			saveStatus = 'saved';
			lastSaved = new Date(currentDiagram.updated_at);
		} catch (err: any) {
			console.error('Failed to load diagram:', err);
			toast.error(err.message || 'Failed to load diagram');
			saveStatus = 'error';
		}
	}

	async function saveDiagram() {
		if (!currentDiagram || !projectSessionStore.keyrings || !projectSessionStore.projectBrief)
			return;

		saveStatus = 'saving';

		try {
			const data: DiagramData = {
				nodes: diagramStore.nodes,
				edges: diagramStore.edges
			};
			const jsonString = JSON.stringify(data);

			// 1. Encrypt
			const wrapped = await cryptoService.wrapProjectData(
				projectSessionStore.keyrings,
				projectSessionStore.projectBrief.key_epoch,
				jsonString
			);
			// 3. Update
			const res = await diagramService.updateDiagram(projectId, diagramId, {
				encrypted_data: wrapped.encrypted,
				encrypted_data_signature: wrapped.signature
			});

			currentDiagram = res.data;
			lastSaved = new Date();
			saveStatus = 'saved';
			diagramStore.markSaved();
		} catch (err: any) {
			console.error('Failed to save diagram:', err);
			saveStatus = 'error';
			toast.error('Failed to save diagram');
		}
	}

	$effect(() => {
		if (projectId && diagramId) {
			loadDiagram();
		}
	});

	onDestroy(() => {
		if (saveTimeout) clearTimeout(saveTimeout);
		// Reset store on exit to avoid ghost data
		diagramStore.setNodes([]);
		diagramStore.setEdges([]);
		diagramStore.markSaved();
	});

	// Reactively Trigger Autosave when dirty
	// Reactively Trigger Autosave when dirty
	$effect(() => {
		// Dependency: Only re-run when timestamp changes (user interaction)
		const _ts = diagramStore.changeTimestamp;

		untrack(() => {
			if (diagramStore.isDirty) {
				if (saveStatus !== 'unsaved') {
					saveStatus = 'unsaved';
				}

				if (saveTimeout) clearTimeout(saveTimeout);
				saveTimeout = setTimeout(() => {
					saveDiagram();
				}, AUTOSAVE_DELAY);
			}
		});
	});
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader appType="diagram" />
	<SvelteFlowProvider>
		<main class="flex flex-1">
			<Resizable.PaneGroup direction="horizontal">
				<Resizable.Pane minSize={75}>
					<div class="flex h-full w-full flex-col">
						<Sketch.ToolBar status={saveStatus} />
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
