<script>
	import {
		BookOpenText,
		ChevronLeftIcon,
		GitBranchIcon,
		MoveLeftIcon,
		PyramidIcon
	} from '@lucide/svelte';
</script>

<div class="flex items-center justify-between border-b px-4 py-2">
	<div class="flex items-center gap-4">
		<div class="flex items-center gap-2">
			<PyramidIcon class="size-4" />
			<span class="font-mono text-xs">Project: STEMSI</span>
		</div>
		<MoveLeftIcon class="size-4 opacity-40" />
		<div class="flex items-center gap-2">
			<GitBranchIcon class="size-4" />
			<span class="font-mono text-xs">node: xx120983</span>
		</div>
	</div>
	<div class="flex items-center gap-2">
		<button type="button" class="flex items-center gap-x-2 px-2 py-1"
			><BookOpenText class="size-5" /> <span class="text-xs">Open Diagram</span></button
		>
	</div>
</div>
