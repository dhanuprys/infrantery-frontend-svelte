<script lang="ts">
	import GalleryVerticalEndIcon from '@lucide/svelte/icons/gallery-vertical-end';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { authService } from '$lib/services/auth.service';
	import { goto } from '$app/navigation';
	import { userStore } from '$lib/stores/userStore.svelte';
	import secureProjectSession from '$lib/services/secureProjectSession';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const id = $props.id();

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state<string | null>(null);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isLoading = true;
		error = null;

		try {
			await authService.login(email, password);
			// Fetch profile to populate store immediately
			const profile = await authService.getProfile();
			userStore.setUser(profile.data);
			secureProjectSession.lockProjects();
			goto('/');
		} catch (err: any) {
			console.error(err);
			error = err.response?.data?.error?.message || 'Login failed. Please check your credentials.';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form onsubmit={handleSubmit}>
		<FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<a href="##" class="flex flex-col items-center gap-2 font-medium">
					<div class="flex size-8 items-center justify-center rounded-md">
						<GalleryVerticalEndIcon class="size-6" />
					</div>
					<span class="sr-only">INFRANTERY</span>
				</a>
				<h1 class="text-xl font-bold">INFRANTERY</h1>
				<FieldDescription>
					Don't have an account? <a href="/register">Sign up</a>
				</FieldDescription>
			</div>
			<Field>
				<FieldLabel for="email-{id}">Email or Username</FieldLabel>
				<Input
					id="email-{id}"
					type="text"
					placeholder="m@example.com"
					required
					bind:value={email}
				/>
			</Field>
			<Field>
				<FieldLabel for="password-{id}">Password</FieldLabel>
				<Input id="password-{id}" type="password" required bind:value={password} />
			</Field>
			{#if error}
				<div class="text-center text-sm font-medium text-destructive">
					{error}
				</div>
			{/if}
			<Field>
				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Logging in...' : 'Login'}
				</Button>
			</Field>
		</FieldGroup>
	</form>
	<FieldDescription class="px-6 text-center">
		By clicking continue, you agree to our <a href="##">Terms of Service</a> and
		<a href="##">Privacy Policy</a>.
	</FieldDescription>
</div>
