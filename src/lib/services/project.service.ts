import { apiClient } from '$lib/utils/apiClient';
import type {
	APIResponse,
	ProjectResponse,
	ProjectDetailResponse,
	ProjectMemberResponse,
	CreateProjectRequest,
	UpdateProjectRequest,
	AddMemberRequest,
	UpdateMemberRequest
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
	}
};
