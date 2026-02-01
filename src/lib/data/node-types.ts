import ImageNode from '$lib/components/project/digrams/nodes/ImageNode.svelte';
import CommentNode from '$lib/components/project/digrams/nodes/CommentNode.svelte';

export const NodeTypeKey = {
	IMAGE: 'image',
	COMMENT: 'comment'
} as const;

export const nodeTypes = {
	[NodeTypeKey.IMAGE]: ImageNode,
	[NodeTypeKey.COMMENT]: CommentNode
};
