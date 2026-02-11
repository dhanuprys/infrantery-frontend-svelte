import { apiClient } from '$lib/utils/apiClient';
import type { APIResponse } from '$lib/types/api';

export interface UpdateNodeRequest {
	encrypted_readme?: string;
	encrypted_readme_signature?: string;
	encrypted_dict?: string;
	encrypted_dict_signature?: string;
}

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

class NodeService {
	/**
	 * Initializes a node by fetching it. If it doesn't exist, the backend creates it.
	 */
	async initializeNode(
		projectId: string,
		diagramId: string,
		nodeId: string
	): Promise<APIResponse<NodeResponse>> {
		const response = await apiClient.get<APIResponse<NodeResponse>>(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}`
		);
		return response.data;
	}

	/**
	 * Deletes a node from the backend.
	 */
	async deleteNode(projectId: string, diagramId: string, nodeId: string): Promise<void> {
		await apiClient.delete(`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}`);
	}

	/**
	 * Updates a node's encrypted data.
	 */
	async updateNode(
		projectId: string,
		diagramId: string,
		nodeId: string,
		data: UpdateNodeRequest
	): Promise<APIResponse<NodeResponse>> {
		const response = await apiClient.put<APIResponse<NodeResponse>>(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}`,
			data
		);
		return response.data;
	}
}

export const nodeService = new NodeService();
