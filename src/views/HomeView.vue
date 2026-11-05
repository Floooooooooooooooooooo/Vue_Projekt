<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IdeaDetail from '@/components/IdeaDetail.vue'
import IdeaList from '@/components/IdeaList.vue'
import { STATUSES, STORAGE_KEY } from '@/constants'

const route = useRoute()
const router = useRouter()

// reactive: die veränderbare Sammlung unserer Fachdaten
const ideas = reactive([])

// ref: einzelne UI-Zustände
const searchTerm = ref('')
const statusFilter = ref('Alle')
const newTitle = ref('')
const isLoading = ref(true)
const errorMessage = ref('')

const selectedId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

const selectedIdea = computed(() => ideas.find((idea) => idea.id === selectedId.value) ?? null)

const filteredIdeas = computed(() => {
  const needle = searchTerm.value.trim().toLocaleLowerCase('de')

  return ideas.filter((idea) => {
    const matchesStatus = statusFilter.value === 'Alle' || idea.status === statusFilter.value
    const haystack = `${idea.title} ${idea.category} ${idea.owner}`.toLocaleLowerCase('de')
    return matchesStatus && haystack.includes(needle)
  })
})

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

function selectIdea(id) {
  router.push({ name: 'idea-detail', params: { id } })
}

function addIdea() {
  const title = newTitle.value.trim()
  if (!title) return

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
  newTitle.value = ''
  selectIdea(nextId)
}

function updateIdea(updatedIdea) {
  const index = ideas.findIndex((idea) => idea.id === updatedIdea.id)
  if (index !== -1) Object.assign(ideas[index], updatedIdea)
}

function removeIdea(id) {
  const index = ideas.findIndex((idea) => idea.id === id)
  if (index === -1) return

  ideas.splice(index, 1)
  if (selectedId.value === id) router.push({ name: 'home' })
}

async function resetIdeas() {
  await loadIdeas(true)
  router.push({ name: 'home' })
}

watch(
  ideas,
  (currentIdeas) => {
    if (!isLoading.value) localStorage.setItem(STORAGE_KEY, JSON.stringify(currentIdeas))
  },
  { deep: true },
)

onMounted(() => loadIdeas())
</script>

<template>
  <main class="workspace">
    <section class="master-panel">
      <div class="panel-heading">
        <div>
          <p class="eyebrow">DEINE SAMMLUNG</p>
          <h1>Ideenwerkstatt</h1>
        </div>
        <span class="count-badge">{{ ideas.length }}</span>
      </div>

      <form class="add-form" @submit.prevent="addIdea">
        <input v-model="newTitle" type="text" placeholder="Neue Idee eingeben …" aria-label="Neue Idee" />
        <button type="submit" :disabled="!newTitle.trim()">Hinzufügen</button>
      </form>

      <div class="filters">
        <input v-model="searchTerm" type="search" placeholder="Ideen durchsuchen …" />
        <select v-model="statusFilter" aria-label="Nach Status filtern">
          <option>Alle</option>
          <option v-for="status in STATUSES" :key="status">{{ status }}</option>
        </select>
      </div>

      <p v-if="isLoading" class="notice">Ideen werden per Fetch geladen …</p>
      <div v-else-if="errorMessage" class="notice notice--error">
        {{ errorMessage }}
        <button type="button" @click="loadIdeas()">Noch einmal</button>
      </div>
      <IdeaList
        v-else
        :ideas="filteredIdeas"
        :selected-id="selectedId"
        @select="selectIdea"
        @remove="removeIdea"
      />

      <button class="reset-button" type="button" @click="resetIdeas">↻ Beispieldaten neu laden</button>
    </section>

    <IdeaDetail :idea="selectedIdea" @update="updateIdea" />
  </main>
</template>
