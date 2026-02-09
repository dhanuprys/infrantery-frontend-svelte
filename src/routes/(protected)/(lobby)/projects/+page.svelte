<script lang="ts">
	import { onMount } from 'svelte';
	import { projectService } from '$lib/services/project.service';
	import type { ProjectResponse } from '$lib/types/api';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Plus, ArrowRight } from '@lucide/svelte';
	import ProjectCreateDialog from '$lib/components/projects/project-create-dialog.svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';

	let projects = $state<ProjectResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isCreateDialogOpen = $state(false);

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
</script>

<div class="h-full space-y-8 p-8">
	<div class="flex items-center justify-between space-y-2">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Projects</h2>
			<p class="text-muted-foreground">Manage and collaborate on your secure projects.</p>
		</div>
		<div class="flex items-center space-x-2">
			<Button onclick={() => (isCreateDialogOpen = true)}>
				<Plus class="mr-2 h-4 w-4" />
				New Project
			</Button>
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#if loading}
			{#each Array(3) as _}
				<Card.Root>
					<Card.Header class="grid grid-cols-[1fr_110px] items-start gap-4 space-y-0">
						<div class="space-y-1">
							<Skeleton class="h-5 w-32" />
							<Skeleton class="h-4 w-full" />
						</div>
					</Card.Header>
					<Card.Content>
						<Skeleton class="h-4 w-full" />
					</Card.Content>
					<Card.Footer>
						<Skeleton class="h-9 w-full" />
					</Card.Footer>
				</Card.Root>
			{/each}
		{:else if error}
			<div class="col-span-full rounded-md bg-destructive/15 p-4 text-destructive">
				{error}
				<Button variant="link" onclick={loadProjects} class="ml-2 text-destructive underline">
					Retry
				</Button>
			</div>
		{:else if projects.length === 0}
			<Card.Root
				class="col-span-full flex min-h-[400px] flex-col items-center justify-center border-dashed p-8 text-center"
			>
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
					<Plus class="h-6 w-6" />
				</div>
				<h3 class="mt-4 text-lg font-semibold">No projects created</h3>
				<p class="mt-2 mb-4 text-sm text-muted-foreground">
					Get started by creating your first secure project.
				</p>
				<Button onclick={() => (isCreateDialogOpen = true)}>
					<Plus class="mr-2 h-4 w-4" />
					Create Project
				</Button>
			</Card.Root>
		{:else}
			{#each projects as project}
				<Card.Root class="flex flex-col justify-between transition-all hover:shadow-md">
					<Card.Header>
						<div class="flex items-start justify-between space-y-0">
							<Card.Title class="truncate text-xl font-semibold">{project.name}</Card.Title>
							<Badge variant="outline" class="shrink-0 bg-background">Owner</Badge>
						</div>
						<Card.Description class="line-clamp-2 h-10 text-sm text-muted-foreground">
							{project.description || 'No description provided.'}
						</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center text-xs text-muted-foreground">
							<span class="truncate">
								Created {new Date(project.created_at).toLocaleDateString()}
							</span>
						</div>
					</Card.Content>
					<Card.Footer>
						<Button href={`/projects/${project.id}`} variant="secondary" class="group w-full">
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
