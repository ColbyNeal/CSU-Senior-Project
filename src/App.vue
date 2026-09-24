<script setup>
import { onMounted, ref } from "vue";

const apiMessage = ref("Connecting to backend...");
const apiStatus = ref("");

onMounted(async () => {
  try {
    const response = await fetch("http://localhost:3000/api/health");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    apiStatus.value = data.status;
    apiMessage.value = data.message;
  } catch (error) {
    apiStatus.value = "error";
    apiMessage.value = "Unable to connect to the Bun backend.";
    console.error(error);
  }
});
</script>

<template>
  <main>
    <h1>CSU Senior Project</h1>

    <section>
      <h2>Backend Connection</h2>

      <p>
        Status:
        <strong>{{ apiStatus }}</strong>
      </p>

      <p>{{ apiMessage }}</p>
    </section>
  </main>
</template>
