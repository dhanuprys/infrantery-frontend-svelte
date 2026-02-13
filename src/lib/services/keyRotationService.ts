import { cryptoService } from '$lib/services/cryptoService';
import type { ProjectMemberResponse } from '$lib/types/api';
import { projectService } from './project.service';

export const keyRotationService = {
	/**
	 * Rotates keys for a project by:
	 * 1. Generating a new Key Epoch
	 * 2. Generating new Project Passphrase & Signing Keys
	 * 3. Re-encrypting these for all *remaining* members
	 * 4. Submitting to backend
	 */
	async rotateKeysForProject(
		projectId: string,
		currentMembers: ProjectMemberResponse[],
		excludedUserIds: string[] // The users being removed
	): Promise<void> {
		// 1. Filter remaining members
		const remainingMembers = currentMembers.filter((m) => !excludedUserIds.includes(m.user_id));

		if (remainingMembers.length === 0) {
			console.warn('No remaining members to rotate keys for. Project might be inaccessible.');
			return; // Or maybe we should still rotate if the owner is leaving? But usually owner removal checks prevent this.
		}

		// 2. Generate New Security Material
		const newKeyEpoch = Date.now().toString();
		const newProjectPassphrase =
			window.crypto.randomUUID().replace(/-/g, '') + window.crypto.randomUUID().replace(/-/g, ''); // 64 chars hex

		const newSigningKeys = await cryptoService.generateSigningKeys();

		// 3. Prepare Updates for Each Member
		const updates = await Promise.all(
			remainingMembers.map(async (member) => {
				if (!member.public_key) {
					console.error(`Member ${member.user_id} has no public key. Skipping rotation for them.`);
					throw new Error(
						`Member ${member.user_name} has no public key. Cannot rotate project keys securely.`
					);
				}

				// Encrypt new passphrase with member's public key
				const encryptedPassphrase = await cryptoService.encryptWithPublicKey(
					member.public_key,
					newProjectPassphrase
				);

				// Encrypt new signing private key with MEMBER'S public key
				// Wait, "SecretSigningPrivateKey" in keyring is the PROJECT'S signing key, encrypted.
				// It should be encrypted with... the Project Passphrase?
				// NO. The `Keyring` structure stores everything encrypted for the User.
				// `SecretPassphrase`: Project Passphrase encrypted with User's Public Key.
				// `SecretSigningPrivateKey`: Project Signing Private Key encrypted with...
				// In `project-create-dialog.svelte`:
				// 		const encryptedSignKey = await cryptoService.encryptWithPublicKey(
				// 			userEncKeys.publicKey,
				// 			signKeys.privateKey
				// 		);
				// It is encrypted with the USER'S public key.

				const encryptedSigningKey = await cryptoService.encryptWithPublicKey(
					member.public_key,
					newSigningKeys.privateKey
				);

				return {
					user_id: member.user_id,
					encrypted_passphrase: encryptedPassphrase,
					encrypted_signing_key: encryptedSigningKey,
					signing_public_key: newSigningKeys.publicKey // This is the same for everyone in this epoch
				};
			})
		);

		// 4. Submit
		await projectService.rotateProjectKeys(projectId, newKeyEpoch, updates);
	}
};
