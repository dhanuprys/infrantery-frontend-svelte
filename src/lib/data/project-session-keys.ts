export const ProjectSessionKeys = {
	KEYRINGS: 'project_keyrings'
};

export type ProjectSessionKeyType = (typeof ProjectSessionKeys)[keyof typeof ProjectSessionKeys];
