import { redirect } from '@sveltejs/kit';

// redirect to /projects
export function load() {
	return redirect(307, '/projects');
}
