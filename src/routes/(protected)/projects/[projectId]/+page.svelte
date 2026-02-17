<script lang="ts">
	import { projectService } from '$lib/services/project.service';
	import { diagramService } from '$lib/services/diagram.service';
	import type { ProjectResponse, DiagramResponse } from '$lib/types/api';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import {
		Plus,
		ArrowRight,
		FileText,
		Network,
		Settings,
		ShieldCheck,
		Clock,
		ChevronRight,
		ArrowLeft,
		Users,
		Download
	} from '@lucide/svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Badge } from '$lib/components/ui/badge';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import ProjectUpdateDialog from '$lib/components/projects/project-update-dialog.svelte';
	import CreateDiagramDialog from '$lib/components/project/dialogs/CreateDiagramDialog.svelte';
	import BackupDialog from '$lib/components/projects/backup-dialog.svelte';
	import { goto } from '$app/navigation';
	import { cryptoService } from '$lib/services/cryptoService';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';

	let { params }: PageProps = $props();
	let projectId = $derived(params.projectId);
	let project = $state<ProjectResponse | null>(null);
	let diagrams = $state<DiagramResponse[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isUpdateDialogOpen = $state(false);
	let createDiagramDialogOpen = $state(false);
	let isBackupDialogOpen = $state(false);

	async function handleCreateDiagram(name: string, description: string) {
		try {
			if (!projectSessionStore.keyrings || !projectSessionStore.projectBrief) {
				throw new Error('Project keys not found. Please re-authorize.');
			}

			// 1. Prepare default data
			const defaultData = JSON.stringify({ nodes: [], edges: [] });

			// 2. Encrypt
			const wrapped = await cryptoService.wrapProjectData(
				projectSessionStore.keyrings,
				projectSessionStore.projectBrief.key_epoch,
				defaultData
			);

			// 4. Create via Service
			const res = await diagramService.createDiagram(projectId, {
				diagram_name: name,
				description: description,
				encrypted_data: wrapped.encrypted,
				encrypted_data_signature: wrapped.signature
			});

			// 5. Redirect
			toast.success('Diagram created');
			goto(`/projects/${projectId}/diagrams/${res.data.id}`);
		} catch (err: any) {
			console.error('Failed to create diagram:', err);
			toast.error(err.message || 'Failed to create diagram');
			throw err;
		}
	}

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
	<div class="container mx-auto h-full max-w-7xl space-y-8 p-8">
		<!-- Header -->
		<div class="flex items-center justify-between space-y-2">
			<div>
				<div class="flex items-center space-x-2">
					{#if loading}
						<Skeleton class="h-9 w-64" />
					{:else if project}
						<div class="flex flex-col gap-1">
							<Button
								variant="ghost"
								size="sm"
								href="/projects"
								class="-ml-3 w-fit text-muted-foreground hover:text-foreground"
							>
								<ArrowLeft class="mr-2 h-4 w-4" />
								Back to Projects
							</Button>
							<div class="flex items-center gap-2">
								<h2 class="text-3xl font-bold tracking-tight">{project.name}</h2>
								<Button variant="ghost" size="icon" onclick={() => (isUpdateDialogOpen = true)}>
									<Settings class="h-4 w-4" />
									<span class="sr-only">Edit Project</span>
								</Button>
							</div>
						</div>
					{/if}
				</div>

				{#if loading}
					<Skeleton class="mt-2 h-5 w-96" />
				{:else if project}
					<p class="text-muted-foreground">{project.description || 'No description provided.'}</p>
				{/if}
			</div>
			<div class="flex items-center space-x-2">
				<Button variant="outline" href={`/projects/${projectId}/members`}>
					<Users class="mr-2 h-4 w-4" />
					Members
				</Button>
				<Button variant="outline" href={`/projects/${projectId}/notes`}>
					<FileText class="mr-2 h-4 w-4" />
					Go to Notes
				</Button>
				<Button variant="outline" onclick={() => (isBackupDialogOpen = true)}>
					<Download class="mr-2 h-4 w-4" />
					Backup
				</Button>
				<Button onclick={() => (createDiagramDialogOpen = true)}>
					<Plus class="mr-2 h-4 w-4" />
					New Diagram
				</Button>
			</div>
		</div>

		<div class="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
			{#if loading}
				{#each Array(4) as _}
					<Card.Root class="flex flex-row items-center justify-between overflow-hidden">
						<Card.Header class="flex-1 gap-2 border-r bg-muted/40 p-4">
							<div class="flex items-center justify-between">
								<Skeleton class="h-4 w-20" />
								<Skeleton class="h-4 w-4 rounded-full" />
							</div>
							<Skeleton class="h-6 w-3/4" />
						</Card.Header>
						<Card.Content class="w-40 p-4">
							<Skeleton class="h-4 w-full" />
						</Card.Content>
						<Card.Footer class="w-40 bg-muted/10 p-4">
							<Skeleton class="h-9 w-full" />
						</Card.Footer>
					</Card.Root>
				{/each}
			{:else if error}
				<div
					class="col-span-full flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center"
				>
					<p class="mb-4 font-medium text-destructive">{error}</p>
					<Button variant="outline" onclick={loadData}>Retry</Button>
				</div>
			{:else if diagrams.length === 0}
				<Card.Root
					class="col-span-full flex min-h-[400px] flex-col items-center justify-center border-dashed bg-muted/30 p-8 text-center"
				>
					<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
						<Network class="h-8 w-8 text-primary" />
					</div>
					<h3 class="text-xl font-semibold">No diagrams yet</h3>
					<p class="mt-2 mb-6 max-w-sm text-sm text-muted-foreground">
						Create your first diagram to start visualizing your infrastructure.
					</p>
					<Button onclick={() => (createDiagramDialogOpen = true)} size="lg">
						<Plus class="mr-2 h-4 w-4" />
						Create Diagram
					</Button>
				</Card.Root>
			{:else}
				{#each diagrams as diagram (diagram.id)}
					<Card.Root
						class="group flex flex-row items-center justify-between transition-all hover:border-primary/50 hover:shadow-lg"
					>
						<Card.Header class="flex-1 space-y-1 px-6">
							<div class="mb-2 flex items-center gap-2">
								<Badge
									variant="secondary"
									class="flex items-center gap-1 font-normal text-muted-foreground"
								>
									<ShieldCheck class="h-3 w-3 text-green-500" />
									Encrypted
								</Badge>
								<div class="flex items-center gap-1 text-xs text-muted-foreground">
									<Clock class="h-3.5 w-3.5" />
									<span>{new Date(diagram.updated_at).toLocaleDateString()}</span>
								</div>
							</div>
							<Card.Title class="line-clamp-1 text-xl font-bold">{diagram.diagram_name}</Card.Title>
							<Card.Description class="line-clamp-1 min-h-5 text-sm leading-relaxed">
								{diagram.description || 'No description provided.'}
							</Card.Description>
						</Card.Header>

						<Card.Footer class="p-6">
							<Button
								href={`/projects/${projectId}/diagrams/${diagram.id}`}
								class="group transition-colors"
								variant="outline"
							>
								Open
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
<CreateDiagramDialog bind:open={createDiagramDialogOpen} onsubmit={handleCreateDiagram} />
<BackupDialog bind:open={isBackupDialogOpen} {projectId} projectName={project?.name || 'project'} />
