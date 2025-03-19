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
        const username = data.get('username') as string
        const rating = data.get('rating') as string
        const review = data.get('review') as string
        const listingName = data.get('listingName') as string
        try {
            await addReview(username, Number(rating), review, listingName, locals.mongoClient)

            return { success: true, message: 'Review submitted' }

        } catch (error) {
            console.error('Database error:', error)
            return { success: false, message: 'Failed to submit review' }
        }
    }
}

async function addReview(username: string, rating: number, review: string, listingName: string, client: MongoClient): Promise<void> {
    console.log('addReview: ', username, rating, review, listingName)
    if (username === '') throw new Error('Username is required')
    if (listingName === '') throw new Error('Listing name is required')
    if (review === '') throw new Error('Review is required')
    
    // Add review to the database

}

/* async function getUserId(username: string, client: MongoClient): Promise<ObjectId> {
    // Get user ID from the database
    // connect to the database
    try {
        const userDb = client.db('dwdd-3780')

    } catch (error) {
        throw new Error('Failed to get user ID')
    }
} */