import type { NoteResponse } from '$lib/types/api';

// Extended interface for tree nodes
export interface TreeNode extends NoteResponse {
	children?: TreeNode[];
}

export function buildNoteTree(notes: NoteResponse[]): TreeNode[] {
	const nodeMap = new Map<string, TreeNode>();
	const rootNodes: TreeNode[] = [];

	// First pass: create nodes and map them
	notes.forEach((note) => {
		nodeMap.set(note.id, { ...note, children: [] });
	});

	// Second pass: build hierarchy
	notes.forEach((note) => {
		const node = nodeMap.get(note.id)!;
		if (note.parent_id && nodeMap.has(note.parent_id)) {
			const parent = nodeMap.get(note.parent_id)!;
			parent.children!.push(node);
		} else {
			rootNodes.push(node);
		}
	});

	sortNoteTree(rootNodes);
	return rootNodes;
}

function sortNoteTree(nodes: TreeNode[]) {
	nodes.sort((a, b) => {
		if (a.type === b.type) {
			return a.file_name.localeCompare(b.file_name);
		}
		return a.type === 'folder' ? -1 : 1;
	});
	nodes.forEach((node) => {
		if (node.children && node.children.length > 0) {
			sortNoteTree(node.children);
		}
	});
}
