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

export interface UpdateProfileRequest {
	name: string;
	email: string;
	username: string;
}

export interface ChangePasswordRequest {
	current_password: string;
	new_password: string;
	confirm_password?: string;
}

export interface CreateProjectRequest {
	name: string;
	description: string;
	secret_passphrase: string;
	secret_signing_private_key: string; // encrypted + "." + salt + "." + iv
	signing_public_key: string;
	user_public_key: string;
	user_encrypted_private_key: string;
}

export interface UpdateProjectRequest {
	name?: string;
	description?: string;
}

export interface AddMemberRequest {
	user_id: string;
	role: string;
	permissions: string[];
}

export interface UpdateMemberRequest {
	role: string;
	permissions: string[];
}

// Project Types
export interface ProjectResponse {
	id: string;
	name: string;
	description: string;
	key_epoch: string;
	created_at: string;
	updated_at: string;
}

export interface ProjectMemberKeyring {
	epoch: string;
	secret_passphrase: string;
	secret_signing_private_key: string;
	signing_public_key: string;
}

export interface ProjectDetailResponse {
	id: string;
	name: string;
	description: string;
	key_epoch: string;
	role: string;
	permissions: string[];
	user_encrypted_private_key: string;
	keyrings?: ProjectMemberKeyring[];
	created_at: string;
	updated_at: string;
}

export interface ProjectChunkResponse {
	id: string;
	key_epoch: string;
}

export interface ProjectMemberResponse {
	user_id: string;
	user_name: string;
	user_email: string;
	role: string;
	permissions: string[];
	public_key: string;
	keyrings: ProjectMemberKeyring[];
	created_at: string;
	updated_at: string;
}

// Note Types
export interface NoteResponse {
	id: string;
	project_id: string;
	parent_id?: string;
	type: 'note' | 'folder';
	file_name: string;
	icon?: string;
	encrypted_content?: string;
	encrypted_content_signature: string;
	created_at: string;
	updated_at: string;
}

export interface CreateNoteRequest {
	parent_id?: string;
	type: 'note' | 'folder';
	file_name: string;
	icon?: string;
	encrypted_content?: string;
	encrypted_content_signature?: string;
}

export interface UpdateNoteRequest {
	file_name?: string;
	parent_id?: string;
	icon?: string;
	encrypted_content?: string;
	encrypted_content_signature?: string;
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

// Invitation Types
export interface InvitationResponse {
	id: string;
	project_id: string;
	project_name: string;
	inviter_name: string;
	invitee_name?: string;
	role: string;
	permissions: string[];
	encrypted_keyrings: string;
	status: string;
	created_at: string;
}

export interface CreateInvitationRequest {
	role: string;
	permissions: string[];
	encrypted_keyrings: string;
	invitee_user_id?: string;
}

export interface AcceptInvitationRequest {
	keyrings: {
		epoch: string;
		secret_passphrase: string;
		secret_signing_private_key: string;
		signing_public_key: string;
	}[];
	public_key: string;
	encrypted_private_key: string;
}

export interface UserSearchResponse {
	id: string;
	name: string;
	email: string;
	username: string;
}
