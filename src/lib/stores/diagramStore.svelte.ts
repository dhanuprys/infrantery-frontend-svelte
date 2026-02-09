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
	}

	deleteEdge(edgeId: string, releaseActiveObject: boolean = true) {
		this.edges = this.edges.filter((e) => e.id !== edgeId);
		if (releaseActiveObject) this.activeObject = null;
	}
}

export const diagramStore = new DiagramStore();
