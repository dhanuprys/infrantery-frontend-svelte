export interface BreadcrumbItem {
	type: 'project' | 'diagram' | 'note' | 'node' | 'vault';
	id?: string;
	label: string;
	active: boolean;
	siblings?: BreadcrumbItem[];
}

export interface BreadcrumbResponse {
	project_id: string;
	path: BreadcrumbItem[];
}
