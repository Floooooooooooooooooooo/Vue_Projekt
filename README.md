# Ideenwerkstatt

Kleine Vue-3-App zum Sammeln, Diskutieren und Bewerten von Ideen – aufgebaut als
Master-Detail-Ansicht mit Vue Router.

## Features

- Ideen sammeln, bearbeiten und löschen (mit Rückfrage)
- **Tags** – per Klick auf einen Tag wird die Liste danach gefiltert
- **Upvotes** – eine Stimme pro Idee und Browser, Sortierung nach „Beliebteste“
- **Pro & Contra** – Argumente für und gegen eine Idee festhalten
- **Kommentare** mit Name und Zeitstempel
- Status-Workflow: Neu → In Diskussion → Favorit / Verworfen
- Suche über Titel, Kategorie, Person und Tags; Filter nach Status
- Jede Idee hat eine eigene URL (`/ideen/:id`), unbekannte IDs zeigen einen Hinweis
- Startdaten werden per `fetch` aus `public/data/ideas.json` geladen,
  Änderungen landen automatisch im `localStorage` (ältere Daten werden migriert)

## Projektstruktur

```
src/
├── App.vue                  # Layout mit Header und Navigation
├── constants.js             # Status, Prioritäten, Sortierung, Storage-Keys
├── composables/
│   └── useIdeas.js          # Laden, Speichern, Migrieren, Abstimmen
├── components/
│   ├── IdeaList.vue         # Liste (Props: ideas, selectedId, votedIds · Events: select, remove, tag, vote)
│   ├── IdeaDetail.vue       # Detailformular (Props: idea, missing · Event: update)
│   ├── ArgumentList.vue     # Pro- bzw. Contra-Liste (Props: title, items, variant · Event: update)
│   └── IdeaComments.vue     # Kommentare (Props: comments · Event: update)
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
