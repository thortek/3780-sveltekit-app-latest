<script lang="ts">
	import { onMount } from 'svelte'
	import type { SaleData } from '$lib/types/SalesTypes'
	import SaleDetails from '$lib/components/SaleDetails.svelte'

	// Convert to $state rune
	let salesData = $state<SaleData | undefined>(undefined)

	onMount(() => {
		console.log('Page data:')
	})

	async function getSalesData() {
		const response = await fetch(`/api/sales`)
		const data = await response.json()
		console.log('Sales data:', data)
		salesData = data
	}
</script>

<h1>Sales Page</h1>
<button class="btn preset-filled-primary-500" onclick={getSalesData}>Get Sales Data</button>

<SaleDetails saleData={salesData} />
