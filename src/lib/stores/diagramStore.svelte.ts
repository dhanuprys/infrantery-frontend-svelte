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
}

export const diagramStore = new DiagramStore();
