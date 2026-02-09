// Pagination
export interface PaginationMeta {
	current_page: number;
	page_size: number;
	total_items: number;
	total_pages: number;
	has_next_page: boolean;
	has_prev_page: boolean;
}

// API Envelope
export interface ErrorResponse {
	code: string;
	message: string;
	fields?: Array<Record<string, string>>;
}

export interface MetadataResponse {
	request_id: string;
	timestamp: string;
}

export interface APIResponse<T> {
	data: T;
	meta: MetadataResponse;
	pagination?: PaginationMeta;
	error?: ErrorResponse;
}

// Auth Types
export interface AuthResponse {
	access_token: string;
	refresh_token: string;
	expires_in: number;
}

export interface UserResponse {
	id: string;
	name: string;
	username: string;
	email: string;
}

// Profile Types
export interface UserProfileResponse {
	id: string;
	name: string;
	username: string;
	email: string;
	created_at: string;
	updated_at: string;
}

// Project Types
export interface ProjectResponse {
	id: string;
	name: string;
	description: string;
	created_at: string;
	updated_at: string;
}

export interface ProjectDetailResponse {
	id: string;
	name: string;
	description: string;
	secret_encrypted_private_key: string;
	encryption_public_key: string;
	secret_signing_private_key: string;
	signing_public_key: string;
	role: string;
	permissions: string[];
	created_at: string;
	updated_at: string;
}

export interface ProjectMemberResponse {
	user_id: string;
	user_name: string;
	user_email: string;
	role: string;
	permissions: string[];
	created_at: string;
	updated_at: string;
}

// Note Types
export interface NoteResponse {
	id: string;
	project_id: string;
	file_name: string;
	file_type: string;
	encrypted_content?: string;
	encrypted_content_signature: string;
	created_at: string;
	updated_at: string;
}

// Diagram Types
export interface DiagramResponse {
	id: string;
	project_id: string;
	parent_diagram_id?: string;
	diagram_name: string;
	description: string;
	encrypted_data?: string;
	encrypted_data_signature: string;
	created_at: string;
	updated_at: string;
}

// Node Types
export interface NodeResponse {
	id: string;
	diagram_id: string;
	encrypted_readme?: string;
	encrypted_readme_signature?: string;
	encrypted_dict?: string;
	encrypted_dict_signature?: string;
	created_at: string;
	updated_at: string;
}

// Vault Types
export interface NodeVaultResponse {
	id: string;
	node_id: string;
	project_id: string;
	type: string;
	encrypted_value?: string;
	encrypted_value_signature?: string;
	created_at: string;
	updated_at: string;
}

// Breadcrumb Types
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
