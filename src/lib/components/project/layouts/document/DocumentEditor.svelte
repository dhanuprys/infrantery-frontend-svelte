<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { mode } from 'mode-watcher';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	let { value = $bindable(), onchange } = $props();
	let colorMode = $derived(mode.current || 'light');
</script>

<div class="relative h-full">
	<div class="absolute inset-0">
		<ScrollArea class="h-full w-full" orientation="both">
			<CodeMirror
				bind:value
				lang={markdown()}
				theme={colorMode === 'dark' ? oneDark : undefined}
				{onchange}
			/>
		</ScrollArea>
	</div>
</div>
