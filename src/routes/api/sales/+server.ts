

export async function GET( { url, locals }) {

    let salesData
    let client

    try {

        client = locals.mongoClient
        const salesDb = client.db('sample_supplies')
        const salesCollection = salesDb.collection('sales')

        salesData = await salesCollection.find().toArray()

        console.log('salesArray', salesData)

    } catch (error) {
        console.error('Error fetching sales data:', error);
        return new Response(JSON.stringify({ error: 'Error fetching sales data' }), { status: 500 });
    }
    return new Response(JSON.stringify(salesData), { status: 200 });

}

export async function POST( { request }) {
    const body = await request.json();
    console.log(body);
    return new Response(JSON.stringify({ message: 'ok' }), { status: 200 });
}