import { cryptoService, type SymmetricEncryptedData } from './cryptoService';

export interface Keyring {
	epoch: string;
	passphrase: string;
	signing_public_key: string;
	signing_private_key: string;
}

class SecureKeyringSession {
	private secretKey: string;
	private secretSalt: Uint8Array<ArrayBuffer>;
	private secretIv: Uint8Array<ArrayBuffer>;
	private cachedKeyrings: Keyring[] | null = null;

	constructor() {
		this.secretKey = 'x123';
		this.secretSalt = new Uint8Array(2);
		this.secretIv = new Uint8Array(2);

		this.secretSalt.fill(24, 0, 1);
		this.secretSalt.fill(1, 1, 2);

		this.secretIv.fill(24, 0, 1);
		this.secretIv.fill(1, 1, 2);
	}

	public async lockProjects() {
		// clean up all keys that are a project
		for (const key of Object.keys(sessionStorage)) {
			if (key.startsWith('inf_project_')) {
				sessionStorage.removeItem(key);
			}
		}
		this.cachedKeyrings = null;
	}

	public async cleanUpOtherOpenedProjects(projectId: string) {
		// clean up all keys that are not related with current project
		for (const key of Object.keys(sessionStorage)) {
			if (key.startsWith('inf_project_') && !key.startsWith(`inf_project_${projectId}_`)) {
				sessionStorage.removeItem(key);
			}
		}
		this.cachedKeyrings = null;
	}

	public async setEpoch(projectId: string, epoch: string) {
		try {
			const encryptedValue = await cryptoService.encryptWithPassphrase(this.secretKey, epoch);
			sessionStorage.setItem(
				await this.generateKey(projectId, 'epoch'),
				btoa(JSON.stringify(encryptedValue))
			);
		} catch (error) {
			return;
		}
	}

	public async getEpoch(projectId: string): Promise<string | null> {
		try {
			const encryptedValue = sessionStorage.getItem(await this.generateKey(projectId, 'epoch'));
			if (!encryptedValue) {
				return null;
			}
			const epoch = await cryptoService.decryptWithPassphrase(
				this.secretKey,
				JSON.parse(atob(encryptedValue)) as SymmetricEncryptedData
			);
			return epoch;
		} catch (error) {
			return null;
		}
	}

	public async setItem(projectId: string, keyrings: Keyring[]) {
		try {
			const encryptedValue = await cryptoService.encryptWithPassphrase(
				this.secretKey,
				JSON.stringify(keyrings)
			);
			sessionStorage.setItem(
				await this.generateKey(projectId),
				btoa(JSON.stringify(encryptedValue))
			);
		} catch (error) {
			return;
		}
	}

	public async getItems(projectId: string): Promise<Keyring[] | null> {
		if (this.cachedKeyrings) {
			return this.cachedKeyrings;
		}

		try {
			const encryptedValue = sessionStorage.getItem(await this.generateKey(projectId));
			if (!encryptedValue) {
				return null;
			}
			this.cachedKeyrings = JSON.parse(
				await cryptoService.decryptWithPassphrase(this.secretKey, JSON.parse(atob(encryptedValue)))
			) as Keyring[];

			return this.cachedKeyrings;
		} catch (error) {
			return null;
		}
	}

	public async getItem(projectId: string, epoch: string): Promise<Keyring | null> {
		const keyrings = await this.getItems(projectId);
		if (!keyrings) {
			return null;
		}
		return keyrings.find((keyring) => keyring.epoch === epoch) || null;
	}

	public async removeItem(projectId: string) {
		try {
			sessionStorage.removeItem(await this.generateKey(projectId));
		} catch (error) {
			return;
		}
	}

	public clear() {
		try {
			sessionStorage.clear();
		} catch (error) {
			return;
		}
	}

	private async generateKey(projectId: string, extra?: string): Promise<string> {
		return (
			`inf_project_${projectId}_` +
			(
				await cryptoService.encryptWithPassphrase(
					this.secretKey,
					projectId,
					this.secretSalt,
					this.secretIv
				)
			).ciphertext +
			(extra || '')
		);
	}
}

export default new SecureKeyringSession();
