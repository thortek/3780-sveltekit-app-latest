<script lang="ts">
  import { onMount } from "svelte";

  onMount(() => {
    console.log("Page data:");
  });

  async function getSalesData() {
    const response = await fetch(`/api/sales`)
    const data = await response.json()
    console.log("Sales data:", data);
  }
</script>
<h1>Sales Page</h1>
<button class="btn preset-filled-primary-500" onclick={getSalesData}>Get Sales Data</button>