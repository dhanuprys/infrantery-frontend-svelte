import { cryptoService } from './cryptoService';

class secureKeyringSession {
	private secretKey: string;
	private secretSalt: Uint8Array<ArrayBuffer>;
	private secretIv: Uint8Array<ArrayBuffer>;

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
	}

	public async cleanUpOtherOpenedProjects(projectId: string) {
		// clean up all keys that are not related with current project
		for (const key of Object.keys(sessionStorage)) {
			if (key.startsWith('inf_project_') && !key.startsWith(`inf_project_${projectId}_`)) {
				sessionStorage.removeItem(key);
			}
		}
	}

	public async setItem(epoch: string, projectId: string, value: string) {
		try {
			const encryptedValue = await cryptoService.encryptWithPassphrase(this.secretKey, value);
			sessionStorage.setItem(
				await this.generateKey(epoch, projectId),
				btoa(JSON.stringify(encryptedValue))
			);
		} catch (error) {
			return;
		}
	}

	public async getItem(epoch: string, projectId: string) {
		try {
			const encryptedValue = sessionStorage.getItem(await this.generateKey(epoch, projectId));
			if (!encryptedValue) {
				return null;
			}
			return await cryptoService.decryptWithPassphrase(
				this.secretKey,
				JSON.parse(atob(encryptedValue))
			);
		} catch (error) {
			return null;
		}
	}

	public async removeItem(epoch: string, projectId: string) {
		try {
			sessionStorage.removeItem(await this.generateKey(epoch, projectId));
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

	private async generateKey(epoch: string, projectId: string): Promise<string> {
		return (
			`inf_project_${projectId}_` +
			(
				await cryptoService.encryptWithPassphrase(
					this.secretKey,
					`${epoch}:${projectId}`,
					this.secretSalt,
					this.secretIv
				)
			).ciphertext
		);
	}
}

export default new secureKeyringSession();
