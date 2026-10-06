<script setup>
import { onMounted, ref } from "vue";

const careers = ref([]);
const loading = ref(true);
const error = ref("");

async function loadCareers() {
  try {
    const response = await fetch("http://localhost:3000/api/careers");

    if (!response.ok) {
      throw new Error("Unable to laod careers.");
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
  <section class="bg-light min-vh-100 py-5">
    <div class="container">

      <!-- PAGE HEADER -->
      <div class="mb-4">
        <h1 class="fw-bold text-primary">
          Career Explorer
        </h1>

        <p class="lead text-secondary mb-0">
          Select a career to view its available BLS information.
        </p>
      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="text-center py-5"
      >
        <div
          class="spinner-border text-primary"
          role="status"
        >
          <span class="visually-hidden">
            Loading careers...
          </span>
        </div>

        <p class="mt-3 text-secondary">
          Loading careers...
        </p>
      </div>

      <!-- ERROR -->
      <div
        v-else-if="error"
        class="alert alert-danger"
        role="alert"
      >
        {{ error }}
      </div>

      <!-- CAREER TABLE -->
      <div
        v-else
        class="table-responsive shadow-sm rounded"
      >
        <table class="table table-hover table-striped mb-0">

          <thead class="table-dark">
            <tr>
              <th scope="col">
                Career
              </th>

              <th scope="col">
                SOC Code
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="career in careers"
              :key="career.soc_code"
            >
              <td>
                <RouterLink
                  :to="`/careers/${encodeURIComponent(career.soc_code)}`"
                  class="fw-bold text-decoration-none"
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