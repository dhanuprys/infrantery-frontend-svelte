<script>
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input';
</script>

<div class="flex min-h-screen w-screen items-center justify-center overflow-hidden">
	<!-- form -->
	<div class="flex flex-col gap-4">
		<h1 class="text-2xl font-semibold">Authorize</h1>
		<p>Enter the project password to access this project</p>
		<Input placeholder="Enter project password" />
		<Button class="w-full">Authorize</Button>
	</div>
</div>
