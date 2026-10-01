<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <main class="about-page">
    <p class="eyebrow">ÜBER DIE APP</p>
    <h1>Eine kleine Werkstatt für große Ideen.</h1>
    <p class="intro">
      Diese Vue-Anwendung zeigt, wie eine veränderbare Liste als Master-Detail-Ansicht
      organisiert werden kann. Alle Eingaben werden direkt übernommen und lokal im Browser
      gespeichert.
    </p>

    <div class="feature-grid">
      <article>
        <span>01</span>
        <h2>Parent &amp; Child</h2>
        <p>Die Hauptansicht koordiniert Liste und Detailformular über Props und Events.</p>
      </article>
      <article>
        <span>02</span>
        <h2>Reaktive Daten</h2>
        <p><code>reactive</code> hält die Sammlung aktuell, <code>ref</code> steuert Suche und Filter.</p>
      </article>
      <article>
        <span>03</span>
        <h2>Fetch &amp; Router</h2>
        <p>Startdaten kommen aus JSON; jede gewählte Idee erhält eine eigene URL.</p>
      </article>
    </div>

    <RouterLink class="back-link" to="/">← Zurück zur Werkstatt</RouterLink>
  </main>
</template>
