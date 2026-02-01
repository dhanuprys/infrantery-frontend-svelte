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

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const id = $props.id();
</script>

<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
	<form>
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
					Don't have an account? <a href="/signup">Sign up</a>
				</FieldDescription>
			</div>
			<Field>
				<FieldLabel for="email-{id}">Email</FieldLabel>
				<Input id="email-{id}" type="email" placeholder="m@example.com" required />
			</Field>
			<Field>
				<FieldLabel for="password-{id}">Password</FieldLabel>
				<Input id="password-{id}" type="password" required />
			</Field>
			<Field>
				<Button type="submit">Login</Button>
			</Field>
		</FieldGroup>
	</form>
	<FieldDescription class="px-6 text-center">
		By clicking continue, you agree to our <a href="##">Terms of Service</a> and
		<a href="##">Privacy Policy</a>.
	</FieldDescription>
</div>
