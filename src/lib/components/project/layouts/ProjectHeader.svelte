<script lang="ts">
	import { goto } from '$app/navigation';
	import ModeToggler from '$lib/components/mode-toggler.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import secureProjectSession from '$lib/services/secureProjectSession';
	import { breadcrumbService } from '$lib/services/breadcrumb.service';
	import type { BreadcrumbItem } from '$lib/types/breadcrumb';
	import { page } from '$app/state';
	import {
		BoxesIcon,
		BoxIcon,
		ChevronsUpDownIcon,
		FolderLockIcon,
		LockIcon,
		PlusIcon,
		PyramidIcon,
		FileTextIcon,
		ArchiveIcon
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let breadcrumbs = $state<BreadcrumbItem[]>([]);
	// let isLoading = $state(false);

	async function fetchBreadcrumbs() {
		const params = page.params;
		let type = '';
		let id = '';
		let projectId = params.projectId;

		if (!projectId) return;

		// Prioritize specific pages that might overlap with generic params
		if (page.url.pathname.endsWith('/vault') && params.nodeId) {
			type = 'node_vault';
			id = params.nodeId;
		} else if (params.nodeId) {
			type = 'node';
			id = params.nodeId;
		} else if (params.diagramId) {
			type = 'diagram';
			id = params.diagramId;
		} else if (page.url.pathname.endsWith('/notes')) {
			type = 'note';
			id = ''; // List type
		} else {
			type = 'project';
			id = projectId;
		}

		try {
			const res = await breadcrumbService.getBreadcrumbs(projectId, type, id);
			breadcrumbs = res.data.path;
		} catch (error) {
			console.error('Failed to fetch breadcrumbs:', error);
		}
	}

	$effect(() => {
		if (page.params.projectId) {
			fetchBreadcrumbs();
		}
	});

	function handleLockProject() {
		secureProjectSession.lockProjects().then(() => {
			toast.success('Project locked successfully');
			goto(`/projects/${page.params.projectId}/authorize`, { replaceState: true });
		});
	}

	function getIcon(type: string) {
		switch (type) {
			case 'project':
				return PyramidIcon;
			case 'diagram':
				return BoxesIcon;
			case 'node':
				return BoxIcon;
			case 'note':
				return FileTextIcon;
			case 'vault':
			case 'node_vault':
				return ArchiveIcon;
			default:
				return FolderLockIcon;
		}
	}

	function getHref(item: BreadcrumbItem, projectId: string) {
		switch (item.type) {
			case 'project':
				return `/projects/${projectId}`;
			case 'diagram':
				return `/projects/${projectId}/diagrams/${item.id}`;
			case 'node':
				return `/projects/${projectId}/diagrams/${page.params.diagramId}/node/${item.id}`;
			case 'note':
				return `/projects/${projectId}/notes`; // TODO: Handle specific note
			case 'vault':
			case 'node_vault':
				return `/projects/${projectId}/diagrams/${page.params.diagramId}/node/${page.params.nodeId}/vault`;
			default:
				return '#';
		}
	}
</script>

<header class="border-b-2">
	<div class="flex items-center justify-between px-8 py-2">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<h2 class="font-semibold">INFRANTERY</h2>
				<span class="text-xs text-muted-foreground">by DedanLabs</span>
			</div>
			<Separator orientation="vertical" class="h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					{#each breadcrumbs as breadcrumb, i (breadcrumb.label + i)}
						{@const Icon = getIcon(breadcrumb.type)}
						<Breadcrumb.Item>
							{#if breadcrumb.siblings && breadcrumb.siblings.length > 0}
								<DropdownMenu.Root>
									<DropdownMenu.Trigger
										class="flex items-center gap-1 transition-colors hover:text-foreground/80"
									>
										<div class="flex items-center gap-2">
											<Icon class="size-3" />
											<span
												class="max-w-[150px] truncate font-mono text-xs"
												title={breadcrumb.label}
											>
												{breadcrumb.label}
											</span>
										</div>
										<ChevronsUpDownIcon class="size-3 opacity-50" />
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="start" class="max-h-[300px] overflow-y-auto">
										{#each breadcrumb.siblings as sibling (sibling.id || sibling.label)}
											<DropdownMenu.Item
												class="cursor-pointer"
												onSelect={() => {
													if (sibling.id) {
														goto(getHref(sibling, page.params.projectId!));
													}
												}}
											>
												<span class={sibling.active ? 'font-medium' : ''}>{sibling.label}</span>
											</DropdownMenu.Item>
										{/each}
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							{:else}
								<Breadcrumb.Link href={getHref(breadcrumb, page.params.projectId!)}>
									<div class="flex items-center gap-2">
										<Icon class="size-3" />
										<span class="max-w-[150px] truncate font-mono text-xs" title={breadcrumb.label}>
											{breadcrumb.label}
										</span>
									</div>
								</Breadcrumb.Link>
							{/if}
						</Breadcrumb.Item>

						{#if i < breadcrumbs.length - 1}
							<Breadcrumb.Separator />
						{/if}
					{/each}
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>

		<div>
			<Button variant="destructive" onclick={handleLockProject}><LockIcon /> Lock Project</Button>
			<ModeToggler />
		</div>
	</div>
</header>
