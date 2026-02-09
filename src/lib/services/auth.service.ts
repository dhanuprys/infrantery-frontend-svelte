import { apiClient } from '$lib/utils/apiClient';
import type {
	APIResponse,
	AuthResponse,
	UserProfileResponse,
	UpdateProfileRequest,
	ChangePasswordRequest
} from '$lib/types/api';

export const authService = {
	async login(emailOrUsername: string, password: string): Promise<APIResponse<AuthResponse>> {
		const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/login', {
			email_or_username: emailOrUsername,
			password
		});
		return response.data;
	},

	async register(
		name: string,
		username: string,
		email: string,
		password: string
	): Promise<APIResponse<AuthResponse>> {
		const response = await apiClient.post<APIResponse<AuthResponse>>('/auth/register', {
			name,
			username,
			email,
			password
		});
		return response.data;
	},

	async logout(): Promise<void> {
		await apiClient.post('/auth/logout');
	},

	async getProfile(): Promise<APIResponse<UserProfileResponse>> {
		const response = await apiClient.get<APIResponse<UserProfileResponse>>('/profile');
		return response.data;
	},

	async updateProfile(data: UpdateProfileRequest): Promise<APIResponse<UserProfileResponse>> {
		const response = await apiClient.put<APIResponse<UserProfileResponse>>('/profile', data);
		return response.data;
	},

	async changePassword(data: ChangePasswordRequest): Promise<APIResponse<void>> {
		const response = await apiClient.put<APIResponse<void>>('/profile/password', data);
		return response.data;
	}
};
