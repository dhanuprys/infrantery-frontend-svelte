<script>
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import * as Vault from '$lib/components/project/layouts/vault';
</script>

<ProjectHeader
	breadcrumbs={[
		{
			id: '11111',
			type: 'project',
			label: 'Stemsi'
		},
		{
			id: '11112',
			type: 'diagram',
			label: 'Stemsi',
			dropdowns: [
				{
					id: '11113',
					label: 'Stemsi'
				}
			]
		}
	]}
/>
