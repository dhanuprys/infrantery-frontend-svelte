<script lang="ts">
	import Header from '$lib/components/lobby/Header.svelte';

	let { children } = $props();
</script>

<Header />
{@render children()}
