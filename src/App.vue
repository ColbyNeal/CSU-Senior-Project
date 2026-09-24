<template>
  <div class="app">
    <header class="app-header">
      <h1>CSU Senior Project</h1>

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/budget">Budget</RouterLink>
      </nav>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>
