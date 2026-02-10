// --- Interfaces for Type Safety ---
export interface SymmetricEncryptedData {
	ciphertext: string; // Base64
	iv: string; // Base64
	salt: string; // Base64
}

export interface KeyPairSet {
	publicKey: string;
	privateKey: string;
}

export class CryptoService {
	// --- UTILITY: ArrayBuffer <-> Base64 ---
	// These helpers ensure you can actually save the data to a DB or JSON
	private readonly DELIMITER = '<delimiter>';

	formatEncryptedData(data: SymmetricEncryptedData): string {
		return `${data.ciphertext}${this.DELIMITER}${data.salt}${this.DELIMITER}${data.iv}`;
	}

	parseEncryptedData(formatted: string): SymmetricEncryptedData {
		const parts = formatted.split(this.DELIMITER);
		if (parts.length !== 3) {
			throw new Error('Invalid encrypted data format');
		}
		return {
			ciphertext: parts[0],
			salt: parts[1],
			iv: parts[2]
		};
	}

	private arrayBufferToBase64(buffer: ArrayBuffer): string {
		let binary = '';
		const bytes = new Uint8Array(buffer);
		const len = bytes.byteLength;
		for (let i = 0; i < len; i++) {
			binary += String.fromCharCode(bytes[i]);
		}
		return window.btoa(binary);
	}

	private base64ToArrayBuffer(base64: string): ArrayBuffer {
		const binaryString = window.atob(base64);
		const len = binaryString.length;
		const bytes = new Uint8Array(len);
		for (let i = 0; i < len; i++) {
			bytes[i] = binaryString.charCodeAt(i);
		}
		return bytes.buffer;
	}

	// --- PRIVATE KEY HELPERS ---

	private async exportKey(key: CryptoKey): Promise<string> {
		const format = key.type === 'public' ? 'spki' : 'pkcs8';
		const exported = await window.crypto.subtle.exportKey(format, key);
		return this.arrayBufferToBase64(exported);
	}

	private async importKey(
		keyBase64: string,
		format: 'spki' | 'pkcs8',
		algorithm: RsaHashedImportParams,
		usages: KeyUsage[]
	): Promise<CryptoKey> {
		const keyBuffer = this.base64ToArrayBuffer(keyBase64);
		return await window.crypto.subtle.importKey(format, keyBuffer, algorithm, true, usages);
	}

	// --- 1. GENERATE KEYS ---

	// For Encryption (RSA-OAEP)
	async generateEncryptionKeys(): Promise<KeyPairSet> {
		const keyPair = await window.crypto.subtle.generateKey(
			{
				name: 'RSA-OAEP',
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: 'SHA-256'
			},
			true,
			['encrypt', 'decrypt']
		);
		return {
			publicKey: await this.exportKey(keyPair.publicKey),
			privateKey: await this.exportKey(keyPair.privateKey)
		};
	}

	// For Signing (RSA-PSS) - distinct from encryption keys for security
	async generateSigningKeys(): Promise<KeyPairSet> {
		const keyPair = await window.crypto.subtle.generateKey(
			{
				name: 'RSA-PSS',
				modulusLength: 4096,
				publicExponent: new Uint8Array([1, 0, 1]),
				hash: 'SHA-256'
			},
			true,
			['sign', 'verify']
		);
		return {
			publicKey: await this.exportKey(keyPair.publicKey),
			privateKey: await this.exportKey(keyPair.privateKey)
		};
	}

	// --- 2. ASYMMETRIC ENCRYPTION (Hybrid: RSA-OAEP + AES-GCM) ---

	private readonly HYBRID_PREFIX = 'HYBRID|';
	private readonly HYBRID_DELIMITER = '|';

