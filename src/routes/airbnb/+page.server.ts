import { ObjectId, Decimal128, MongoClient } from 'mongodb'
import type { PageServerLoad } from './$types'
import type { RequestEvent } from './$types'

function convertDecimal128FieldsToNumber(doc: unknown): unknown {
	if (typeof doc === 'object' && doc !== null) {
		for (let key in doc as Record<string, unknown>) {
			const value = (doc as Record<string, unknown>)[key];
			if (value instanceof Decimal128) {
				(doc as Record<string, unknown>)[key] = value.toString();
			} else if (typeof value === 'object' && value !== null) {
				(doc as Record<string, unknown>)[key] = convertDecimal128FieldsToNumber(value);
			}
		}
	}
	return doc;
}


export const load: PageServerLoad = async ({ locals }: RequestEvent) => {
    //console.log('locals: ', locals)

    let airbnbs = []
    const client = locals.mongoClient as MongoClient

    try {
        const airbnbDb = client.db('sample_airbnb')
        const airbnbCollection = airbnbDb.collection('listingsAndReviews')
        const airbnbArray = await airbnbCollection.find().limit(10).toArray()

        // Convert Decimal128 prices to numbers
        const airbnbs = airbnbArray.map((doc) => {
            return convertDecimal128FieldsToNumber(doc)
        })

        //console.log('airbnbs: ', airbnbs)
        return { airbnbs }
    } catch (error) {
        // Return error for recoverable database issues
		console.error('Database error:', error);
		return {
			airbnbs: [],
			error: 'Failed to load listings'
		};
    }
}

export const actions = {
    submitReview: async ({ request, locals }: RequestEvent) => {
        //const client = locals.mongoClient as MongoClient
        const data = await request.formData()
        console.log(data)
        return { success: true, message: 'Review submitted' }
    }
}