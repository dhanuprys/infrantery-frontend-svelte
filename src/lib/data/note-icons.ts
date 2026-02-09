import { FileTextIcon, ServerIcon, type Icon as IconType } from '@lucide/svelte';

export const NoteIcons: Record<string, typeof IconType> = {
	['file']: FileTextIcon,
	['server']: ServerIcon
};
