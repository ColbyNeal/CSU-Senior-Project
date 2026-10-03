<script setup>
import { onMounted, ref } from "vue";

const careers = ref([]);
const loading = ref(true);
const error = ref("");

async function loadCareers() {
  try {
    const response = await fetch("http://localhost:3000/api/careers");

    if (!response.ok) {
      throw new Error("Unable to load careers.");
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Unable to load careers.");
    }

    careers.value = data.careers;
  } catch (err) {
    console.error("Career loading error:", err);
    error.value = "Unable to load career data.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadCareers();
});
</script>

<template>
  <section class="careers-page">
    <div class="careers-container">
      <h1>Career Explorer</h1>

      <p class="careers-intro">
        Select a career to view its available BLS information.
      </p>

      <div v-if="loading" class="careers-message">
        Loading careers...
      </div>

      <div v-else-if="error" class="careers-message error">
        {{ error }}
      </div>

      <div v-else class="careers-table-container">
        <table class="careers-table">
          <thead>
            <tr>
              <th>Career</th>
              <th>SOC Code</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="career in careers" :key="career.soc_code">
              <td>
                <RouterLink
                  :to="`/careers/${encodeURIComponent(career.soc_code)}`"
                  class="career-link"
                >
                  {{ career.title }}
                </RouterLink>
              </td>

              <td>
                {{ career.soc_code }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>

<style scoped>
.careers-page {
  min-height: calc(100vh - 150px);
  padding: 3rem 2rem;
  background: #ffffff;
}

.careers-container {
  width: min(1200px, 100%);
  margin: 0 auto;
}

.careers-container h1 {
  margin: 0;
  color: #123f73;
  font-size: 3rem;
  font-weight: 900;
}

.careers-intro {
  margin: 0.75rem 0 2rem;
  color: #555;
  font-size: 1.2rem;
}

.careers-table-container {
  overflow-x: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
}

.careers-table {
  width: 100%;
  border-collapse: collapse;
}

.careers-table th {
  padding: 1rem 1.25rem;
  background: #123f73;
  color: #ffffff;
  text-align: left;
  font-size: 1.1rem;
}

.careers-table td {
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid #ddd;
  color: #333;
}

.careers-table tbody tr:hover {
  background: #f5f8fb;
}

.career-link {
  color: #123f73;
  font-weight: 700;
  text-decoration: none;
}

.career-link:hover {
  color: #b88922;
  text-decoration: underline;
}

.careers-message {
  padding: 2rem;
  text-align: center;
  color: #123f73;
  font-size: 1.2rem;
}

.careers-message.error {
  color: #b00020;
}
</style>