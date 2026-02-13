import { apiClient } from '$lib/utils/apiClient';
import type { APIResponse, InvitationResponse, AcceptInvitationRequest } from '$lib/types/api';

export const invitationService = {
	async getInvitation(invitationId: string): Promise<APIResponse<InvitationResponse>> {
		const response = await apiClient.get<APIResponse<InvitationResponse>>(
			`/invitations/${invitationId}`
		);
		return response.data;
	},

	async acceptInvitation(
		invitationId: string,
		params: AcceptInvitationRequest
	): Promise<APIResponse<{ project_id: string }>> {
		const response = await apiClient.post<APIResponse<{ project_id: string }>>(
			`/invitations/${invitationId}/accept`,
			params
		);
		return response.data;
	},

	async getUserInvitations(): Promise<APIResponse<InvitationResponse[]>> {
		const response = await apiClient.get<APIResponse<InvitationResponse[]>>('/invitations');
		return response.data;
	}
};
