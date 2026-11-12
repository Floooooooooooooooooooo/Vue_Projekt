import { reactive, ref, watch } from 'vue'
import { STORAGE_KEY, VOTES_KEY } from '@/constants'

// alte Status-Werte aus gespeicherten Daten auf die neuen abbilden
const LEGACY_STATUS = {
  Idee: 'Neu',
  Geplant: 'Favorit',
  'In Arbeit': 'In Diskussion',
  Erledigt: 'Favorit',
}

function createEmptyIdea(id, title) {
  return {
    id,
    title,
    category: 'Allgemein',
    status: 'Neu',
    priority: 'Mittel',
    description: '',
    owner: '',
    tags: [],
    votes: 0,
    pros: [],
    cons: [],
    comments: [],
  }
}

// fehlende Felder ergänzen, damit auch ältere gespeicherte Daten funktionieren
function normalizeIdea(raw) {
  const idea = { ...createEmptyIdea(raw.id, raw.title), ...raw }
  delete idea.dueDate
  delete idea.progress
  idea.status = LEGACY_STATUS[idea.status] ?? idea.status
  return idea
}

export function useIdeas() {
  // reactive: die veränderbare Sammlung unserer Fachdaten
  const ideas = reactive([])
  const isLoading = ref(true)
  const errorMessage = ref('')
  // IDs der Ideen, für die in diesem Browser schon abgestimmt wurde
  const votedIds = ref(readVotedIds())

  function readVotedIds() {
    try {
      const saved = JSON.parse(localStorage.getItem(VOTES_KEY))
      return Array.isArray(saved) ? saved : []
    } catch {
      return []
    }
  }

  function readSavedIdeas() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
      return Array.isArray(saved) ? saved : null
    } catch {
      // kaputte Daten im Speicher ignorieren und neu laden
      localStorage.removeItem(STORAGE_KEY)
      return null
    }
  }

  async function loadIdeas(ignoreSaved = false) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      if (ignoreSaved) {
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(VOTES_KEY)
        votedIds.value = []
      }

      let loadedIdeas = ignoreSaved ? null : readSavedIdeas()

      if (!loadedIdeas) {
        // BASE_URL beachten, damit die App auch in einem Unterordner läuft (z. B. GitHub Pages)
        const response = await fetch(`${import.meta.env.BASE_URL}data/ideas.json`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        loadedIdeas = await response.json()
      }

      ideas.splice(0, ideas.length, ...loadedIdeas.map(normalizeIdea))
    } catch (error) {
      errorMessage.value = `Die Daten konnten nicht geladen werden (${error.message}).`
    } finally {
      isLoading.value = false
    }
  }

  function addIdea(title) {
    const nextId = Math.max(0, ...ideas.map((idea) => idea.id)) + 1
    ideas.unshift(createEmptyIdea(nextId, title))
    return nextId
  }

  function updateIdea(updatedIdea) {
    const index = ideas.findIndex((idea) => idea.id === updatedIdea.id)
    if (index !== -1) Object.assign(ideas[index], updatedIdea)
  }

  function removeIdea(id) {
    const index = ideas.findIndex((idea) => idea.id === id)
    if (index === -1) return false

    ideas.splice(index, 1)
    return true
  }

  // eine Stimme pro Idee: erneutes Klicken nimmt die Stimme zurück
  function toggleVote(id) {
    const idea = ideas.find((item) => item.id === id)
    if (!idea) return

    const hasVoted = votedIds.value.includes(id)
    idea.votes = Math.max(0, idea.votes + (hasVoted ? -1 : 1))
    votedIds.value = hasVoted
      ? votedIds.value.filter((votedId) => votedId !== id)
      : [...votedIds.value, id]
    localStorage.setItem(VOTES_KEY, JSON.stringify(votedIds.value))
  }

  watch(
    ideas,
    (currentIdeas) => {
      if (!isLoading.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(currentIdeas))
    },
    { deep: true },
  )

  return {
    ideas,
    votedIds,
    isLoading,
    errorMessage,
    loadIdeas,
    addIdea,
    updateIdea,
    removeIdea,
    toggleVote,
  }
}
