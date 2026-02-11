import { apiClient } from '$lib/utils/apiClient';
import type { APIResponse } from '$lib/types/api';

export interface NodeVaultResponse {
	id: string;
	node_id: string;
	project_id: string;
	label: string;
	type: string;
	encrypted_value?: string;
	encrypted_value_signature?: string;
	created_at: string;
	updated_at: string;
}

export interface CreateNodeVaultRequest {
	label: string;
	type: string;
	encrypted_value: string;
	encrypted_value_signature: string;
}

export interface UpdateNodeVaultRequest {
	label?: string;
	encrypted_value?: string;
	encrypted_value_signature?: string;
}

class VaultService {
	async getVaultItems(
		projectId: string,
		diagramId: string,
		nodeId: string
	): Promise<APIResponse<NodeVaultResponse[]>> {
		const response = await apiClient.get<APIResponse<NodeVaultResponse[]>>(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}/vault`
		);
		return response.data;
	}

	async getVaultItem(
		projectId: string,
		diagramId: string,
		nodeId: string,
		vaultId: string
	): Promise<APIResponse<NodeVaultResponse>> {
		const response = await apiClient.get<APIResponse<NodeVaultResponse>>(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}/vault/${vaultId}`
		);
		return response.data;
	}

	async createVaultItem(
		projectId: string,
		diagramId: string,
		nodeId: string,
		data: CreateNodeVaultRequest
	): Promise<APIResponse<NodeVaultResponse>> {
		const response = await apiClient.post<APIResponse<NodeVaultResponse>>(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}/vault`,
			data
		);
		return response.data;
	}

	async updateVaultItem(
		projectId: string,
		diagramId: string,
		nodeId: string,
		vaultId: string,
		data: UpdateNodeVaultRequest
	): Promise<APIResponse<NodeVaultResponse>> {
		const response = await apiClient.put<APIResponse<NodeVaultResponse>>(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}/vault/${vaultId}`,
			data
		);
		return response.data;
	}

	async deleteVaultItem(
		projectId: string,
		diagramId: string,
		nodeId: string,
		vaultId: string
	): Promise<void> {
		await apiClient.delete(
			`/projects/${projectId}/diagrams/${diagramId}/nodes/${nodeId}/vault/${vaultId}`
		);
	}
}

export const vaultService = new VaultService();
