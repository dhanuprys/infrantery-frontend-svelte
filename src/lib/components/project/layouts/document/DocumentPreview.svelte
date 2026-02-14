<script lang="ts">
	import { Marked } from 'marked';
	import { markedHighlight } from 'marked-highlight';
	import hljs from 'highlight.js';
	import { ScrollArea } from '$lib/components/ui/scroll-area';

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
	<div class="absolute inset-0 w-full">
		<ScrollArea class="h-full w-full" orientation="both">
			<div
				class="mx-auto prose prose-sm max-w-[100ch] min-w-[65ch] px-8 py-4 dark:prose-invert [&>p]:wrap-break-word"
			>
				{@html marked.parse(value || '')}
			</div>
		</ScrollArea>
	</div>
</div>
