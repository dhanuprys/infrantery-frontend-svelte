import type { Edge, Node } from '@xyflow/svelte';

interface DiagramSelect {
	type: 'node' | 'edge';
	target: Node | Edge;
}

class DiagramStore {
	nodes: Node[] = $state.raw([]);
	edges: Edge[] = $state.raw([]);

	activeObject: DiagramSelect | null = $state.raw(null);
	lastClickPosition: { x: number; y: number } = $state.raw({ x: 0, y: 0 });

	// Context
	projectId: string | null = $state(null);
	diagramId: string | null = $state(null);
	parentDiagramId: string | null = $state(null);

	setContext(projectId: string, diagramId: string, parentDiagramId?: string | null) {
		this.projectId = projectId;
		this.diagramId = diagramId;
		this.parentDiagramId = parentDiagramId || null;
	}

	setNodes(nodes: Node[]) {
		this.nodes = nodes;
	}

	setEdges(edges: Edge[]) {
		this.edges = edges;
	}

	setActiveObject(diagram: DiagramSelect | null) {
		this.activeObject = diagram;
	}

	setLastClickPosition(position: { x: number; y: number }) {
		this.lastClickPosition = position;
	}

	deleteNode(nodeId: string, releaseActiveObject: boolean = true) {
		this.nodes = this.nodes.filter((n) => n.id !== nodeId);
		if (releaseActiveObject) this.activeObject = null;
		this.markDirty();
	}

	deleteEdge(edgeId: string, releaseActiveObject: boolean = true) {
		this.edges = this.edges.filter((e) => e.id !== edgeId);
		if (releaseActiveObject) this.activeObject = null;
		this.markDirty();
	}

	// --- Autosave / Dirty State Management ---
	isDirty = $state(false);
	changeTimestamp = $state(0);

	markDirty() {
		this.isDirty = true;
		this.changeTimestamp = Date.now();
	}

	markSaved() {
		this.isDirty = false;
	}
}

export const diagramStore = new DiagramStore();
