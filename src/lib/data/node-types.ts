import ImageNode from '$lib/components/project/digrams/nodes/ImageNode.svelte';
import CommentNode from '$lib/components/project/digrams/nodes/CommentNode.svelte';
import SymbolicParentNode from '$lib/components/project/digrams/nodes/SymbolicParentNode.svelte';
import AreaNode from '$lib/components/project/digrams/nodes/AreaNode.svelte';

export const NodeTypeKey = {
	IMAGE: 'image',
	COMMENT: 'comment',
	SYMBOLIC_PARENT: 'symbolic-parent',
	AREA: 'area'
} as const;

export const nodeTypes = {
	[NodeTypeKey.IMAGE]: ImageNode,
	[NodeTypeKey.COMMENT]: CommentNode,
	[NodeTypeKey.SYMBOLIC_PARENT]: SymbolicParentNode,
	[NodeTypeKey.AREA]: AreaNode
};
