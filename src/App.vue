<script setup>
import { ref, provide } from "vue";

const fullScreenGame = ref(false);

provide("setFullScreenGame", (active) => {
  fullScreenGame.value = active;
});
</script>

<template>
  <div class="app">
    <header v-if="!fullScreenGame" class="site-header">
      <h1>Center for Personal Financial Management</h1>

      <nav class="main-navigation">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/careers">Careers</RouterLink>
        <RouterLink to="/info">Info</RouterLink>
      </nav>
    </header>

    <main
      class="site-content"
      :class="{ 'full-screen-game': fullScreenGame }"
    >
      <RouterView />
    </main>
  </div>
</template>