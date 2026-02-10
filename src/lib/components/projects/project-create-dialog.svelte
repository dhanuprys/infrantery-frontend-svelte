<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { cryptoService } from '$lib/services/cryptoService';
	import { projectService } from '$lib/services/project.service';
	import { toast } from '$lib/components/ui/sonner';

	let { open = $bindable(false), onSuccess } = $props();

	let loading = $state(false);
	let name = $state('');
	let description = $state('');
	let masterPassword = $state('');
	let error = $state<string | null>(null);

	const validations = $derived({
		length: masterPassword.length >= 8,
		uppercase: /[A-Z]/.test(masterPassword),
		lowercase: /[a-z]/.test(masterPassword),
		number: /[0-9]/.test(masterPassword),
		special: /[^A-Za-z0-9]/.test(masterPassword)
	});

	const isValid = $derived(Object.values(validations).every(Boolean));

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;
		error = null;

		try {
			// 1. Generate Keys
			const encKeys = await cryptoService.generateEncryptionKeys();
			const signKeys = await cryptoService.generateSigningKeys();

			// 2. Encrypt Private Keys with Master Password
			const encryptedEncKeyData = await cryptoService.encryptWithPassphrase(
				masterPassword,
				encKeys.privateKey
			);
			const encryptedSignKeyData = await cryptoService.encryptWithPassphrase(
				masterPassword,
				signKeys.privateKey
			);

			// 3. Format Encrypted Keys
			const formattedEncKey = cryptoService.formatEncryptedData(encryptedEncKeyData);
			const formattedSignKey = cryptoService.formatEncryptedData(encryptedSignKeyData);

			// 4. Create Project
			await projectService.createProject({
				name,
				description,
				encryption_public_key: encKeys.publicKey,
				signing_public_key: signKeys.publicKey,
				secret_encrypted_private_key: formattedEncKey,
				secret_signing_private_key: formattedSignKey
			});

			toast.success('Project created successfully');
			open = false;
			resetForm();
			if (onSuccess) onSuccess();
		} catch (err: any) {
			console.error('Failed to create project:', err);
			error = err.response?.data?.error?.message || 'Failed to create project';
			toast.error(error as string);
		} finally {
			loading = false;
		}
	}

	function resetForm() {
		name = '';
		description = '';
		masterPassword = '';
		error = null;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Create New Project</Dialog.Title>
			<Dialog.Description>
				Create a secure project with client-side encryption. Your master password encrypts the
				private keys.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="grid gap-4 py-4">
			{#if error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{error}
				</div>
			{/if}

			<div class="grid gap-2">
				<Label for="name">Project Name</Label>
				<Input id="name" bind:value={name} placeholder="My Secure Project" required />
			</div>

			<div class="grid gap-2">
				<Label for="description">Description (Optional)</Label>
				<Textarea id="description" bind:value={description} placeholder="Project description..." />
			</div>

			<div class="grid gap-2">
				<Label for="master-password">Master Password</Label>
				<Input
					id="master-password"
					type="password"
					bind:value={masterPassword}
					placeholder="Enter a strong master password"
					required
				/>

				<div class="space-y-2 rounded-md border bg-muted/30 p-3 text-xs">
					<p class="mb-2 font-medium text-muted-foreground">Password Requirements:</p>
					<ul class="space-y-1">
						<li
							class="flex items-center gap-2 {validations.length
								? 'text-green-500'
								: 'text-muted-foreground'}"
						>
							<div
								class="h-1.5 w-1.5 rounded-full {validations.length
									? 'bg-green-500'
									: 'bg-muted-foreground'}"
							></div>
							At least 8 characters
						</li>
						<li
							class="flex items-center gap-2 {validations.uppercase
								? 'text-green-500'
								: 'text-muted-foreground'}"
						>
							<div
								class="h-1.5 w-1.5 rounded-full {validations.uppercase
									? 'bg-green-500'
									: 'bg-muted-foreground'}"
							></div>
							Contains uppercase letter
						</li>
						<li
							class="flex items-center gap-2 {validations.lowercase
								? 'text-green-500'
								: 'text-muted-foreground'}"
						>
							<div
								class="h-1.5 w-1.5 rounded-full {validations.lowercase
									? 'bg-green-500'
									: 'bg-muted-foreground'}"
							></div>
							Contains lowercase letter
						</li>
						<li
							class="flex items-center gap-2 {validations.number
								? 'text-green-500'
								: 'text-muted-foreground'}"
						>
							<div
								class="h-1.5 w-1.5 rounded-full {validations.number
									? 'bg-green-500'
									: 'bg-muted-foreground'}"
							></div>
							Contains number
						</li>
						<li
							class="flex items-center gap-2 {validations.special
								? 'text-green-500'
								: 'text-muted-foreground'}"
						>
							<div
								class="h-1.5 w-1.5 rounded-full {validations.special
									? 'bg-green-500'
									: 'bg-muted-foreground'}"
							></div>
							Contains special character
						</li>
					</ul>
				</div>

				<p class="mt-1 text-xs text-muted-foreground">
					This password is used to encrypt your project's private keys. <strong
						class="text-destructive">It is never sent to the server.</strong
					> If you lose it, you lose access to your project data.
				</p>
			</div>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (open = false)}>Cancel</Button>
				<Button type="submit" disabled={loading || !isValid}>
					{loading ? 'Creating...' : 'Create Project'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
