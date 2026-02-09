import {
	BookOpenTextIcon,
	CodesandboxIcon,
	FileKey,
	UserIcon,
	type Icon as IconType
} from '@lucide/svelte';

interface VaultType {
	[key: string]: {
		type: string;
		label: string;
		icon: typeof IconType;
	};
}

export const vaultTypes: VaultType = {
	TEXT: {
		type: 'text',
		label: 'Text',
		icon: BookOpenTextIcon
	},
	USERNAME_PASSWORD: {
		type: 'username-password',
		label: 'User Pass',
		icon: UserIcon
	},
	SSH: {
		type: 'ssh',
		label: 'SSH',
		icon: FileKey
	},
	FREE_FIELD: {
		type: 'free-field',
		label: 'Free Fields',
		icon: CodesandboxIcon
	}
};
