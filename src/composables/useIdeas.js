import { reactive, ref, watch } from 'vue'
import { STORAGE_KEY } from '@/constants'

export function useIdeas() {
  // reactive: die veränderbare Sammlung unserer Fachdaten
  const ideas = reactive([])
  const isLoading = ref(true)
  const errorMessage = ref('')

  async function loadIdeas(ignoreSaved = false) {
    isLoading.value = true
    errorMessage.value = ''

    try {
      const response = await fetch('/data/ideas.json')
      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const fetchedIdeas = await response.json()
      const savedIdeas = ignoreSaved ? null : localStorage.getItem(STORAGE_KEY)
      ideas.splice(0, ideas.length, ...(savedIdeas ? JSON.parse(savedIdeas) : fetchedIdeas))

      if (ignoreSaved) localStorage.removeItem(STORAGE_KEY)
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
