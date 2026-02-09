import {
	type Icon as IconType,
	RectangleHorizontalIcon,
	ScrollIcon,
	ServerIcon
} from '@lucide/svelte';
import CubeImage from '$lib/assets/nodes/cube.png';
import { NodeTypeKey } from './node-types';
import type { Node } from '@xyflow/svelte';

export interface Shape {
	icon: typeof IconType;
	label: string;
	nodePayload: Partial<Node>;
}

export const shapes: Shape[] = [
	{
		icon: ServerIcon,
		label: 'Node',
		nodePayload: {
			type: NodeTypeKey.IMAGE,
			data: { src: CubeImage, alt: 'Default', label: 'Default' }
		}
	},
	{
		icon: RectangleHorizontalIcon,
		label: 'Area',
		nodePayload: {
			type: NodeTypeKey.AREA,
			data: { label: 'Area' }
		}
	},
	{
		icon: ScrollIcon,
		label: 'Comment',
		nodePayload: {
			type: NodeTypeKey.COMMENT,
			data: { content: 'Comment' }
		}
	}
];
