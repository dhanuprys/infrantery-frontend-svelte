<script>
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import * as Vault from '$lib/components/project/layouts/vault';
	import * as Dialog from '$lib/components/ui/dialog';

	let dialogOpen = $state(false);
</script>

<div style:height="100vh" class="flex flex-col">
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
	<Vault.Toolbar onCreateClick={() => (dialogOpen = true)} />

	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create New Item</Dialog.Title>
				<Dialog.Description>Store your data in the vault</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
</div>
