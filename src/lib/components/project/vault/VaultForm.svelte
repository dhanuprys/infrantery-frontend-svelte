<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { vaultTypes } from '$lib/data/vault-type';
	import { Plus, Trash2, KeyRound, Loader2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let {
		type: typeKey,
		initialData = null,
		loading = false,
		onSubmit
	} = $props<{
		type: string;
		initialData?: Record<string, any> | null;
		loading?: boolean;
		onSubmit: (data: Record<string, any>) => Promise<void>;
	}>();

	// Active vault type definition
	let vaultType = $derived(vaultTypes[typeKey]);

	// Form state
	let formData = $state<Record<string, any>>({});

	// Key-value pairs state for free-field type
	let kvPairs = $state<{ key: string; value: string }[]>([{ key: '', value: '' }]);

	// Initialize form data when type or initialData changes
	$effect(() => {
		if (initialData) {
			formData = { ...initialData };

			// Special handling for free-field
			if (typeKey === 'FREE_FIELD' && initialData.fields) {
				kvPairs = Object.entries(initialData.fields).map(([key, value]) => ({
					key,
					value: String(value)
				}));
			}
		} else {
			formData = {};
			kvPairs = [{ key: '', value: '' }];
		}
	});

	// Ensure label is initialized
	$effect(() => {
		if (initialData && !formData.label) {
			formData.label = initialData.label || '';
		}
	});

	function addKvPair() {
		kvPairs = [...kvPairs, { key: '', value: '' }];
	}

	function removeKvPair(index: number) {
		kvPairs = kvPairs.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();

		try {
			// Process form data
			const dataToSubmit = { ...formData };

			// Process kvPairs for free-field
			if (typeKey === 'FREE_FIELD') {
				const fields: Record<string, string> = {};
				let hasEmptyKeys = false;

				kvPairs.forEach(({ key, value }) => {
					if (key.trim()) {
						fields[key.trim()] = value;
					} else if (value.trim()) {
						hasEmptyKeys = true;
					}
				});

				if (hasEmptyKeys) {
					toast.error('Some fields have values but no keys. Please provide keys.');
					return;
				}

				if (Object.keys(fields).length === 0) {
					toast.error('Please add at least one field.');
					return;
				}

				dataToSubmit.fields = fields;
			}

			await onSubmit(dataToSubmit);
		} catch (err: any) {
			console.error('Submission failed', err);
			// Toast is likely handled by parent, but logged here
		}
	}
</script>

<form onsubmit={handleSubmit} class="space-y-4">
	{#if vaultType && vaultType.fields}
		<div class="space-y-2">
			<Label for="label">Label <span class="text-destructive">*</span></Label>
			<Input
				id="label"
				type="text"
				bind:value={formData.label}
				placeholder="e.g., Production Database"
				required
			/>
		</div>

		{#each vaultType.fields as field}
			<div class="space-y-2">
				<Label for={field.name}>
					{field.label}
					{#if field.required}<span class="text-destructive">*</span>{/if}
				</Label>

				{#if field.type === 'textarea'}
					<Textarea
						id={field.name}
						bind:value={formData[field.name]}
						placeholder={`Enter ${field.label.toLowerCase()}...`}
						required={field.required}
						class="min-h-[100px]"
					/>
				{:else if field.type === 'password' || field.type === 'text'}
					<div class="relative">
						<Input
							id={field.name}
							type={field.type}
							bind:value={formData[field.name]}
							placeholder={`Enter ${field.label.toLowerCase()}...`}
							required={field.required}
						/>
					</div>
				{:else if field.type === 'key-value'}
					<div class="space-y-3">
						{#each kvPairs as pair, i}
							<div class="flex items-start gap-2">
								<div class="grid flex-1 gap-1.5">
									<Input placeholder="Key" bind:value={pair.key} />
								</div>
								<div class="grid flex-1 gap-1.5">
									<Input placeholder="Value" bind:value={pair.value} />
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="text-destructive hover:bg-destructive/10"
									onclick={() => removeKvPair(i)}
									disabled={kvPairs.length === 1 && i === 0 && !pair.key && !pair.value}
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							</div>
						{/each}

						<Button
							type="button"
							variant="outline"
							size="sm"
							class="w-full border-dashed"
							onclick={addKvPair}
						>
							<Plus class="mr-2 h-4 w-4" /> Add Field
						</Button>
					</div>
				{/if}
			</div>
		{/each}

		<div class="flex justify-end pt-4">
			<Button type="submit" disabled={loading}>
				{#if loading}
					<Loader2 class="mr-2 h-4 w-4 animate-spin" />
					Saving...
				{:else}
					Save Data
				{/if}
			</Button>
		</div>
	{:else}
		<div class="py-4 text-center text-muted-foreground">
			Unknown or invalid vault type configuration.
		</div>
	{/if}
</form>
