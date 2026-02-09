import { apiClient } from '$lib/utils/apiClient';
import type {
	APIResponse,
	CreateNoteRequest,
	NoteResponse,
	UpdateNoteRequest
} from '$lib/types/api';

export const noteService = {
	async getNotes(projectId: string): Promise<APIResponse<NoteResponse[]>> {
		const response = await apiClient.get<APIResponse<NoteResponse[]>>(
			`/projects/${projectId}/notes`
		);
		return response.data;
	},

	async getNote(projectId: string, noteId: string): Promise<APIResponse<NoteResponse>> {
		const response = await apiClient.get<APIResponse<NoteResponse>>(
			`/projects/${projectId}/notes/${noteId}`
		);
		return response.data;
	},

	async createNote(
		projectId: string,
		params: CreateNoteRequest
	): Promise<APIResponse<NoteResponse>> {
		const response = await apiClient.post<APIResponse<NoteResponse>>(
			`/projects/${projectId}/notes`,
			params
		);
		return response.data;
	},

	async updateNote(
		projectId: string,
		noteId: string,
		params: UpdateNoteRequest
	): Promise<APIResponse<NoteResponse>> {
		const response = await apiClient.put<APIResponse<NoteResponse>>(
			`/projects/${projectId}/notes/${noteId}`,
			params
		);
		return response.data;
	},

	async deleteNote(projectId: string, noteId: string): Promise<void> {
		await apiClient.delete(`/projects/${projectId}/notes/${noteId}`);
	}
};
