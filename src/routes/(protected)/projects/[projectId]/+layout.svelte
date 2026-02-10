<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import { ProjectSessionKeys } from '$lib/data/project-session-keys';
	import secureProjectSession from '$lib/services/secureProjectSession';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';

	import { Loader2 } from '@lucide/svelte';

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
			return goto(`/projects/${params.projectId}/authorize`, { replaceState: true });
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
{:else}
	<div class="flex h-screen w-full flex-col items-center justify-center gap-4 bg-background">
		<Loader2 class="size-8 animate-spin text-muted-foreground" />
		<p class="text-sm text-muted-foreground">Verifying project access...</p>
	</div>
{/if}
