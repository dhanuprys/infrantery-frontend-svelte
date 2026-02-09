export const ProjectSessionKeys = {
	ENCRYPTION_PRIVATE_KEY: 'project_encryption_private_key',
	ENCRYPTION_PUBLIC_KEY: 'project_encryption_public_key',
	SIGNING_PRIVATE_KEY: 'project_signing_private_key',
	SIGNING_PUBLIC_KEY: 'project_signing_public_key'
};

export type ProjectSessionKeyType = (typeof ProjectSessionKeys)[keyof typeof ProjectSessionKeys];
