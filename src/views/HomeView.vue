<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import IdeaDetail from '@/components/IdeaDetail.vue'
import IdeaList from '@/components/IdeaList.vue'
import { useIdeas } from '@/composables/useIdeas'
import { STATUSES } from '@/constants'

const route = useRoute()
const router = useRouter()

const { ideas, isLoading, errorMessage, loadIdeas, addIdea: createIdea, updateIdea, removeIdea: deleteIdea } =
  useIdeas()

// ref: einzelne UI-Zustände
const searchTerm = ref('')
const statusFilter = ref('Alle')
const newTitle = ref('')

const selectedId = computed(() => {
  const id = Number(route.params.id)
  return Number.isFinite(id) ? id : null
})

const selectedIdea = computed(() => ideas.find((idea) => idea.id === selectedId.value) ?? null)

// ID in der URL, zu der es (nach dem Laden) keine Idee gibt
const isMissingIdea = computed(
  () => !isLoading.value && selectedId.value !== null && selectedIdea.value === null,
)

const filteredIdeas = computed(() => {
  const needle = searchTerm.value.trim().toLocaleLowerCase('de')

  return ideas.filter((idea) => {
    const matchesStatus = statusFilter.value === 'Alle' || idea.status === statusFilter.value
    const haystack = `${idea.title} ${idea.category} ${idea.owner}`.toLocaleLowerCase('de')
    return matchesStatus && haystack.includes(needle)
  })
})

function selectIdea(id) {
  router.push({ name: 'idea-detail', params: { id } })
}

function addIdea() {
  const title = newTitle.value.trim()
  if (!title) return

  const id = createIdea(title)
  newTitle.value = ''
  selectIdea(id)
}

function removeIdea(id) {
  if (deleteIdea(id) && selectedId.value === id) router.push({ name: 'home' })
}

async function resetIdeas() {
  await loadIdeas(true)
  router.push({ name: 'home' })
}

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

    <IdeaDetail :idea="selectedIdea" :missing="isMissingIdea" @update="updateIdea" />
  </main>
</template>
