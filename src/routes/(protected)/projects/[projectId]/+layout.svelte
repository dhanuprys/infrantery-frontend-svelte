<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import secureKeyringSession from '$lib/services/secureKeyringSession';
	import { onMount } from 'svelte';
	import type { LayoutProps } from './$types';

	import { Loader2 } from '@lucide/svelte';
	import { projectSessionStore } from '$lib/stores/projectSessionStore.svelte';
	import { projectService } from '$lib/services/project.service';
	import { toast } from 'svelte-sonner';

	let { children, params }: LayoutProps = $props();
	let readyToShow = $state(false);

	async function checkProjectSession() {
		secureKeyringSession.cleanUpOtherOpenedProjects(params.projectId);
		const isOnAuthorizePage = window.location.href.endsWith('/authorize');
		const epoch = await secureKeyringSession.getEpoch(params.projectId);

		if (!epoch && !isOnAuthorizePage) {
			return goto(`/projects/${params.projectId}/authorize`, { replaceState: true });
		}

		const keyrings = await secureKeyringSession.getItems(params.projectId);

		if (!keyrings && !isOnAuthorizePage) {
			return goto(`/projects/${params.projectId}/authorize`, { replaceState: true });
		}

		if (isOnAuthorizePage) {
			readyToShow = true;
			return;
		}

		if (keyrings) {
			try {
				const project = await projectService.getProjectChunk(params.projectId);

				if (project.data.key_epoch !== epoch) {
					toast.info('Project epoch has changed. Please reauthorize');
					secureKeyringSession.lockProjects();
					return goto(`/projects/${params.projectId}/authorize`, { replaceState: true });
				}

				projectSessionStore.setProjectBrief(project.data);
				projectSessionStore.setKeyrings(keyrings);

				readyToShow = true;
			} catch (error) {
				toast.error('Failed to load project');
				return goto('/projects', { replaceState: true });
			}
		} else {
			readyToShow = true;
		}
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
