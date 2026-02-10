import { apiClient } from '$lib/utils/apiClient';
import type { APIResponse, DiagramResponse, PaginationMeta } from '$lib/types/api';

interface GetDiagramsParams {
	project_id: string;
	rootOnly?: boolean;
	page?: number;
	limit?: number;
}

export const diagramService = {
	async getDiagrams(params: GetDiagramsParams): Promise<APIResponse<DiagramResponse[]>> {
		const query = new URLSearchParams();
		if (params.page) query.append('page', params.page.toString());
		if (params.limit) query.append('limit', params.limit.toString());
		if (params.rootOnly) query.append('root_only', 'true');

		const response = await apiClient.get<APIResponse<DiagramResponse[]>>(
			`/projects/${params.project_id}/diagrams?${query.toString()}`
		);
		return response.data;
	},

	async getDiagram(project_id: string, diagram_id: string): Promise<APIResponse<DiagramResponse>> {
		const response = await apiClient.get<APIResponse<DiagramResponse>>(
			`/projects/${project_id}/diagrams/${diagram_id}`
		);
		return response.data;
	},

	async createDiagram(
		project_id: string,
		data: {
			diagram_name: string;
			description: string;
			parent_diagram_id?: string;
			encrypted_data?: string;
			encrypted_data_signature: string;
		}
	): Promise<APIResponse<DiagramResponse>> {
		const response = await apiClient.post<APIResponse<DiagramResponse>>(
			`/projects/${project_id}/diagrams`,
			data
		);
		return response.data;
	},

	async deleteDiagram(project_id: string, diagram_id: string): Promise<void> {
		await apiClient.delete(`/projects/${project_id}/diagrams/${diagram_id}`);
	},

	async updateDiagram(
		project_id: string,
		diagram_id: string,
		data: {
			diagram_name?: string;
			description?: string;
			encrypted_data?: string;
			encrypted_data_signature?: string;
		}
	): Promise<APIResponse<DiagramResponse>> {
		const response = await apiClient.put<APIResponse<DiagramResponse>>(
			`/projects/${project_id}/diagrams/${diagram_id}`,
			data
		);
		return response.data;
	}
};
