import { apiClient } from '$lib/utils/apiClient';
import type { APIResponse } from '$lib/types/api';
import type { BreadcrumbResponse } from '$lib/types/breadcrumb';

export const breadcrumbService = {
	async getBreadcrumbs(
		projectId: string,
		type: string,
		id?: string
	): Promise<APIResponse<BreadcrumbResponse>> {
		const params = new URLSearchParams({ type });
		if (id) params.append('id', id);

		const response = await apiClient.get<APIResponse<BreadcrumbResponse>>(
			`/projects/${projectId}/breadcrumbs?${params.toString()}`
		);
		return response.data;
	}
};
