<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Alert from '$lib/components/ui/alert';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { projectService } from '$lib/services/project.service';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';
	import { cryptoService } from '$lib/services/cryptoService';
	import { toast } from '$lib/components/ui/sonner';
	import { Copy, Check, ShieldAlert, Loader2, Search, X } from '@lucide/svelte';
	import { page } from '$app/stores';
	import type { UserSearchResponse } from '$lib/types/api';

	let { open = $bindable(false), projectId, onSuccess } = $props();

	let loading = $state(false);
	let role = $state({ value: 'editor', label: 'Editor' });
	
	// Pre-defined roles
	const roles = [
		{ value: 'owner', label: 'Owner (Full Access)' },
		{ value: 'editor', label: 'Editor (Read & Write)' },
		{ value: 'viewer', label: 'Viewer (Read Only)' }
	];

	const rolePresets: Record<string, string[]> = {
		owner: [
			'view_diagram', 'edit_diagram',
			'view_note', 'edit_note',
			'view_vault', 'edit_vault',
			'manage_project'
		],
		editor: [
			'view_diagram', 'edit_diagram',
			'view_note', 'edit_note',
			'view_vault', 'edit_vault'
		],
		viewer: [
			'view_diagram',
			'view_note'
		]
	};

	// Search state
	let searchQuery = $state('');
	let searchResults = $state<UserSearchResponse[]>([]);
	let isSearching = $state(false);
	let selectedUser = $state<UserSearchResponse | null>(null);
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Result state
	let invitationId = $state('');
	let invitationPassword = $state('');
	let copiedId = $state(false);
	let copiedPassword = $state(false);

	function handleSearch(e: Event) {
		const query = (e.target as HTMLInputElement).value;
		searchQuery = query;
		
		clearTimeout(searchTimeout);
		if (!query || query.length < 2) {
			searchResults = [];
			return;
		}

		isSearching = true;
		searchTimeout = setTimeout(async () => {
			try {
				const res = await projectService.searchUsers(query);
				searchResults = res.data;
			} catch (err) {
				console.error('Search failed:', err);
			} finally {
				isSearching = false;
			}
		}, 300);
	}

	function selectUser(user: UserSearchResponse) {
		selectedUser = user;
		searchQuery = '';
		searchResults = [];
	}

	function clearSelectedUser() {
		selectedUser = null;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		loading = true;

		try {
			// 1. Get decrypted keyrings from session
			const keyrings = projectSessionStore.keyrings;
			if (!keyrings || keyrings.length === 0) {
				throw new Error('Project keyrings not available. Please refresh the page.');
			}

			// 2. Generate random exchange password
			const exchangePassword = window.crypto.randomUUID().replace(/-/g, '') + 
				window.crypto.randomUUID().replace(/-/g, ''); // 64 chars hex

			// 3. Encrypt keyrings with exchange password
			const encryptedKeyrings = await cryptoService.encryptWithPassphrase(
				exchangePassword,
				JSON.stringify(keyrings)
			);
			const formattedEncryptedKeyrings = cryptoService.formatEncryptedData(encryptedKeyrings);

			// 4. Create Invitation
			const response = await projectService.createInvitation(projectId, {
				role: role.value,
				permissions: rolePresets[role.value] || [], 
				encrypted_keyrings: formattedEncryptedKeyrings,
				invitee_user_id: selectedUser?.id
			});

			// 5. Show Result
			invitationId = response.data.invitation_id;
			invitationPassword = exchangePassword;
			
			toast.success('Invitation created successfully');
			if (onSuccess) onSuccess();
		} catch (err: any) {
			console.error('Failed to create invitation:', err);
			toast.error(err.response?.data?.error?.message || 'Failed to generate invitation');
		} finally {
			loading = false;
		}
	}

	function copyId() {
		navigator.clipboard.writeText(invitationId);
		copiedId = true;
		toast.success('ID copied');
		setTimeout(() => (copiedId = false), 2000);
	}

	function copyPassword() {
		navigator.clipboard.writeText(invitationPassword);
		copiedPassword = true;
		toast.success('Password copied');
		setTimeout(() => (copiedPassword = false), 2000);
	}

		function reset() {
		invitationId = '';
		invitationPassword = '';
		role = { value: 'editor', label: 'Editor' };
		loading = false;
		selectedUser = null;
		searchQuery = '';
		searchResults = [];
	}

	// Reset when dialog opens/closes
	$effect(() => {
		if (!open) {
			setTimeout(reset, 300); // Reset after transition
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Invite Member</Dialog.Title>
			<Dialog.Description>
				Generate a secure invitation code. The recipient will need both the ID and the Password to join.
			</Dialog.Description>
		</Dialog.Header>

		{#if invitationId}
			<div class="space-y-6 py-4">
				<Alert.Root variant="default" class="bg-green-50 border-green-200 text-green-900">
					<Check class="h-4 w-4 text-green-600" />
					<Alert.Title class="text-green-900">Invitation Ready!</Alert.Title>
					<Alert.Description class="text-green-700">
						Share these credentials securely. 
						{#if selectedUser}
							Assigned to <strong>{selectedUser.name}</strong>.
						{/if}
					</Alert.Description>
				</Alert.Root>

				<div class="grid gap-4">
					<div class="space-y-2">
						<Label for="invitation-id">Invitation ID</Label>
						<div class="flex gap-2">
							<Input id="invitation-id" value={invitationId} readonly class="font-mono" />
							<Button variant="outline" size="icon" onclick={copyId}>
								{#if copiedId}
									<Check class="h-4 w-4" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</Button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="invitation-password">Invitation Password</Label>
						<div class="flex gap-2">
							<Input id="invitation-password" value={invitationPassword} readonly class="font-mono text-xs" />
							<Button variant="outline" size="icon" onclick={copyPassword}>
								{#if copiedPassword}
									<Check class="h-4 w-4" />
								{:else}
									<Copy class="h-4 w-4" />
								{/if}
							</Button>
						</div>
					</div>
				</div>

				<Alert.Root variant="destructive">
					<ShieldAlert class="h-4 w-4" />
					<Alert.Title>Important Security Note</Alert.Title>
					<Alert.Description>
						This password is the <strong>encryption key</strong>. It is NOT stored by the server. 
						If you lose it, you will need to generate a new invitation.
					</Alert.Description>
				</Alert.Root>
			</div>
			
			<Dialog.Footer>
				<Button onclick={() => open = false}>Done</Button>
			</Dialog.Footer>
		{:else}
			<form onsubmit={handleSubmit} class="space-y-4 py-4">
				<!-- User Search -->
				<div class="space-y-2 relative">
					<Label>User (Optional)</Label>
					{#if selectedUser}
						<div class="flex items-center justify-between p-2 border rounded-md bg-muted/50">
							<div class="flex flex-col">
								<span class="font-medium text-sm">{selectedUser.name}</span>
								<span class="text-xs text-muted-foreground">{selectedUser.email}</span>
							</div>
							<Button variant="ghost" size="icon" class="h-8 w-8" onclick={clearSelectedUser}>
								<X class="h-4 w-4" />
							</Button>
						</div>
					{:else}
						<div class="relative">
							<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
							<Input 
								placeholder="Search by name or email..." 
								class="pl-9" 
								value={searchQuery}
								oninput={handleSearch}
							/>
						</div>
						
						{#if searchResults.length > 0}
							<div class="absolute w-full z-10 top-full mt-1 border rounded-md bg-popover shadow-md overflow-hidden animate-in fade-in-0 zoom-in-95">
								<div class="max-h-[200px] overflow-y-auto p-1">
									{#each searchResults as user}
										<button
											type="button"
											class="w-full flex flex-col items-start px-3 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground text-left"
											onclick={() => selectUser(user)}
										>
											<span class="font-medium">{user.name}</span>
											<span class="text-xs text-muted-foreground">{user.email}</span>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					{/if}
					<p class="text-[0.8rem] text-muted-foreground">
						Assign this invitation to a specific user. They will see it in their dashboard.
					</p>
				</div>

				<div class="space-y-2">
					<Label>Role</Label>
					<Select.Root type="single" bind:value={role.value}>
						<Select.Trigger>
							{roles.find(r => r.value === role.value)?.label ?? 'Select a role'}
						</Select.Trigger>
						<Select.Content>
							{#each roles as r}
								<Select.Item value={r.value} label={r.label}>{r.label}</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<p class="text-[0.8rem] text-muted-foreground">
						Admins can manage members and settings. Members can edit content. Viewers can only read.
					</p>
				</div>

				<Dialog.Footer>
					<Button type="button" variant="outline" onclick={() => open = false}>Cancel</Button>
					<Button type="submit" disabled={loading}>
						{#if loading}
							<Loader2 class="mr-2 h-4 w-4 animate-spin" />
							Generating...
						{:else}
							Generate Invitation
						{/if}
					</Button>
				</Dialog.Footer>
			</form>
		{/if}
	</Dialog.Content>
</Dialog.Root>
