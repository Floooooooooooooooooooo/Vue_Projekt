# Ideenwerkstatt

Kleine Vue-3-App zum Sammeln, Planen und Umsetzen von Ideen – aufgebaut als
Master-Detail-Ansicht mit Vue Router.

## Features

- Ideen anlegen, bearbeiten und löschen (mit Rückfrage)
- Suche über Titel, Kategorie und verantwortliche Person
- Filter nach Status, Sortierung nach Priorität, Fälligkeit oder Titel
- Priorität und Fälligkeitsdatum in der Liste, überfällige Ideen werden markiert
- Jede Idee hat eine eigene URL (`/ideen/:id`), unbekannte IDs zeigen einen Hinweis
- Startdaten werden per `fetch` aus `public/data/ideas.json` geladen,
  Änderungen landen automatisch im `localStorage`

## Projektstruktur

```
src/
├── App.vue                  # Layout mit Header und Navigation
├── constants.js             # Status, Prioritäten, Sortierung, Storage-Key
├── composables/
│   └── useIdeas.js          # Laden, Speichern und Ändern der Ideen
├── components/
│   ├── IdeaList.vue         # Liste (Props: ideas, selectedId · Events: select, remove)
│   └── IdeaDetail.vue       # Detailformular (Props: idea, missing · Event: update)
├── router/index.js
└── views/
    ├── HomeView.vue         # Parent: koordiniert Liste und Detailansicht
    └── AboutView.vue
```

## Starten

Voraussetzung: Node.js 22.18+ oder 24.12+

```sh
npm install
npm run dev       # Entwicklungsserver mit Hot-Reload
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```
