<script lang="ts">
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import AirbnbListings from '$lib/components/AirbnbListings.svelte';
	import { Rating } from '@skeletonlabs/skeleton-svelte';
	import { enhance } from '$app/forms';
	import { updated } from '$app/state';
	import type { ActionData, PageData } from './$types';

	// Correctly type both data and form using a single $props call
	const { data, form } = $props<{ data: PageData; form: ActionData | null }>();

	//console.log(data.userProfile)
	if (!data.userProfile && browser) {
		console.log('No user profile');
		goto('/');
	}

	let scrollElement: HTMLElement;
	let formVisible = $state(true);
	let starValue = $state(2);
	let listingName = $state('My Listing');
	let loading = $state(false);

	let selectedListing = $state('');

	// Callback function to handle listing selection
	function handleSelectListing(listing: any) {
		console.log('Selected listing:', listing);
		selectedListing = listing;
		formVisible = true;
		// Set the listing name for the review form
		if (listing && listing.name) {
			listingName = listing.name;
		}
		scrollElement.scrollIntoView({ behavior: 'smooth' });
	}

	// Reset the form
	function resetForm() {
		formVisible = false;
		selectedListing = '';
		starValue = 1;
	}
</script>

<main bind:this={scrollElement}>
	<!-- Your form that uses the selected listing ID -->
	{#if selectedListing && formVisible}
		<form
			method="POST"
			action="?/submitReview"
			class="mx-auto mt-8 max-w-2xl rounded-lg bg-white p-4 shadow-lg"
			use:enhance={() => {
				loading = true;

				return async ({ update }) => {
					await update();
					if (form?.success) {
						resetForm();
					}
					loading = false;
				};
			}}
		>
			<input type="hidden" name="selectedListing" value={selectedListing} />
			<input type="hidden" name="username" value={data.userProfile.name} />
			<input type="hidden" name="listingName" value={listingName} />
			<div>
				<p class="text-2xl">Review of: {listingName}</p>
				<Rating value={starValue} allowHalf onValueChange={(e) => (starValue = e.value)} />
				<label for="review" class="mt-4 mb-2 block">Your Review</label>
				<textarea
					class="textarea w-full"
					id="review"
					rows="4"
					required
					name="review"
					placeholder="Write your review here"
				></textarea>
				<div class="m-2 flex justify-end gap-2">
					<button
						class="btn preset-filled-secondary-50-950"
						type="button"
						onclick={() => (formVisible = false)}>Cancel</button
					>
					<button class="btn preset-filled-primary-50-950" type="submit" disabled={loading}
						>{loading ? 'Uploading review...' : 'Submit Review'}</button
					>
				</div>
			</div>
		</form>
		{#if form}
			<div class={`${form.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
				{form.message}
			</div>
		{/if}
	{/if}

	{#if form?.reviews && !selectedListing}
		<div class="w-full">
			<!-- Scroll Container -->
			<div
				class="flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 py-10"
			>
				<!-- Generate a array of 8 items; loop through each item -->
				{#each form.reviews as review, i}
					<div
						class="card preset-filled-primary-50-950 max-h-72 w-40 shrink-0 cursor-pointer snap-start overflow-y-auto px-2 py-5 text-center shadow-2xl md:w-80"
					>
						<p class="text-2xl">{review.rating}</p>
						<Rating
							value={review.rating}
							allowHalf
							onValueChange={(e) => (starValue = e.value)}
							readOnly
						/>

						<p class="text-2xl">{review.reviewer_name}</p>
						<p>{review.comments}</p>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<AirbnbListings listings={data.airbnbs} onSelectListing={handleSelectListing} />
</main>
