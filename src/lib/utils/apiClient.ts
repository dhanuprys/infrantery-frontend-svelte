import axios, { type InternalAxiosRequestConfig } from 'axios';
import { env } from '$env/dynamic/public';

// Extend AxiosRequestConfig to include our custom retry flag
interface CustomRequestConfig extends InternalAxiosRequestConfig {
	_retry?: boolean;
}

const baseUrl = env.PUBLIC_API_BASE_URL || 'http://localhost:8085';

export const apiClient = axios.create({
	baseURL: `${baseUrl.replace(/\/$/, '')}/api/v1`,
	withCredentials: true,
	headers: {
		'Content-Type': 'application/json'
	}
});

// Variables to manage the refresh state
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

apiClient.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config as CustomRequestConfig;

		// 1. Check if the error is a 401 and the token is expired
		if (
			error.response?.status === 401 &&
			error.response.data?.error?.code === 'EXPIRED_TOKEN' &&
			!originalRequest._retry
		) {
			if (isRefreshing) {
				// 2. If a refresh is already in progress, add this request to the queue
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => apiClient(originalRequest))
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			// 3. Attempt to refresh the token
			return new Promise((resolve, reject) => {
				apiClient
					.post('/auth/refresh')
					.then(() => {
						console.log('Refresh token success');
						processQueue(null);
						// 4. Restart the original request
						resolve(apiClient(originalRequest));
					})
					.catch((err) => {
						console.error('Refresh token failed');
						processQueue(err, null);
						// full page reload
						window.location.href = '/login';
						reject(err);
					})
					.finally(() => {
						isRefreshing = false;
					});
			});
		}

		// Handle other 401 cases (invalid token, no token, etc)
		if (error.response?.status === 401 && window.location.pathname !== '/login') {
			// full page reload
			window.location.href = '/login';
		}

		return Promise.reject(error);
	}
);
