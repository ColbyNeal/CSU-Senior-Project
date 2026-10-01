<script setup>
import { onMounted, ref } from "vue";
import { getCareers } from "../utils/careersApi";

const careers = ref([]);
const selectedCareer = ref("");
const loading = ref(true);
const error = ref("");

onMounted(async () => {
  try {
    careers.value = await getCareers();
  } catch (err) {
    error.value = err.message || "Unable to load careers.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div>
    <h2>Budget</h2>

    <p>
      Select a career to begin building your monthly budget.
    </p>

    <p v-if="loading">
      Loading careers...
    </p>

    <p v-else-if="error">
      Error: {{ error }}
    </p>

    <div v-else>
      <label for="career">
        <strong>Career:</strong>
      </label>

      <select id="career" v-model="selectedCareer">
        <option value="">
          Select a career
        </option>

        <option
          v-for="career in careers"
          :key="career.soc_code"
          :value="career.soc_code"
        >
          {{ career.title }}
        </option>
      </select>

      <p v-if="selectedCareer">
        Selected career:
        {{ careers.find(career => career.soc_code === selectedCareer)?.title }}
      </p>
    </div>
  </div>
</template>