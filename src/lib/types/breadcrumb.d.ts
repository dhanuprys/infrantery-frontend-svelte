export interface BreadcrumbItem {
	type: 'project' | 'diagram' | 'note' | 'node' | 'vault' | 'node_vault';
	id?: string;
	label: string;
	active: boolean;
	siblings?: BreadcrumbItem[];
}

export interface BreadcrumbResponse {
	project_id: string;
	path: BreadcrumbItem[];
}
