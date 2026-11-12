<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <RouterLink class="brand" to="/" aria-label="Ideenwerkstatt Startseite">
        <span class="brand-mark">IW</span>
        <span>
          <strong>Ideenwerkstatt</strong>
          <small>Sammeln · Diskutieren · Bewerten</small>
        </span>
      </RouterLink>

      <nav aria-label="Hauptnavigation">
        <RouterLink to="/">Werkstatt</RouterLink>
        <RouterLink to="/about">Über die App</RouterLink>
      </nav>
    </header>

    <RouterView />
  </div>
</template>
