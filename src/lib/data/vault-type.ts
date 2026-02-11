import {
	BookOpenTextIcon,
	CodesandboxIcon,
	FileKey,
	UserIcon,
	type Icon as IconType
} from '@lucide/svelte';

interface VaultField {
	name: string;
	label: string;
	type: 'text' | 'password' | 'textarea' | 'key-value';
	required?: boolean;
}

interface VaultType {
	[key: string]: {
		type: string;
		label: string;
		icon: typeof IconType;
		fields: VaultField[];
	};
}

export const vaultTypes: VaultType = {
	TEXT: {
		type: 'text',
		label: 'Text',
		icon: BookOpenTextIcon,
		fields: [{ name: 'content', label: 'Content', type: 'textarea', required: true }]
	},
	USERNAME_PASSWORD: {
		type: 'username-password',
		label: 'User Pass',
		icon: UserIcon,
		fields: [
			{ name: 'username', label: 'Username', type: 'text', required: true },
			{ name: 'password', label: 'Password', type: 'password', required: true }
		]
	},
	SSH: {
		type: 'ssh',
		label: 'SSH',
		icon: FileKey,
		fields: [
			{ name: 'private_key', label: 'Private Key', type: 'textarea', required: true },
			{ name: 'public_key', label: 'Public Key', type: 'textarea', required: false },
			{ name: 'passphrase', label: 'Passphrase', type: 'password', required: false }
		]
	},
	FREE_FIELD: {
		type: 'free-field',
		label: 'Free Fields',
		icon: CodesandboxIcon,
		fields: [{ name: 'fields', label: 'Fields', type: 'key-value', required: true }]
	}
};
