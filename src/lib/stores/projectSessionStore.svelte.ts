interface ProjectSessionKeys {
	encryptionPublicKey: string;
	encryptionPrivateKey: string;
	signingPublicKey: string;
	signingPrivateKey: string;
}

class ProjectSessionStore {
	keys: ProjectSessionKeys | null = $state.raw(null);

	setKeys(keys: ProjectSessionKeys) {
		this.keys = keys;
	}
}

export const projectSessionStore = new ProjectSessionStore();
