import { apiClient } from '$lib/utils/apiClient';
import type {
	APIResponse,
	ProjectResponse,
	ProjectDetailResponse,
	ProjectMemberResponse
} from '$lib/types/api';

export interface CreateProjectParams {
	name: string;
	description: string;
	secret_encryption_private_key: string;
	encryption_public_key: string;
	secret_signing_private_key: string;
	signing_public_key: string;
}

export interface UpdateProjectParams {
	name?: string;
	description?: string;
}

export interface AddMemberParams {
	user_id: string;
	role: string;
	permissions: string[];
}

export interface UpdateMemberParams {
	role: string;
	permissions: string[];
}

export const projectService = {
	// Project Management
	async createProject(params: CreateProjectParams): Promise<APIResponse<ProjectResponse>> {
		const response = await apiClient.post<APIResponse<ProjectResponse>>('/projects', params);
		return response.data;
	},

	async getProjects(): Promise<APIResponse<ProjectResponse[]>> {
		const response = await apiClient.get<APIResponse<ProjectResponse[]>>('/projects');
		return response.data;
	},

	async getProject(id: string): Promise<APIResponse<ProjectDetailResponse>> {
		const response = await apiClient.get<APIResponse<ProjectDetailResponse>>(`/projects/${id}`);
		return response.data;
	},

	async updateProject(
		id: string,
		params: UpdateProjectParams
	): Promise<APIResponse<ProjectResponse>> {
		const response = await apiClient.put<APIResponse<ProjectResponse>>(`/projects/${id}`, params);
		return response.data;
	},

	async deleteProject(id: string): Promise<void> {
		await apiClient.delete(`/projects/${id}`);
	},

	// Collaboration (Member Management)
	async addMember(projectId: string, params: AddMemberParams): Promise<void> {
		await apiClient.post(`/projects/${projectId}/members`, params);
	},

	async getMembers(projectId: string): Promise<APIResponse<ProjectMemberResponse[]>> {
		const response = await apiClient.get<APIResponse<ProjectMemberResponse[]>>(
			`/projects/${projectId}/members`
		);
		return response.data;
	},

	async updateMember(projectId: string, userId: string, params: UpdateMemberParams): Promise<void> {
		await apiClient.put(`/projects/${projectId}/members/${userId}`, params);
	},

	async removeMember(projectId: string, userId: string): Promise<void> {
		await apiClient.delete(`/projects/${projectId}/members/${userId}`);
	}
};
