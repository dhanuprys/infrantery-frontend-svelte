<script lang="ts">
	import { page } from '$app/stores';
	import { projectService } from '$lib/services/project.service';
	import type { ProjectMemberResponse, InvitationResponse } from '$lib/types/api';
	import { onMount } from 'svelte';
	import { toast } from '$lib/components/ui/sonner';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Loader2, MoreVertical, Shield, UserPlus, Trash2, Edit2, RotateCcw, ArrowLeft, Users } from '@lucide/svelte';
	import InviteMemberDialog from '$lib/components/project/dialogs/InviteMemberDialog.svelte';
	import EditMemberDialog from '$lib/components/project/dialogs/EditMemberDialog.svelte';
	import { userStore } from '$lib/stores/userStore.svelte';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import { keyRotationService } from '$lib/services/keyRotationService';
	import secureKeyringSession from '$lib/services/secureKeyringSession';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { goto } from '$app/navigation';

	const projectId = $page.params.projectId ?? '';

	let members = $state<ProjectMemberResponse[]>([]);
	let invitations = $state<InvitationResponse[]>([]);
	let loadingMembers = $state(true);
	let loadingInvitations = $state(true);

	// Dialogs
	let isInviteOpen = $state(false);
	let isEditOpen = $state(false);
	let selectedMember = $state<ProjectMemberResponse | null>(null);

	// Alert Dialog State
	let isConfirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmAction = $state<() => void>(() => {});
	let cancelAction = $state<() => void>(() => isConfirmOpen = false);

	// Permissions
	const currentUser = $derived(userStore.user);
	const currentMember = $derived(members.find(m => m.user_id === currentUser?.id));
	const canManage = $derived(currentMember?.role === 'owner' || currentMember?.role === 'admin');
	const isOwner = $derived(currentMember?.role === 'owner');

	async function loadMembers() {
		loadingMembers = true;
		try {
			const res = await projectService.getMembers(projectId);
			members = res.data;
		} catch (err: any) {
			console.error('Failed to load members:', err);
			toast.error('Failed to load members');
		} finally {
			loadingMembers = false;
		}
	}

	async function loadInvitations() {
		loadingInvitations = true;
		try {
			// Load up to 100 pending invitations
			const res = await projectService.getInvitations(projectId, 1, 100);
			invitations = res.data;
		} catch (err: any) {
			// Invitations might fail if user doesn't have permission, which is expected
			if (err.response?.status !== 403) {
				console.error('Failed to load invitations:', err);
			}
			invitations = [];
		} finally {
			loadingInvitations = false;
		}
	}

	// Selection
	let selectedMemberIds = $state<Set<string>>(new Set());
	const allMemberIds = $derived(members.filter(m => m.user_id !== currentUser?.id).map(m => m.user_id));
	const isAllSelected = $derived(members.length > 1 && selectedMemberIds.size === allMemberIds.length);
	const isIndeterminate = $derived(selectedMemberIds.size > 0 && selectedMemberIds.size < allMemberIds.length);

	function toggleSelectAll() {
		if (isAllSelected) {
			selectedMemberIds = new Set();
		} else {
			selectedMemberIds = new Set(allMemberIds);
		}
	}

	function toggleSelection(userId: string) {
		const newSet = new Set(selectedMemberIds);
		if (newSet.has(userId)) {
			newSet.delete(userId);
		} else {
			newSet.add(userId);
		}
		selectedMemberIds = newSet;
	}

	function handleRemoveMember(userId: string) {
		confirmTitle = 'Remove Member';
		confirmMessage = 'Are you sure you want to remove this member? This will trigger a key rotation. You will be redirected to re-authorize after this action.';
		confirmAction = async () => {
			await executeRemoval([userId]);
		};
		isConfirmOpen = true;
	}

	function handleBulkRemove() {
		if (selectedMemberIds.size === 0) return;
		confirmTitle = 'Remove Members';
		confirmMessage = `Are you sure you want to remove ${selectedMemberIds.size} members? This will trigger a key rotation. You will be redirected to re-authorize after this action.`;
		confirmAction = async () => {
			await executeRemoval(Array.from(selectedMemberIds));
		};
		isConfirmOpen = true;
	}

	async function executeRemoval(userIdsToRemove: string[]) {
		try {
			toast.loading('Rotating project keys...');
			// 1. Rotate Keys (generate new epoch, re-encrypt for remaining members)
			await keyRotationService.rotateKeysForProject(projectId, members, userIdsToRemove);
			toast.success('Project keys rotated');

			// 2. Remove Members
			toast.loading(`Removing ${userIdsToRemove.length} member(s)...`);
			await Promise.all(userIdsToRemove.map(id => projectService.removeMember(projectId, id)));
			toast.success('Members removed');
			
			// 3. Lock Project & Redirect
			toast.loading('Locking project session...');
			await secureKeyringSession.lockProjects();
			goto(`/projects/${projectId}/authorize`, { replaceState: true });

		} catch (err: any) {
			console.error('Failed to remove members:', err);
			toast.error(err.response?.data?.error?.message || err.message || 'Failed to remove members');
			isConfirmOpen = false;
			toast.dismiss();
		}
	}

	function handleRevokeInvitation(invitationId: string) {
		confirmTitle = 'Revoke Invitation';
		confirmMessage = 'Are you sure you want to revoke this invitation? The link will no longer work.';
		confirmAction = async () => {
			try {
				await projectService.revokeInvitation(projectId, invitationId);
				toast.success('Invitation revoked');
				loadInvitations();
			} catch (err: any) {
				console.error('Failed to revoke invitation:', err);
				toast.error(err.response?.data?.error?.message || 'Failed to revoke invitation');
			} finally {
				isConfirmOpen = false;
			}
		};
		isConfirmOpen = true;
	}

	function openEdit(member: ProjectMemberResponse) {
		selectedMember = member;
		isEditOpen = true;
	}

	onMount(() => {
		loadMembers();
		loadInvitations();
	});

	function getInitials(name: string) {
		return name
			.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2);
	}
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader />
	<div class="container mx-auto h-full max-w-7xl space-y-8 p-8">
		<!-- Header -->
		<div class="flex items-center justify-between space-y-2">
			<div>
				<div class="flex flex-col gap-1">
					<Button
						variant="ghost"
						size="sm"
						href={`/projects/${projectId}`}
						class="-ml-3 w-fit text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft class="mr-2 h-4 w-4" />
						Back to Project
					</Button>
					<h2 class="text-3xl font-bold tracking-tight">Team Members</h2>
				</div>
				<p class="text-muted-foreground mt-2">Manage who has access to this project.</p>
			</div>
			{#if canManage}
				<Button onclick={() => isInviteOpen = true}>
					<UserPlus class="mr-2 h-4 w-4" />
					Invite Member
				</Button>
			{/if}
		</div>

		<!-- Members List -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Members</Card.Title>
				<Card.Description>People with access to this project.</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if loadingMembers}
					<div class="flex justify-center p-8">
						<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
					</div>
				{:else}
					{#if selectedMemberIds.size > 0}
						<div class="flex items-center justify-between rounded-md border bg-muted/50 px-4 py-2 mb-4">
							<span class="text-sm font-medium">{selectedMemberIds.size} selected</span>
							<Button variant="destructive" size="sm" onclick={handleBulkRemove}>
								<Trash2 class="mr-2 h-4 w-4" />
								Remove Selected
							</Button>
						</div>
					{/if}

					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head class="w-[30px]">
									{#if canManage}
										<Checkbox 
											checked={isAllSelected} 
											indeterminate={isIndeterminate}
											onCheckedChange={toggleSelectAll} 
										/>
									{/if}
								</Table.Head>
								<Table.Head>User</Table.Head>
								<Table.Head>Role</Table.Head>
								<Table.Head>Joined</Table.Head>
								<Table.Head class="w-[50px]"></Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each members as member (member.user_id)}
								<Table.Row>
									<Table.Cell>
										{#if canManage && member.user_id !== currentUser?.id}
											<Checkbox 
												checked={selectedMemberIds.has(member.user_id)} 
												onCheckedChange={() => toggleSelection(member.user_id)} 
											/>
										{/if}
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center gap-3">
											<Avatar.Root class="h-9 w-9">
												<Avatar.Fallback>{getInitials(member.user_name)}</Avatar.Fallback>
											</Avatar.Root>
											<div class="flex flex-col">
												<span class="font-medium">{member.user_name}</span>
												<span class="text-xs text-muted-foreground">{member.user_email}</span>
											</div>
										</div>
									</Table.Cell>
									<Table.Cell>
										<Badge variant={member.role === 'owner' ? 'default' : member.role === 'admin' ? 'secondary' : 'outline'}>
											{#if member.role === 'owner'}
												<Shield class="mr-1 h-3 w-3" />
											{/if}
											{member.role}
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										{new Date(member.created_at).toLocaleDateString()}
									</Table.Cell>
									<Table.Cell>
										{#if canManage && member.role !== 'owner' && member.user_id !== currentUser?.id}
											<DropdownMenu.Root>
												<DropdownMenu.Trigger class={buttonVariants({ variant: 'ghost', size: 'icon' }) + " h-8 w-8"}>
													<MoreVertical class="h-4 w-4" />
												</DropdownMenu.Trigger>
												<DropdownMenu.Content align="end">
													<DropdownMenu.Item onclick={() => openEdit(member)}>
														<Edit2 class="mr-2 h-4 w-4" />
														Edit Role
													</DropdownMenu.Item>
													<DropdownMenu.Item class="text-destructive focus:text-destructive" onclick={() => handleRemoveMember(member.user_id)}>
														<Trash2 class="mr-2 h-4 w-4" />
														Remove
													</DropdownMenu.Item>
												</DropdownMenu.Content>
											</DropdownMenu.Root>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Pending Invitations -->
		{#if canManage && (invitations.length > 0 || loadingInvitations)}
			<Card.Root>
				<Card.Header>
					<Card.Title>Pending Invitations</Card.Title>
					<Card.Description>Outstanding invitations that haven't been accepted yet.</Card.Description>
				</Card.Header>
				<Card.Content>
					{#if loadingInvitations}
						<div class="flex justify-center p-8">
							<Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
						</div>
					{:else}
						<Table.Root>
							<Table.Header>
								<Table.Row>
									<Table.Head>Invited By</Table.Head>
									<Table.Head>Role</Table.Head>
									<Table.Head>Created</Table.Head>
									<Table.Head class="w-[50px]"></Table.Head>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each invitations as invitation (invitation.id)}
									<Table.Row>
										<Table.Cell>
											<div class="flex items-center gap-2">
												<Avatar.Root class="h-6 w-6">
													<Avatar.Fallback>{getInitials(invitation.inviter_name)}</Avatar.Fallback>
												</Avatar.Root>
												<span>{invitation.inviter_name}</span>
											</div>
										</Table.Cell>
										<Table.Cell>
											<Badge variant="outline">{invitation.role}</Badge>
										</Table.Cell>
										<Table.Cell class="text-muted-foreground">
											{new Date(invitation.created_at).toLocaleDateString()}
										</Table.Cell>
										<Table.Cell>
											<Button variant="ghost" size="icon" class="h-8 w-8 text-destructive hover:text-destructive" onclick={() => handleRevokeInvitation(invitation.id)} title="Revoke Invitation">
												<RotateCcw class="h-4 w-4" />
											</Button>
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}
	</div>
</div>

<InviteMemberDialog 
	bind:open={isInviteOpen} 
	{projectId} 
	onSuccess={loadInvitations} 
/>

<EditMemberDialog 
	bind:open={isEditOpen} 
	{projectId} 
	member={selectedMember} 
	onSuccess={loadMembers} 
/>

<AlertDialog.Root bind:open={isConfirmOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>{confirmTitle}</AlertDialog.Title>
			<AlertDialog.Description>{confirmMessage}</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel onclick={cancelAction}>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action class="bg-destructive text-destructive-foreground hover:bg-destructive/90" onclick={confirmAction}>Continue</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
