<script setup>
import { onMounted, ref } from "vue";
import { getLatestBlsSeries } from "../utils/blsApi";

const unemploymentRate = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const series = await getLatestBlsSeries("LNS14000000");

    unemploymentRate.value = series?.data?.[0]?.value ?? null;
  } catch (err) {
    error.value = err.message || "Unable to load BLS data.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2>CSU Senior Project</h2>

    <p>Welcome to the BLS Career Explorer.</p>

    <h3>Latest U.S. Unemployment Rate</h3>

    <p v-if="loading">
      Loading BLS data...
    </p>

    <p v-else-if="error">
      Error: {{ error }}
    </p>

    <p v-else>
      {{ unemploymentRate }}%
    </p>
  </div>
</template>