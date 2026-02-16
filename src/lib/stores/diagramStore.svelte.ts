import type { Edge, Node, XYPosition } from '@xyflow/svelte';
import { ObjectId } from 'bson';

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

	// Dragging state
	container: HTMLElement | null = null;
	nodeDrag = $state({ isDragging: false, isInsideBox: false });

	setContainer(container: HTMLElement) {
		this.container = container;
	}

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
	// --- Actions ---
	addNode(type: string, data?: Record<string, unknown>, position?: XYPosition) {
		const { x: lastX, y: lastY } = this.lastClickPosition;

		this.nodes = [
			...this.nodes,
			{
				id: new ObjectId().toString(),
				type,
				position: position || { x: lastX, y: lastY },
				origin: position ? [0.5, 0.5] : undefined,
				data: { label: 'Node ' + (this.nodes.length + 1), ...data }
			}
		];

		// avoid last click position to be same as the node position
		this.setLastClickPosition({ x: lastX + 10, y: lastY + 10 });
		this.markDirty();
	}
}

export const diagramStore = new DiagramStore();
