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
      <div class="header-inner">
        <RouterLink to="/" class="header-brand">
          <svg
            class="brand-icon"
            viewBox="0 0 40 40"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M20 3 3 11v3h34v-3L20 3Z" />
            <path d="M6 16h5v15H6zm8 0h5v15h-5zm8 0h5v15h-5zm8 0h5v15h-5z" />
            <path d="M3 33h34v4H3z" />
          </svg>

          <span>Center for Personal Financial Management</span>
        </RouterLink>

        <nav class="main-navigation" aria-label="Main navigation">
          <RouterLink to="/" exact-active-class="router-link-active">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3 2 12h3v9h6v-6h2v6h6v-9h3L12 3Z" />
            </svg>
            <span>Home</span>
          </RouterLink>

          <RouterLink to="/careers">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 3 1 9l11 6 9-4.91V17h2V9L12 3Zm-7 9.82V17l7 4 7-4v-4.18l-7 3.82-7-3.82Z" />
            </svg>
            <span>Careers</span>
          </RouterLink>

          <RouterLink to="/info">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm1 15h-2v-6h2v6Zm0-8h-2V7h2v2Z" />
            </svg>
            <span>Info</span>
          </RouterLink>
        </nav>
      </div>
    </header>

    <main
      class="site-content"
      :class="{ 'full-screen-game': fullScreenGame }"
    >
      <RouterView />
    </main>
  </div>
</template>