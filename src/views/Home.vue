<script setup>
import { onMounted, ref } from "vue";
import { getLatestBlsSeries } from "../utils/blsApi";
import { getCareers } from "../utils/careersApi";

const unemploymentRate = ref(null);
const careers = ref([]);

const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    const [series, careerData] = await Promise.all([
      getLatestBlsSeries("LNS14000000"),
      getCareers(),
    ]);

    unemploymentRate.value = series?.data?.[0]?.value ?? null;
    careers.value = careerData;
  } catch (err) {
    error.value = err.message || "Unable to load data.";
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
      Loading data...
    </p>

    <p v-else-if="error">
      Error: {{ error }}
    </p>

    <div v-else>
      <p>
        {{ unemploymentRate }}%
      </p>

      <h3>Career Explorer</h3>

      <ul>
        <li
          v-for="career in careers"
          :key="career.soc_code"
        >
          <RouterLink :to="`/careers/${career.soc_code}`">  
            {{ career.title }}
          </RouterLink>"
          ({{ career.soc_code }})
        </li>
      </ul>
    </div>
  </div>
</template>