<script>
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import {
		BookOpenText,
		BoxesIcon,
		BoxIcon,
		ChevronDownIcon,
		ChevronLeftIcon,
		ChevronsUpDownIcon,
		GitBranchIcon,
		MoveLeftIcon,
		PyramidIcon
	} from '@lucide/svelte';
</script>

<div class="flex items-center justify-between border-b px-4 py-2">
	<div></div>

	<div class="flex items-center gap-2">
		<button type="button" class="flex items-center gap-x-2 px-2 py-1"
			><ChevronLeftIcon class="size-5" />
			<span class="text-xs">Back to Parent</span></button
		>
		<a href="/project/xx120983/document" class="flex items-center gap-x-2 px-2 py-1"
			><BookOpenText class="size-5" /> <span class="text-xs">Project Document</span></a
		>
	</div>
</div>
