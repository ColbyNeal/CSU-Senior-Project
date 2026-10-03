<template>
  <div class="app">
    <header class="site-header">
      <h1>Center for Personal Financial Management</h1>

      <nav class="main-navigation">
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/game">Game</RouterLink>
        <RouterLink to="/join">Join</RouterLink>
        <RouterLink to="/careers">Careers</RouterLink>
        <RouterLink to="/info">Info</RouterLink>
      </nav>
    </header>

    <main class="site-content">
      <RouterView />
    </main>
  </div>
</template>