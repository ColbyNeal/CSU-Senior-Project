<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getCareerDetails } from "../utils/careerDetailsApi";

const route = useRoute();

const career = ref(null);
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    career.value = await getCareerDetails(route.params.socCode);
  } catch (err) {
    error.value = err.message || "Unable to load career details.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2>Career Details</h2>

    <p>
      <RouterLink to="/">
        Back to Career Explorer
      </RouterLink>
    </p>

    <p v-if="loading">
      Loading career details...
    </p>

    <p v-else-if="error">
      Error: {{ error }}
    </p>

    <div v-else-if="career">
      <h3>{{ career.title }}</h3>

      <p>
        <strong>SOC Code:</strong>
        {{ career.soc_code }}
      </p>

      <p>
        <strong>Employment:</strong>
        {{ career.employment.toLocaleString() }}
      </p>

      <p>
        <strong>Median Annual Wage:</strong>
        ${{ career.median_annual_wage.toLocaleString() }}
      </p>

      <p>
        <strong>Mean Annual Wage:</strong>
        ${{ career.mean_annual_wage.toLocaleString() }}
      </p>

      <p>
        <strong>Mean Hourly Wage:</strong>
        ${{ career.mean_hourly_wage.toFixed(2) }}
      </p>

      <p>
        <strong>10th Percentile:</strong>
        ${{ career.wage_10th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>25th Percentile:</strong>
        ${{ career.wage_25th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>75th Percentile:</strong>
        ${{ career.wage_75th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>90th Percentile:</strong>
        ${{ career.wage_90th_percentile.toLocaleString() }}
      </p>

      <p>
        <strong>Data:</strong>
        {{ career.data_period }} {{ career.data_year }}
      </p>

      <p>
        <strong>Source:</strong>
        {{ career.source }}
      </p>
    </div>
  </div>
</template>