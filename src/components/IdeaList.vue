<script setup>
defineProps({
  ideas: { type: Array, required: true },
  selectedId: { type: Number, default: null },
})

defineEmits(['select', 'remove'])

const today = new Date().toISOString().slice(0, 10)

function isOverdue(idea) {
  return Boolean(idea.dueDate) && idea.dueDate < today && idea.status !== 'Erledigt'
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString('de-AT', {
    day: '2-digit',
    month: '2-digit',
  })
}
</script>

<template>
  <div class="idea-list">
    <article
      v-for="idea in ideas"
      :key="idea.id"
      class="idea-card"
      :class="{ selected: idea.id === selectedId }"
      tabindex="0"
      @click="$emit('select', idea.id)"
      @keydown.enter="$emit('select', idea.id)"
    >
      <div class="idea-card__topline">
        <span class="category">{{ idea.category }}</span>
        <button
          class="icon-button"
          type="button"
          :aria-label="`${idea.title} löschen`"
          title="Idee löschen"
          @click.stop="$emit('remove', idea.id)"
        >
          ×
        </button>
      </div>
      <h3>{{ idea.title || 'Unbenannte Idee' }}</h3>
      <div class="idea-card__meta">
        <span class="status-dot" :data-status="idea.status"></span>
        {{ idea.status }} · {{ idea.progress }} %
        <span class="priority-badge" :data-priority="idea.priority">{{ idea.priority }}</span>
        <span v-if="idea.dueDate" class="due-date" :class="{ 'due-date--overdue': isOverdue(idea) }">
          {{ isOverdue(idea) ? 'überfällig seit' : 'bis' }} {{ formatDate(idea.dueDate) }}
        </span>
      </div>
    </article>

    <div v-if="ideas.length === 0" class="empty-list">
      <span>⌕</span>
      <p>Keine passenden Ideen gefunden.</p>
    </div>
  </div>
</template>
