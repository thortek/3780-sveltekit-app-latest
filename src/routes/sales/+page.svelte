<script lang="ts">
	import { onMount } from 'svelte'
	import type { SaleData, Item } from '$lib/types/SalesTypes'
	import SaleDetails from '$lib/components/SaleDetails.svelte'
	import { Accordion } from '@skeletonlabs/skeleton-svelte'
	import BadgeDollarSign from '@lucide/svelte/icons/badge-dollar-sign'

	// Convert to $state rune
	let salesData = $state<SaleData[]>([])
	let itemName = $state<string>('')
	let couponUsed = $state<boolean>(false)
	let loading = $state<boolean>(false)

	onMount(() => {
		console.log('Just mounted... going to fetch sales data')
		//getSalesData()
	})

    const totalCost = (sale: SaleData) => {
		return sale.items
			?.reduce(
				(sum: number, item: Item) => sum + parseFloat(item.price.$numberDecimal) * item.quantity,
				0
			)
			?.toFixed(2) || '0.00'
    }

	async function getSalesData() {
		loading = true
		const response = await fetch(`/api/sales?itemName=${itemName}&couponUsed=${couponUsed}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json'
			},
		})
		if (!response.ok) {
			salesData = []
			loading = false
			return
		}
		const data = await response.json()
		console.log('Sales data:', data)
		salesData = data
		loading = false
	}

	const storeStats = async () => {
		loading = true
		const salesDataToStore = salesData.map((sale) => {
			return {
				_id: sale._id,
				items: sale.items.filter(item => item.name.toLowerCase().includes(itemName.toLowerCase()))
				.map(item => ({
					name: item.name,
					price: item.price.$numberDecimal,
				})),
				purchaseMethod: sale.purchaseMethod,
				storeLocation: sale.storeLocation,
				saleDate: sale.saleDate,
			}
		})

		const snapshot = {
			salesData: salesDataToStore,
			itemName: itemName,
			couponUsed: couponUsed,
			createdAt: new Date().toISOString(),
		}

		const response = await fetch('/api/sales', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(snapshot)
		})
		if (!response.ok) {
			salesData = []
			loading = false
			return
		}
		console.log('Stored sales data')
		loading = false
	}


</script>

<main class="flex flex-col items-center justify-center">
	<div class="flex w-full flex-col items-center justify-center gap-2 bg-slate-200">
		<h1 class="text-3xl">Sales Data</h1>
		<form class="flex w-full flex-col items-center justify-center">
			<div class="flex">
				<label for="itemName">Only show data for sales that contain:</label>
				<input
					type="text"
					placeholder="Item Name"
					class="input input-bordered w-full max-w-xs"
					bind:value={itemName}
				/>
			</div>
			<label class="flex items-center space-x-2">
				<input type="checkbox" class="checkbox" bind:checked={couponUsed} />
				<span>Coupon Used</span>
			</label>
		</form>
		<div class="flex">
		<button class="btn preset-filled-primary-500 m-4" onclick={getSalesData}>Get Sales Data</button>
		<button class="btn preset-filled-primary-500 m-4" onclick={storeStats}
		disabled={!itemName || salesData.length === 0}>Save Snapshot</button>
		</div>
	</div>

	{#if salesData.length > 0}
		<p class="text-2xl">Found {salesData.length} sales</p>
		<Accordion collapsible>
			{#each salesData as sale}
				<Accordion.Item value={sale._id} leadClasses="flex items-center gap-2">
					{#snippet lead()}<BadgeDollarSign size={24} /> {totalCost(sale)}{/snippet}
					{#snippet control()}{sale.storeLocation}{/snippet}
					{#snippet panel()}<SaleDetails salesData={sale} />{/snippet}
				</Accordion.Item>
			{/each}
		</Accordion>
	{/if}

    {#if salesData.length === 0 && !loading}
        <p class="text-2xl">0 sales found</p>
    {/if}
</main>
