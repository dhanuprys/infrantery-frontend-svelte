<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { BookOpenText, ChevronDownIcon } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { vaultTypes } from '$lib/data/vault-type';

	interface Props {
		onCreateAction?: (fieldType: string) => void;
	}

	let { onCreateAction }: Props = $props();

	let createDDOpen = $state(false);
</script>

<div class="flex items-center justify-between border-b px-4 py-2">
	<div>
		<DropdownMenu.Root bind:open={createDDOpen}>
			<DropdownMenu.Trigger>
				<Button variant={createDDOpen ? 'outline' : 'default'}>
					Create New Item <ChevronDownIcon />
				</Button>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content sideOffset={5}>
				{#each Object.values(vaultTypes) as vaultType}
					<DropdownMenu.Item onclick={() => onCreateAction?.(vaultType.type)}>
						<vaultType.icon />
						{vaultType.label}
					</DropdownMenu.Item>
				{/each}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
	<div class="flex items-center gap-2">
		<a href="/project/xx120983/diagram" class="flex items-center gap-x-2 px-2 py-1"
			><BookOpenText class="size-5" /> <span class="text-xs">Open Diagram</span></a
		>
	</div>
</div>
