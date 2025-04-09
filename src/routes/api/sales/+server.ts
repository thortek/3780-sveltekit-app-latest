import type { SaleData } from '$lib/types/SalesTypes.js'

export async function GET({ url, locals }) {
	const itemName = url.searchParams.get('itemName')
	const couponUsed = url.searchParams.get('couponUsed')

	let salesData: SaleData[] = []
	let client

	try {
		client = locals.mongoClient
		const salesDb = client.db('sample_supplies')
		const salesCollection = salesDb.collection('sales')

		salesData = await salesCollection.find().limit(50).toArray()

		// Apply itemName filter if it exists
		if (itemName) {
			console.log('itemName:', itemName);
			salesData = salesData.filter(
				(sale: SaleData) =>
					sale.items &&
					sale.items.some(
						(item: any) => item.name && item.name.toLowerCase() === itemName.toLowerCase()
					)
			);
		}

		// Apply couponUsed filter if it's 'true', regardless of itemName
		if (couponUsed === 'true') {
			salesData = salesData.filter((sale: SaleData) => sale.couponUsed === true);
		}

		return new Response(JSON.stringify(salesData), { status: 200 })
	} catch (error) {
		console.error('Error fetching sales data:', error)
		return new Response(JSON.stringify({ error: 'Error fetching sales data' }), { status: 500 })
	}
}

export async function POST({ request }) {
	const body = await request.json()
	//console.log(body);
	return new Response(JSON.stringify({ message: 'ok' }), { status: 200 })
}
