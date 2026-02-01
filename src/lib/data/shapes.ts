import { type Icon as IconType, ScrollIcon, ServerIcon } from '@lucide/svelte';
import CubeImage from '$lib/assets/nodes/cube.png';
import { NodeTypeKey } from './node-types';

export interface Shape {
	type: string;
	icon: typeof IconType;
	label: string;
	data?: any;
}

export const shapes: Shape[] = [
	{
		type: NodeTypeKey.IMAGE,
		icon: ServerIcon,
		label: 'Node',
		data: { src: CubeImage, alt: 'Default', label: 'Default' }
	},
	{
		type: NodeTypeKey.COMMENT,
		icon: ScrollIcon,
		label: 'Comment',
		data: { content: 'Comment' }
	}
];
