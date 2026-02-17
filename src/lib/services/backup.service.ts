import { apiClient } from '$lib/utils/apiClient';
import type { APIResponse, ProjectResponse } from '$lib/types/api';

export const backupService = {
	/**
	 * Creates an encrypted backup of the project and triggers browser download.
	 */
	async createBackup(projectId: string, password: string): Promise<void> {
		const response = await apiClient.post(
			`/projects/${projectId}/backup`,
			{ password },
			{ responseType: 'blob' }
		);

		// Extract filename from Content-Disposition header
		const disposition = response.headers['content-disposition'] || '';
		const filenameMatch = disposition.match(/filename=(.+)/);
		const filename = filenameMatch ? filenameMatch[1] : `backup_${projectId}.infbk`;

		// Trigger browser download
		const blob = new Blob([response.data], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	},

	/**
	 * Restores a project from an encrypted backup file.
	 * Returns the newly created project info.
	 */
	async restoreBackup(
		file: File,
		password: string
	): Promise<APIResponse<{ project: ProjectResponse }>> {
		const formData = new FormData();
		formData.append('file', file);
		formData.append('password', password);

		const response = await apiClient.post<APIResponse<{ project: ProjectResponse }>>(
			'/projects/restore',
			formData,
			{
				headers: { 'Content-Type': 'multipart/form-data' }
			}
		);

		return response.data;
	}
};
