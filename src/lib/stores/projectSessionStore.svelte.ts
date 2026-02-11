import type { Keyring } from '$lib/services/secureKeyringSession';
import type { ProjectChunkResponse } from '$lib/types';

class ProjectSessionStore {
	projectBrief: ProjectChunkResponse | null = $state.raw(null);
	keyrings: Keyring[] | null = $state.raw(null);

	setProjectBrief(projectBrief: ProjectChunkResponse) {
		this.projectBrief = projectBrief;
	}

	setKeyrings(keyrings: Keyring[]) {
		this.keyrings = keyrings;
	}
}

export const projectSessionStore = new ProjectSessionStore();