	async encryptWithPublicKey(publicKeyBase64: string, plaintext: string): Promise<string> {
		// 1. Generate ephemeral AES key
		const aesKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
			'encrypt',
			'decrypt'
		]);

		// 2. Encrypt plaintext with AES
		const iv = window.crypto.getRandomValues(new Uint8Array(12));
		const encodedData = new TextEncoder().encode(plaintext);
		const ciphertextBuffer = await window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: iv },
			aesKey,
			encodedData
		);

		// 3. Export AES key
		const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);

		// 4. Encrypt AES key with RSA Public Key
		const publicKey = await this.importKey(
			publicKeyBase64,
			'spki',
			{ name: 'RSA-OAEP', hash: 'SHA-256' },
			['encrypt']
		);

		const encryptedKeyBuffer = await window.crypto.subtle.encrypt(
			{ name: 'RSA-OAEP' },
			publicKey,
			rawAesKey
		);

		// 5. Format
		const b64Key = this.arrayBufferToBase64(encryptedKeyBuffer);
		const b64IV = this.arrayBufferToBase64(iv.buffer as ArrayBuffer);
		const b64Cipher = this.arrayBufferToBase64(ciphertextBuffer);

		return `${this.HYBRID_PREFIX}${b64Key}${this.HYBRID_DELIMITER}${b64IV}${this.HYBRID_DELIMITER}${b64Cipher}`;
	}

	async decryptWithPrivateKey(privateKeyBase64: string, ciphertextBase64: string): Promise<string> {
		// Check for Hybrid format
		if (ciphertextBase64.startsWith(this.HYBRID_PREFIX)) {
			try {
				const parts = ciphertextBase64
					.substring(this.HYBRID_PREFIX.length)
					.split(this.HYBRID_DELIMITER);
				if (parts.length !== 3) throw new Error('Invalid hybrid encryption format');

				const [b64EncryptedKey, b64IV, b64Cipher] = parts;

				// 1. Decrypt AES Key with RSA Private Key
				const privateKey = await this.importKey(
					privateKeyBase64,
					'pkcs8',
					{ name: 'RSA-OAEP', hash: 'SHA-256' },
					['decrypt']
				);
				const encryptedKeyBuffer = this.base64ToArrayBuffer(b64EncryptedKey);
				const rawAesKeyBuffer = await window.crypto.subtle.decrypt(
					{ name: 'RSA-OAEP' },
					privateKey,
					encryptedKeyBuffer
				);

				// 2. Import AES Key
				const aesKey = await window.crypto.subtle.importKey(
					'raw',
					rawAesKeyBuffer,
					{ name: 'AES-GCM', length: 256 },
					false,
					['decrypt']
				);

				// 3. Decrypt Data
				const iv = this.base64ToArrayBuffer(b64IV);
				const ciphertext = this.base64ToArrayBuffer(b64Cipher);

				const decryptedBuffer = await window.crypto.subtle.decrypt(
					{ name: 'AES-GCM', iv: iv },
					aesKey,
					ciphertext
				);

				return new TextDecoder().decode(decryptedBuffer);
			} catch (err) {
				console.error('Hybrid decryption failed, attempting legacy:', err);
				// Fallthrough to try legacy, though unlikely to work if prefix was present but data corrupt
				// But safety first.
				throw err;
			}
		}

		// Fallback to Legacy Raw RSA
		const privateKey = await this.importKey(
			privateKeyBase64,
			'pkcs8',
			{ name: 'RSA-OAEP', hash: 'SHA-256' },
			['decrypt']
		);

		const encryptedData = this.base64ToArrayBuffer(ciphertextBase64);
		const decryptedBuffer = await window.crypto.subtle.decrypt(
			{ name: 'RSA-OAEP' },
			privateKey,
			encryptedData
		);
		return new TextDecoder().decode(decryptedBuffer);
	}

	// --- 3. SYMMETRIC ENCRYPTION (Passphrase) ---

	async encryptWithPassphrase(
		passphrase: string,
		plaintext: string,
		salt?: Uint8Array,
		iv?: Uint8Array<ArrayBuffer>
	): Promise<SymmetricEncryptedData> {
		// 1. Generate random Salt and IV
		salt = salt ?? window.crypto.getRandomValues(new Uint8Array(16));
		iv = iv ?? window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

		// 2. Derive Key
		const key = await this.deriveKey(passphrase, salt);

		// 3. Encrypt
		const encodedData = new TextEncoder().encode(plaintext);
		const encryptedBuffer = await window.crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: iv },
			key,
			encodedData as unknown as BufferSource
		);

		// 4. Return all parts encoded as Base64
		return {
			ciphertext: this.arrayBufferToBase64(encryptedBuffer),
			iv: this.arrayBufferToBase64(iv.buffer as ArrayBuffer),
			salt: this.arrayBufferToBase64(salt.buffer as ArrayBuffer)
		};
	}

	async decryptWithPassphrase(passphrase: string, data: SymmetricEncryptedData): Promise<string> {
		// 1. Convert Base64 back to Buffers
		const saltBuffer = this.base64ToArrayBuffer(data.salt);
		const ivBuffer = this.base64ToArrayBuffer(data.iv);
		const ciphertextBuffer = this.base64ToArrayBuffer(data.ciphertext);

		// 2. Derive the same key using the salt
		const key = await this.deriveKey(passphrase, new Uint8Array(saltBuffer));

		// 3. Decrypt
		const decryptedBuffer = await window.crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: ivBuffer },
			key,
			ciphertextBuffer
		);

		return new TextDecoder().decode(decryptedBuffer);
	}

	// --- 4. SIGNATURES (Private Key) ---

	async signData(privateKeyBase64: string, data: string): Promise<string> {
		const privateKey = await this.importKey(
			privateKeyBase64,
			'pkcs8',
			{ name: 'RSA-PSS', hash: 'SHA-256' },
			['sign']
		);

		const encodedData = new TextEncoder().encode(data);
		const signatureBuffer = await window.crypto.subtle.sign(
			{ name: 'RSA-PSS', saltLength: 32 }, // Salt length should match hash length (SHA-256 = 32 bytes)
			privateKey,
			encodedData
		);
		return this.arrayBufferToBase64(signatureBuffer);
	}

	async verifySignature(
		publicKeyBase64: string,
		signatureBase64: string,
		data: string
	): Promise<boolean> {
		const publicKey = await this.importKey(
			publicKeyBase64,
			'spki',
			{ name: 'RSA-PSS', hash: 'SHA-256' },
			['verify']
		);

		const signatureBuffer = this.base64ToArrayBuffer(signatureBase64);
		const encodedData = new TextEncoder().encode(data);

		return await window.crypto.subtle.verify(
			{ name: 'RSA-PSS', saltLength: 32 },
			publicKey,
			signatureBuffer,
			encodedData
		);
	}

	// --- PRIVATE HELPER: PBKDF2 ---
	private async deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
		const keyMaterial = await window.crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(passphrase),
			{ name: 'PBKDF2' },
			false,
			['deriveKey']
		);

		return await window.crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: salt as unknown as BufferSource,
				iterations: 600000, // OWASP recommended for 2024/2025+
				hash: 'SHA-256'
			},
			keyMaterial,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
	}
}

export const cryptoService = new CryptoService();
