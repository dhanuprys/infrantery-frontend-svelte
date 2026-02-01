<script>
	import ModeToggler from '$lib/components/mode-toggler.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import { BoxesIcon, BoxIcon, ChevronsUpDownIcon, PyramidIcon } from '@lucide/svelte';
</script>

<header class="border-b-2">
	<div class="flex items-center justify-between px-4 py-2">
		<div class="flex items-center gap-4">
			<div class="flex items-center gap-2">
				<h2 class="font-semibold">INFRANTERY</h2>
				<span class="text-xs text-muted-foreground">by DedanLabs</span>
			</div>
			<Separator orientation="vertical" class="h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item>
						<Breadcrumb.Link href="/"
							><div class="flex items-center gap-2">
								<PyramidIcon class="size-3" />
								<span class="font-mono text-xs">Project: STEMSI</span>
							</div></Breadcrumb.Link
						>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
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
									<DropdownMenu.Item>Documentation</DropdownMenu.Item>
									<DropdownMenu.Item>Themes</DropdownMenu.Item>
									<DropdownMenu.Item>GitHub</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator />
					<Breadcrumb.Item>
						<Breadcrumb.Page
							><div class="flex items-center gap-2">
								<BoxIcon class="size-3" />
								<span class="font-mono text-xs">Node Diagram: xx120983</span>
							</div></Breadcrumb.Page
						>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
		</div>

		<div>
			<ModeToggler />
		</div>
	</div>
</header>
