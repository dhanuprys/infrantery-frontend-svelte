<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { ProjectSessionKeys } from '$lib/data/project-session-keys';
	import secureProjectSession from '$lib/services/secureProjectSession';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';

	let { children, params }: LayoutProps = $props();
	let readyToShow = $state(false);

	async function checkProjectSession() {
		secureProjectSession.cleanUpOtherOpenedProjects(params.projectId);

		const projectEncryptionPublicKey = await secureProjectSession.getItem(
			ProjectSessionKeys.ENCRYPTION_PUBLIC_KEY,
			params.projectId
		);
		const projectEncryptionPrivateKey = await secureProjectSession.getItem(
			ProjectSessionKeys.ENCRYPTION_PRIVATE_KEY,
			params.projectId
		);
		const projectSigningPublicKey = await secureProjectSession.getItem(
			ProjectSessionKeys.SIGNING_PUBLIC_KEY,
			params.projectId
		);
		const projectSigningPrivateKey = await secureProjectSession.getItem(
			ProjectSessionKeys.SIGNING_PRIVATE_KEY,
			params.projectId
		);

		if (
			(!projectEncryptionPublicKey ||
				!projectEncryptionPrivateKey ||
				!projectSigningPublicKey ||
				!projectSigningPrivateKey) &&
			!window.location.href.endsWith('/authorize')
		) {
			return goto(`/projects/${params.projectId}/authorize`);
		}

		projectSessionStore.setKeys({
			encryptionPublicKey: projectEncryptionPublicKey!,
			encryptionPrivateKey: projectEncryptionPrivateKey!,
			signingPublicKey: projectSigningPublicKey!,
			signingPrivateKey: projectSigningPrivateKey!
		});

		readyToShow = true;
	}

	onMount(async () => await checkProjectSession());
	afterNavigate(async () => await checkProjectSession());
</script>

{#if readyToShow}
	{@render children()}
{/if}
