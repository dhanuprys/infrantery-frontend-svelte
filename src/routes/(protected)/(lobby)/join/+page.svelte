<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { invitationService } from '$lib/services/invitation.service';
	import type { InvitationResponse } from '$lib/types/api';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { 
		Plus, 
		Mail, 
		ShieldCheck, 
		User, 
		ArrowRight, 
		LayoutGrid 
	} from '@lucide/svelte';
	import JoinInvitationDialog from '$lib/components/invitation/JoinInvitationDialog.svelte';

	let invitations = $state<InvitationResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let isJoinDialogOpen = $state(false);
	let selectedInvitationId = $state('');

	async function loadInvitations() {
		loading = true;
		error = null;
		try {
			const res = await invitationService.getUserInvitations();
			invitations = res.data || [];
		} catch (err: any) {
			console.error('Failed to load invitations:', err);
			error = 'Failed to load invitations.';
		} finally {
			loading = false;
		}
	}

	function openJoinDialog(invId = '') {
		selectedInvitationId = invId;
		isJoinDialogOpen = true;
	}

	onMount(() => {
		loadInvitations();

		// Check for URL invitation param
		const urlInvId = $page.url.searchParams.get('invitation');
		if (urlInvId) {
			openJoinDialog(urlInvId);
		}
	});
</script>

<div class="container mx-auto h-full max-w-7xl space-y-8 p-8">
	<!-- Header Section -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight">Invitations</h2>
			<p class="text-muted-foreground">Manage and accept your pending project invitations.</p>
		</div>
		<Button onclick={() => openJoinDialog()}>
			<Plus class="mr-2 h-4 w-4" />
			Join by ID
		</Button>
	</div>

	<!-- Invitations Grid -->
	<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
		{#if loading}
			{#each Array(4) as _}
				<Card.Root class="overflow-hidden">
					<Card.Header class="gap-4 border-b bg-muted/40 p-4">
						<div class="flex items-center justify-between">
							<Skeleton class="h-4 w-20" />
							<Skeleton class="h-4 w-4 rounded-full" />
						</div>
						<Skeleton class="h-6 w-3/4" />
					</Card.Header>
					<Card.Content class="p-4">
						<Skeleton class="mb-2 h-4 w-full" />
						<Skeleton class="h-4 w-1/2" />
					</Card.Content>
					<Card.Footer class="border-t bg-muted/10 p-4">
						<Skeleton class="h-9 w-full" />
					</Card.Footer>
				</Card.Root>
			{/each}
		{:else if error}
			<div class="col-span-full flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center">
				<p class="mb-4 font-medium text-destructive">{error}</p>
				<Button variant="outline" onclick={loadInvitations}>Retry</Button>
			</div>
		{:else if invitations.length === 0}
			<div class="col-span-full">
				<Card.Root class="flex min-h-[400px] flex-col items-center justify-center border-dashed bg-muted/30 p-8 text-center">
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Mail class="h-8 w-8 text-primary" />
					</div>
					<h3 class="text-xl font-semibold">No pending invitations</h3>
					<p class="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
						You don't have any pending invitations. You can join a project using an Invitation ID if you have one.
					</p>
					<Button onclick={() => openJoinDialog()} size="lg">
						Join with ID
					</Button>
				</Card.Root>
			</div>
		{:else}
			{#each invitations as inv (inv.id)}
				<Card.Root class="group flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-lg">
					<Card.Header class="space-y-3 pb-3">
						<div class="flex items-start justify-between">
							<Badge variant="secondary" class="flex items-center gap-1 font-normal text-muted-foreground">
								<ShieldCheck class="h-3 w-3 text-green-500" />
								Encrypted
							</Badge>
							<Badge variant="outline" class="capitalize">{inv.role}</Badge>
						</div>
						<Card.Title class="line-clamp-1 text-xl font-bold">{inv.project_name}</Card.Title>
					</Card.Header>

					<Card.Content class="pt-0 pb-3">
						<div class="mt-2 space-y-2 text-sm text-muted-foreground">
							<div class="flex items-center gap-2">
								<User class="h-4 w-4 opacity-70" />
								<span>Invited by <span class="font-medium text-foreground">{inv.inviter_name}</span></span>
							</div>
							<div class="flex items-center gap-2">
								<Mail class="h-4 w-4 opacity-70" />
								<span>{new Date(inv.created_at).toLocaleDateString()}</span>
							</div>
						</div>
					</Card.Content>

					<Card.Footer class="border-t bg-muted/10 pt-3">
						<Button onclick={() => openJoinDialog(inv.id)} class="w-full transition-colors">
							Review & Join
							<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		{/if}
	</div>
</div>

<JoinInvitationDialog 
	bind:open={isJoinDialogOpen} 
	initialInvitationId={selectedInvitationId}
	onSuccess={loadInvitations}
/>
