<script lang="ts">
	import ModeToggler from '$lib/components/mode-toggler.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import {
		BoxesIcon,
		BoxIcon,
		ChevronsUpDownIcon,
		FolderLockIcon,
		PlusIcon,
		PyramidIcon
	} from '@lucide/svelte';

	interface Props {
		breadcrumbs?: {
			type: 'project' | 'diagram' | 'document' | 'node' | 'vault';
			id: string;
			label: string;
			dropdowns?: {
				id: string;
				label: string;
			}[];
		}[];
	}

	let { breadcrumbs = [] }: Props = $props();
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
					{#each breadcrumbs as breadcrumb, i (breadcrumb.id)}
						<Breadcrumb.Item>
							{#if breadcrumb.type === 'project'}
								<Breadcrumb.Link href="/"
									><div class="flex items-center gap-2">
										<PyramidIcon class="size-3" />
										<span class="font-mono text-xs">Project: STEMSI</span>
									</div></Breadcrumb.Link
								>
							{:else if breadcrumb.type === 'diagram'}
								<Breadcrumb.Link href="/components">
									<DropdownMenu.Root>
										<DropdownMenu.Trigger class="flex items-center gap-1">
											<div class="flex items-center gap-2">
												<BoxesIcon class="size-3" />
												<span class="font-mono text-xs">Diagram: STEMSI</span>
											</div>
											<ChevronsUpDownIcon class="size-3" />
										</DropdownMenu.Trigger>
										<DropdownMenu.Content align="start">
											{#if breadcrumb.dropdowns}
												{#each breadcrumb.dropdowns as dropdown (dropdown.id)}
													<DropdownMenu.Item>{dropdown.label}</DropdownMenu.Item>
												{/each}
											{/if}
											<DropdownMenu.Item
												><PlusIcon class="size-3" /> Create New Diagram</DropdownMenu.Item
											>
										</DropdownMenu.Content>
									</DropdownMenu.Root>
								</Breadcrumb.Link>
							{:else if breadcrumb.type === 'document'}
								<Breadcrumb.Page
									><div class="flex items-center gap-2">
										<FolderLockIcon class="size-3" />
										<span class="font-mono text-xs">Document</span>
									</div></Breadcrumb.Page
								>
							{:else if breadcrumb.type === 'node'}
								<Breadcrumb.Page
									><div class="flex items-center gap-2">
										<BoxIcon class="size-3" />
										<span class="font-mono text-xs">Node Diagram: xx120983</span>
									</div></Breadcrumb.Page
								>
							{:else if breadcrumb.type === 'vault'}
								<Breadcrumb.Page
									><div class="flex items-center gap-2">
										<FolderLockIcon class="size-3" />
										<span class="font-mono text-xs">Vault</span>
									</div></Breadcrumb.Page
								>
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
			<ModeToggler />
		</div>
	</div>
</header>
