import type { UserProfileResponse } from '$lib/types/api';

function createUserStore() {
	let user = $state<UserProfileResponse | null>(null);
	let isAuthenticated = $state(false);
	let loading = $state(true);

	return {
		get user() {
			return user;
		},
		get isAuthenticated() {
			return isAuthenticated;
		},
		get loading() {
			return loading;
		},

		setUser(newUser: UserProfileResponse) {
			user = newUser;
			isAuthenticated = true;
			loading = false;
		},

		clearUser() {
			user = null;
			isAuthenticated = false;
			loading = false;
		},

		setLoading(isLoading: boolean) {
			loading = isLoading;
		}
	};
}

export const userStore = createUserStore();
