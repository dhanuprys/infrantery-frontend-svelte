<script>
	import ProjectHeader from '$lib/components/project/layouts/ProjectHeader.svelte';
	import * as Vault from '$lib/components/project/layouts/vault';
	import * as Dialog from '$lib/components/ui/dialog';

	let dialogOpen = $state(false);
</script>

<div style:height="100vh" class="flex flex-col">
	<ProjectHeader />
	<Vault.Toolbar onCreateAction={() => (dialogOpen = true)} />

	<Dialog.Root bind:open={dialogOpen}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Create New Item</Dialog.Title>
				<Dialog.Description>Store your data in the vault</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
</div>
