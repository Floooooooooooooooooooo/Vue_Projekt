import { reactive, ref, watch } from 'vue'
import { STORAGE_KEY } from '@/constants'

export function useIdeas() {
  // reactive: die veränderbare Sammlung unserer Fachdaten
  const ideas = reactive([])
  const isLoading = ref(true)
  const errorMessage = ref('')

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
      if (ignoreSaved) localStorage.removeItem(STORAGE_KEY)

      let loadedIdeas = ignoreSaved ? null : readSavedIdeas()

      if (!loadedIdeas) {
        // BASE_URL beachten, damit die App auch in einem Unterordner läuft (z. B. GitHub Pages)
        const response = await fetch(`${import.meta.env.BASE_URL}data/ideas.json`)
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        loadedIdeas = await response.json()
      }

      ideas.splice(0, ideas.length, ...loadedIdeas)
    } catch (error) {
      errorMessage.value = `Die Daten konnten nicht geladen werden (${error.message}).`
    } finally {
      isLoading.value = false
    }
  }

  function addIdea(title) {
    const nextId = Math.max(0, ...ideas.map((idea) => idea.id)) + 1
    ideas.unshift({
      id: nextId,
      title,
      category: 'Allgemein',
      status: 'Idee',
      priority: 'Mittel',
      description: '',
      owner: '',
      dueDate: '',
      progress: 0,
    })
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

  watch(
    ideas,
    (currentIdeas) => {
      if (!isLoading.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(currentIdeas))
    },
    { deep: true },
  )

  return { ideas, isLoading, errorMessage, loadIdeas, addIdea, updateIdea, removeIdea }
}
