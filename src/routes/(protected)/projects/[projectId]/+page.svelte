<script lang="ts">
	import { page } from '$app/state';
	import { projectService } from '$lib/services/project.service';
	import { diagramService } from '$lib/services/diagram.service';
	import type { ProjectResponse, DiagramResponse } from '$lib/types/api';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Plus, ArrowRight, FileText, Network, Settings } from '@lucide/svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import ProjectUpdateDialog from '$lib/components/projects/project-update-dialog.svelte';

	let { params }: PageProps = $props();
	let projectId = $derived(params.projectId);
	let project = $state<ProjectResponse | null>(null);
	let diagrams = $state<DiagramResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isUpdateDialogOpen = $state(false);

	async function loadData() {
		loading = true;
		error = null;
		try {
			// Parallel fetch
			const [projectRes, diagramsRes] = await Promise.all([
				projectService.getProject(projectId),
				diagramService.getDiagrams({ project_id: projectId, rootOnly: true })
			]);

			project = projectRes.data;
			diagrams = diagramsRes.data || [];
		} catch (err: any) {
			console.error('Failed to load project data:', err);
			error = `Failed to load project data: ${err.message || err}`;
			toast.error(error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		if (projectId) {
			console.log('Loading data for project:', projectId);
			loadData();
		} else {
			console.error('Project ID is missing from route params');
		}
	});

	function handleUpdateSuccess() {
		loadData();
	}
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader />
	<div class="h-full space-y-8 p-8">
		<!-- Header -->
		<div class="flex items-center justify-between space-y-2">
			<div>
				<div class="flex items-center space-x-2">
					{#if loading}
						<Skeleton class="h-9 w-64" />
					{:else if project}
						<h2 class="text-3xl font-bold tracking-tight">{project.name}</h2>
						<Badge variant="outline">Project</Badge>
						<Button variant="ghost" size="icon" onclick={() => (isUpdateDialogOpen = true)}>
							<Settings class="h-4 w-4" />
							<span class="sr-only">Edit Project</span>
						</Button>
					{/if}
				</div>

				{#if loading}
					<Skeleton class="mt-2 h-5 w-96" />
				{:else if project}
					<p class="text-muted-foreground">{project.description || 'No description provided.'}</p>
				{/if}
			</div>
			<div class="flex items-center space-x-2">
				<Button variant="outline" href={`/projects/${projectId}/notes`}>
					<FileText class="mr-2 h-4 w-4" />
					Go to Notes
				</Button>
				<Button>
					<Plus class="mr-2 h-4 w-4" />
					New Diagram
				</Button>
			</div>
		</div>

		<!-- Diagrams Grid -->
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
					<Button variant="link" onclick={loadData} class="ml-2 text-destructive underline">
						Retry
					</Button>
				</div>
			{:else if diagrams.length === 0}
				<Card.Root
					class="col-span-full flex min-h-[400px] flex-col items-center justify-center border-dashed p-8 text-center"
				>
					<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent">
						<Network class="h-6 w-6" />
					</div>
					<h3 class="mt-4 text-lg font-semibold">No diagrams yet</h3>
					<p class="mt-2 mb-4 text-sm text-muted-foreground">
						Create a diagram to start visualizing your architecture.
					</p>
					<Button>
						<Plus class="mr-2 h-4 w-4" />
						Create Diagram
					</Button>
				</Card.Root>
			{:else}
				{#each diagrams as diagram}
					<Card.Root class="flex flex-col justify-between transition-all hover:shadow-md">
						<Card.Header>
							<Card.Title class="truncate text-xl font-semibold">{diagram.diagram_name}</Card.Title>
							<Card.Description class="line-clamp-2 h-10 text-sm text-muted-foreground">
								{diagram.description || 'No description provided.'}
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<div class="flex items-center text-xs text-muted-foreground">
								<span class="truncate">
									Updated {new Date(diagram.updated_at).toLocaleDateString()}
								</span>
							</div>
						</Card.Content>
						<Card.Footer>
							<Button
								href={`/projects/${projectId}/diagrams/${diagram.id}`}
								variant="secondary"
								class="group w-full"
							>
								Open Diagram
								<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
							</Button>
						</Card.Footer>
					</Card.Root>
				{/each}
			{/if}
		</div>
	</div>
</div>

<ProjectUpdateDialog bind:open={isUpdateDialogOpen} {project} onSuccess={handleUpdateSuccess} />
