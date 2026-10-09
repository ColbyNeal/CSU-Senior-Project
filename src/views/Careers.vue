
<script setup>
import { computed, onMounted, ref } from "vue";

const careers = ref([]);
const loading = ref(true);
const error = ref("");
const searchQuery = ref("");

const filteredCareers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  const seenCodes = new Set();

  return careers.value.filter((career) => {
    const socCode = String(career.soc_code ?? "").trim();
    const title = String(career.title ?? "");

    if (!socCode || seenCodes.has(socCode)) {
      return false;
    }

    const matchesSearch =
      !query ||
      title.toLowerCase().includes(query) ||
      socCode.toLowerCase().includes(query);

    if (!matchesSearch) {
      return false;
    }

    seenCodes.add(socCode);
    return true;

  });
});

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

      <!-- CAREER TABLE AND SEARCH -->
      <div v-else>
        <!-- SEARCH -->
        <div class="row mb-3">
          <div class="col-md-6 col-lg-5">
            <label for="careerSearch" class="form-label fw-semibold">
              Search Careers
            </label>

            <div class="input-group">
              <span class="input-group-text">
                <i class="bi bi-search" aria-hidden="true"></i>
              </span>

              <input
                id="careerSearch"
                v-model="searchQuery"
                type="search"
                class="form-control"
                placeholder="Enter a career or SOC code..."
                aria-describedby="searchHelp"
              />

              <button
                v-if="searchQuery"
                type="button"
                class="btn btn-outline-secondary"
                @click="searchQuery = ''"
                aria-label="Clear search"
              >
                Clear
              </button>
            </div>

            <small id="searchHelp" class="form-text text-secondary">
              Search by career title or SOC code.
            </small>
          </div>
        </div>

        <!-- RESULTS TABLE -->
        <div class="table-responsive shadow-sm rounded">
          <table class="table table-hover table-striped mb-0">
            <thead class="table-dark">
              <tr>
                <th scope="col">Career</th>
                <th scope="col">SOC Code</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="career in filteredCareers"
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

                <td>{{ career.soc_code }}</td>
              </tr>

              <tr v-if="filteredCareers.length === 0">
                <td colspan="2" class="text-center py-4 text-secondary">
                  No careers found. Try another search.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p class="text-secondary small mt-2">
          Showing {{ filteredCareers.length }}
          of {{ careers.length }} careers.
        </p>
      </div>

    </div>
  </section>
</template>