import { apiClient } from '$lib/utils/apiClient';
import type {
	APIResponse,
	ProjectResponse,
	ProjectDetailResponse,
	ProjectMemberResponse,
	CreateProjectRequest,
	UpdateProjectRequest,
	AddMemberRequest,
	UpdateMemberRequest,
	ProjectChunkResponse,
	InvitationResponse,
	CreateInvitationRequest,
	UserSearchResponse
} from '$lib/types/api';

export const projectService = {
	// Project Management
	async createProject(params: CreateProjectRequest): Promise<APIResponse<ProjectResponse>> {
		const response = await apiClient.post<APIResponse<ProjectResponse>>('/projects', params);
		return response.data;
	},

	async getProjects(): Promise<APIResponse<ProjectResponse[]>> {
		const response = await apiClient.get<APIResponse<ProjectResponse[]>>('/projects');
		return response.data;
	},

	async getProject(id: string, withSecret = false): Promise<APIResponse<ProjectDetailResponse>> {
		const query = withSecret ? '?with_secret=true' : '';
		const response = await apiClient.get<APIResponse<ProjectDetailResponse>>(
			`/projects/${id}${query}`
		);
		return response.data;
	},

	// a brief information about the project
	async getProjectChunk(id: string): Promise<APIResponse<ProjectChunkResponse>> {
		const response = await apiClient.get<APIResponse<ProjectChunkResponse>>(
			`/projects/${id}?chunk=true`
		);
		return response.data;
	},

	async updateProject(
		id: string,
		params: UpdateProjectRequest
	): Promise<APIResponse<ProjectResponse>> {
		const response = await apiClient.put<APIResponse<ProjectResponse>>(`/projects/${id}`, params);
		return response.data;
	},

	async deleteProject(id: string): Promise<void> {
		await apiClient.delete(`/projects/${id}`);
	},

	// Key Rotation
	async rotateProjectKeys(
		projectId: string,
		newKeyEpoch: string,
		updates: {
			user_id: string;
			encrypted_passphrase: string;
			encrypted_signing_key: string;
			signing_public_key: string;
		}[]
	): Promise<void> {
		await apiClient.post(`/projects/${projectId}/keys/rotate`, {
			new_key_epoch: newKeyEpoch,
			updates
		});
	},

	// Collaboration (Member Management)
	async addMember(projectId: string, params: AddMemberRequest): Promise<void> {
		await apiClient.post(`/projects/${projectId}/members`, params);
	},

	async getMembers(projectId: string): Promise<APIResponse<ProjectMemberResponse[]>> {
		const response = await apiClient.get<APIResponse<ProjectMemberResponse[]>>(
			`/projects/${projectId}/members`
		);
		return response.data;
	},

	async updateMember(
		projectId: string,
		userId: string,
		params: UpdateMemberRequest
	): Promise<void> {
		await apiClient.put(`/projects/${projectId}/members/${userId}`, params);
	},

	async removeMember(projectId: string, userId: string): Promise<void> {
		await apiClient.delete(`/projects/${projectId}/members/${userId}`);
	},

	// Invitation Management
	async createInvitation(
		projectId: string,
		params: CreateInvitationRequest
	): Promise<APIResponse<{ invitation_id: string }>> {
		const response = await apiClient.post<APIResponse<{ invitation_id: string }>>(
			`/projects/${projectId}/invitations`,
			params
		);
		return response.data;
	},

	async getInvitations(
		projectId: string,
		page = 1,
		limit = 10
	): Promise<APIResponse<InvitationResponse[]>> {
		const response = await apiClient.get<APIResponse<InvitationResponse[]>>(
			`/projects/${projectId}/invitations?page=${page}&page_size=${limit}`
		);
		return response.data;
	},

	async revokeInvitation(projectId: string, invitationId: string): Promise<void> {
		await apiClient.delete(`/projects/${projectId}/invitations/${invitationId}`);
	},

	// User Search
	async searchUsers(query: string): Promise<APIResponse<UserSearchResponse[]>> {
		const response = await apiClient.get<APIResponse<UserSearchResponse[]>>(
			`/users/search?q=${encodeURIComponent(query)}`
		);
		return response.data;
	}
};
