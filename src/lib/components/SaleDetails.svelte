<script lang="ts">
    import type { DecimalValue, Item, Customer, SaleData } from "$lib/types/SalesTypes";

    // Props for the component using Svelte 5 $props rune
    const { saleData = defaultSaleData() } = $props<{ saleData?: SaleData }>();

    // Default sale data to prevent undefined errors
    function defaultSaleData(): SaleData {
        return {
            _id: '5bd761dcae323e45a93ccfe8',
            saleDate: new Date().toISOString(),
            items: [{
			name: "printer paper",
			tags: ["office", "stationary"],
			price: { $numberDecimal: "40.01" },
			quantity: 2
		},
		{
			name: "notepad",
			tags: ["office", "writing", "school"],
			price: { $numberDecimal: "35.29" },
			quantity: 2
		},
		{
			name: "pens",
			tags: ["writing", "office", "school", "stationary"],
			price: { $numberDecimal: "56.12" },
			quantity: 5
		}],
            storeLocation: 'Denver',
            customer: { 
                gender: 'M', 
                age: 42, 
                email: 'cauho@witwuta.sv', 
                satisfaction: 4 
            },
            couponUsed: false,
            purchaseMethod: 'Online'
        };
    }

    // Calculate totals and statistics using Svelte 5 $derived rune with null checks
    const totalItems = $derived(saleData?.items?.reduce((sum: number, item: Item) => sum + item.quantity, 0) || 0);
    
    const totalCost = $derived(saleData?.items?.reduce(
        (sum: number, item: Item) => sum + (parseFloat(item.price.$numberDecimal) * item.quantity),
        0
    )?.toFixed(2) || '0.00');

    // Get all unique tags and their counts for the tag cloud
    const tags = $derived(saleData?.items?.flatMap((item: Item) => item.tags) || []);
    
    const tagCounts = $derived(tags.reduce((acc: { [x: string]: any; }, tag: string | number) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {} as Record<string, number>));
    
    // Format date nicely
    const formattedDate = $derived(new Date(saleData?.saleDate || new Date()).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }));

    // Check if the sale was on a weekend
    const isWeekend = $derived([0, 6].includes(new Date(saleData?.saleDate || new Date()).getDay()));
</script>

{#if !saleData || !saleData._id}
    <div class="p-4 max-w-7xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <div class="animate-pulse">
                <div class="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mx-auto mb-4"></div>
                <div class="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mx-auto"></div>
            </div>
            <p class="mt-4 text-gray-500 dark:text-gray-400">Loading sales data...</p>
        </div>
    </div>
{:else}
    <div class="p-4 max-w-7xl mx-auto">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-blue-600 text-white p-4 md:p-6">
                <div class="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 class="text-xl md:text-2xl font-bold">Sale Receipt</h1>
                        <p class="text-blue-100">ID: {saleData._id.substring(0, 8)}...</p>
                    </div>
                    <div class="flex flex-col items-start md:items-end">
                        <span class="font-semibold">{formattedDate}</span>
                        <span class="bg-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                            {saleData.purchaseMethod}
                            {#if isWeekend}
                                <span class="ml-1 bg-yellow-500 text-black px-1 rounded-sm text-[10px]">Weekend</span>
                            {/if}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                <!-- Store Location -->
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h2 class="text-gray-500 dark:text-gray-300 text-sm font-medium">Store Location</h2>
                    <p class="text-lg font-bold">{saleData.storeLocation}</p>
                </div>
                
                <!-- Total Items -->
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h2 class="text-gray-500 dark:text-gray-300 text-sm font-medium">Total Items</h2>
                    <p class="text-lg font-bold">{totalItems}</p>
                </div>
                
                <!-- Total Cost -->
                <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <h2 class="text-gray-500 dark:text-gray-300 text-sm font-medium">Total Cost</h2>
                    <p class="text-lg font-bold">${totalCost}</p>
                    {#if saleData.couponUsed}
                        <span class="text-green-500 text-xs font-medium">Coupon Applied</span>
                    {/if}
                </div>
            </div>

            <!-- Customer Information -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold mb-3">Customer Information</h2>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p class="font-medium">{saleData.customer.email}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Age</p>
                        <p class="font-medium">{saleData.customer.age}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Gender</p>
                        <p class="font-medium">{saleData.customer.gender}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Satisfaction</p>
                        <div class="flex items-center">
                            {#each Array(5) as _, i}
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 {i < saleData.customer.satisfaction ? 'text-yellow-400' : 'text-gray-300'}" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>

            <!-- Items Table -->
            <div class="p-4 border-t border-gray-200 dark:border-gray-700">
                <h2 class="text-lg font-semibold mb-3">Items Purchased</h2>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Item</th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tags</th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Unit Price</th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {#each saleData.items as item, i}
                                <tr class={i % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{item.name}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                                        <div class="flex flex-wrap gap-1">
                                            {#each item.tags as tag}
                                                <span class="bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100 text-xs px-2 py-0.5 rounded">{tag}</span>
                                            {/each}
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">${item.price.$numberDecimal}</td>
                                    <td class="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">{item.quantity}</td>
                                    <td class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                                        ${(parseFloat(item.price.$numberDecimal) * item.quantity).toFixed(2)}
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                        <tfoot>
                            <tr class="bg-gray-50 dark:bg-gray-700">
                                <td colspan="4" class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white text-right">Total</td>
                                <td class="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">${totalCost}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <!-- Visual Data -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
                <!-- Items by Quantity Chart -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Items by Quantity</h3>
                    <div class="h-64 flex items-end space-x-2">
                        {#each saleData.items as item}
                            <div class="flex flex-col items-center flex-1">
                                <div class="bg-blue-500 dark:bg-blue-600 w-full rounded-t" 
                                     style="height: {(item.quantity / Math.max(...saleData.items.map((i: { quantity: any; }) => i.quantity))) * 100}%">
                                </div>
                                <div class="text-xs mt-2 text-center truncate w-full" title={item.name}>
                                    {item.name}
                                </div>
                                <div class="text-xs font-semibold text-gray-500">{item.quantity}</div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Tag Cloud -->
                <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                    <h3 class="font-medium text-gray-700 dark:text-gray-300 mb-4">Popular Tags</h3>
                    <div class="flex flex-wrap gap-2">
                        {#each Object.entries(tagCounts) as [tag, count] (tag)}
                            <span class="px-3 py-1 rounded-full" 
                                  style="font-size: {100 + (count as number) * 20}%; background-color: #{((Math.abs(tag.charCodeAt(0) * 12345) % 0xFFFFFF) | 0x200000).toString(16)}20">
                                {tag} ({count})
                            </span>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}