<script lang="ts">
	import { onMount } from 'svelte';
	import { projectService } from '$lib/services/project.service';
	import type { ProjectResponse } from '$lib/types/api';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import {
		Plus,
		ArrowRight,
		Search,
		LayoutGrid,
		Clock,
		ShieldCheck,
		MoreVertical,
		Upload
	} from '@lucide/svelte';
	import ProjectCreateDialog from '$lib/components/projects/project-create-dialog.svelte';
	import RestoreDialog from '$lib/components/projects/restore-dialog.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';

	let projects = $state<ProjectResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isCreateDialogOpen = $state(false);
	let isRestoreDialogOpen = $state(false);
	let searchQuery = $state('');

	async function loadProjects() {
		loading = true;
		error = null;
		try {
			const res = await projectService.getProjects();
			projects = res?.data || [];
		} catch (err: any) {
			console.error('Failed to load projects:', err);
			error = 'Failed to load projects. Please try again.';
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadProjects();
	});

	function handleCreateSuccess() {
		loadProjects();
	}

	const filteredProjects = $derived(
		projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
	);
</script>

<div class="container mx-auto h-full max-w-7xl space-y-8 p-8">
	<!-- Header Section -->
	<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div class="space-y-1">
			<h2 class="text-3xl font-bold tracking-tight">Projects</h2>
			<p class="text-muted-foreground">Manage and collaborate on your secure projects.</p>
		</div>
		<div class="flex items-center gap-2">
			<div class="relative w-full md:w-64">
				<Search class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder="Search projects..."
					class="pl-9"
					bind:value={searchQuery}
				/>
			</div>
			<Button variant="outline" onclick={() => (isRestoreDialogOpen = true)}>
				<Upload class="mr-2 h-4 w-4" />
				Restore
			</Button>
			<Button onclick={() => (isCreateDialogOpen = true)}>
				<Plus class="mr-2 h-4 w-4" />
				New Project
			</Button>
		</div>
	</div>

	<!-- Projects Grid -->
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
						<Skeleton class="mb-4 h-4 w-full" />
						<div class="flex gap-2">
							<Skeleton class="h-8 w-20 rounded-md" />
							<Skeleton class="h-8 w-8 rounded-full" />
						</div>
					</Card.Content>
					<Card.Footer class="border-t bg-muted/10 p-4">
						<Skeleton class="h-9 w-full" />
					</Card.Footer>
				</Card.Root>
			{/each}
		{:else if error}
			<div
				class="col-span-full flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center"
			>
				<p class="mb-4 font-medium text-destructive">{error}</p>
				<Button variant="outline" onclick={loadProjects}>Retry</Button>
			</div>
		{:else if filteredProjects.length === 0}
			<div class="col-span-full">
				{#if searchQuery}
					<div
						class="flex flex-col items-center justify-center py-12 text-center text-muted-foreground"
					>
						<Search class="h-12 w-12 opacity-20" />
						<p class="mt-4 text-lg font-medium">No projects found</p>
						<p class="text-sm">Try adjusting your search query.</p>
					</div>
				{:else}
					<Card.Root
						class="flex min-h-[400px] flex-col items-center justify-center border-dashed bg-muted/30 p-8 text-center"
					>
						<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
							<LayoutGrid class="h-8 w-8 text-primary" />
						</div>
						<h3 class="text-xl font-semibold">No projects created</h3>
						<p class="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
							Projects are secure workspaces where you can manage diagrams, notes, and documents.
						</p>
						<Button onclick={() => (isCreateDialogOpen = true)} size="lg">
							<Plus class="mr-2 h-4 w-4" />
							Create First Project
						</Button>
					</Card.Root>
				{/if}
			</div>
		{:else}
			{#each filteredProjects as project (project.id)}
				<Card.Root
					class="group flex flex-col justify-between transition-all hover:border-primary/50 hover:shadow-lg"
				>
					<Card.Header class="space-y-3 pb-3">
						<div class="flex items-start justify-between">
							<Badge
								variant="secondary"
								class="flex items-center gap-1 font-normal text-muted-foreground"
							>
								<ShieldCheck class="h-3 w-3 text-green-500" />
								Encrypted
							</Badge>
						</div>
						<Card.Title class="line-clamp-1 text-xl font-bold">{project.name}</Card.Title>
						<Card.Description class="line-clamp-2 min-h-10 text-sm leading-relaxed">
							{project.description || 'No description provided for this project.'}
						</Card.Description>
					</Card.Header>

					<Card.Content class="pt-0 pb-3">
						<div class="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
							<div class="flex items-center gap-1">
								<Clock class="h-3.5 w-3.5" />
								<span>{new Date(project.created_at).toLocaleDateString()}</span>
							</div>
							<div class="flex items-center gap-1">
								<Badge variant="outline" class="h-5 px-1.5 text-[10px] font-normal">Owner</Badge>
							</div>
						</div>
					</Card.Content>

					<Card.Footer class="border-t bg-muted/10 pt-3">
						<Button
							href={`/projects/${project.id}`}
							class="w-full transition-colors"
							variant="outline"
						>
							Open Project
							<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Card.Footer>
				</Card.Root>
			{/each}
		{/if}
	</div>
</div>

<ProjectCreateDialog bind:open={isCreateDialogOpen} onSuccess={handleCreateSuccess} />
<RestoreDialog bind:open={isRestoreDialogOpen} onSuccess={handleCreateSuccess} />
