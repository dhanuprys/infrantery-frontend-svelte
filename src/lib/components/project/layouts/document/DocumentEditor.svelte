<script lang="ts">
	import CodeMirror from 'svelte-codemirror-editor';
	import { markdown } from '@codemirror/lang-markdown';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { mode } from 'mode-watcher';

	let { value = $bindable(), onchange } = $props();
	let colorMode = $derived(mode.current || 'light');
</script>

<div class="relative h-full">
	<div class="absolute inset-0 max-h-full overflow-y-auto">
		<CodeMirror
			bind:value
			lang={markdown()}
			theme={colorMode === 'dark' ? oneDark : undefined}
			{onchange}
		/>
	</div>
</div>
