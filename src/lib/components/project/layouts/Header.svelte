<script>
	import ModeToggler from '$lib/components/mode-toggler.svelte';
</script>

<header class="border-b-2">
	<div class="flex items-center justify-between px-4 py-2">
		<div class="flex items-center gap-2">
			<h2 class="font-semibold">INFRANTERY</h2>
			<span class="text-xs text-muted-foreground">by DedanLabs</span>
		</div>
		<div>
			<ModeToggler />
		</div>
	</div>
</header>
