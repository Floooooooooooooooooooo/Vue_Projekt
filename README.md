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
- **Gemeinsame Datenbank (Supabase):** alle sehen denselben Stand,
  Änderungen anderer erscheinen live ohne Neuladen
- Eingaben werden automatisch (kurz verzögert) gespeichert, der Status wird angezeigt

## Projektstruktur

```
src/
├── App.vue                  # Layout mit Header und Navigation
├── constants.js             # Status, Prioritäten, Sortierung
├── lib/
│   └── supabase.js          # Supabase-Client (liest .env.local)
├── composables/
│   └── useIdeas.js          # Laden, Speichern, Abstimmen, Kommentare, Realtime
├── components/
│   ├── IdeaList.vue         # Liste (Props: ideas, selectedId, votedIds · Events: select, remove, tag, vote)
│   ├── IdeaDetail.vue       # Detailformular (Props: idea, missing · Event: update)
│   ├── ArgumentList.vue     # Pro- bzw. Contra-Liste (Props: title, items, variant · Event: update)
│   └── IdeaComments.vue     # Kommentare (Props: comments · Event: update)
├── router/index.js
└── views/
    ├── HomeView.vue         # Parent: koordiniert Liste und Detailansicht
    └── AboutView.vue
supabase/
└── schema.sql               # Tabellen, Zugriffsregeln, Realtime, Beispieldaten
```

## Datenbank einrichten (einmalig)

Die Daten liegen in [Supabase](https://supabase.com) (gehostetes PostgreSQL).
Das Projekt muss nur **einmal** angelegt werden – alle im Team verwenden danach dieselben Zugangsdaten.

1. Auf supabase.com ein kostenloses Projekt anlegen.
2. Im Dashboard **SQL Editor** öffnen, den Inhalt von `supabase/schema.sql` einfügen und ausführen.
   Das legt die Tabellen `ideas` und `comments` an, aktiviert Realtime und fügt Beispieldaten ein.
3. `.env.example` nach `.env.local` kopieren und unter **Project Settings → API**
   die *Project URL* und den *anon/publishable key* eintragen.
4. Die `.env.local` an die anderen im Team weitergeben (nicht committen – sie ist in `.gitignore`).

### Datenmodell

| Tabelle    | Spalten                                                                                 |
| ---------- | --------------------------------------------------------------------------------------- |
| `ideas`    | id, title, category, status, priority, description, owner, tags[], votes, pros[], cons[], created_at |
| `comments` | id, idea_id → ideas.id (ON DELETE CASCADE), author, text, created_at                    |

Stimmen werden über die Funktion `vote_idea(idea_id, delta)` direkt in der Datenbank gezählt,
damit gleichzeitige Klicks sich nicht überschreiben. Welche Ideen man selbst schon gevotet hat,
merkt sich der Browser im `localStorage`.

> **Hinweis:** Es gibt keinen Login – jeder mit dem anon-Key darf lesen und schreiben.
> Für ein Schulprojekt passt das, für eine echte Anwendung bräuchte es Supabase Auth.

## Starten

Voraussetzung: Node.js 22.18+ oder 24.12+

```sh
npm install       # nach dem Pull einmal ausführen (neu: @supabase/supabase-js)
npm run dev       # Entwicklungsserver mit Hot-Reload
npm run build     # Produktions-Build nach dist/
npm run preview   # Build lokal ansehen
```
