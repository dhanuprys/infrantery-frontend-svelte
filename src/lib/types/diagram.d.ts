import type { Node } from '@xyflow/svelte';

export type NodeWithType<T = Record<string, unknown>> = Node<T> & {
	type: 'image' | 'text' | 'comment';
};
