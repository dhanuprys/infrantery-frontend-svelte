<script lang="ts">
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js';

	let { value = $bindable() } = $props();

	const marked = new Marked(
		markedHighlight({
			emptyLangClass: 'hljs',
			langPrefix: 'hljs language-',
			highlight(code, lang, info) {
				const language = hljs.getLanguage(lang) ? lang : 'plaintext';
				return hljs.highlight(code, { language }).value;
			}
		})
	);
</script>

<div class="relative h-full">
	<div class="absolute inset-0 max-h-full overflow-auto">
		<div class="mx-auto prose prose-sm max-w-[100ch] min-w-[65ch] px-8 py-4 dark:prose-invert">
			{@html marked.parse(value || '')}
		</div>
	</div>
</div>
