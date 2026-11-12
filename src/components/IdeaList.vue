<script setup>
defineProps({
  ideas: { type: Array, required: true },
  selectedId: { type: Number, default: null },
})

defineEmits(['select', 'remove'])
</script>

<template>
  <div class="idea-list">
    <article
      v-for="idea in ideas"
      :key="idea.id"
      class="idea-card"
      :class="{ selected: idea.id === selectedId }"
      role="button"
      tabindex="0"
      :aria-pressed="idea.id === selectedId"
      @click="$emit('select', idea.id)"
      @keydown.enter="$emit('select', idea.id)"
      @keydown.space.prevent="$emit('select', idea.id)"
      @keydown.delete.self="$emit('remove', idea.id)"
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
        {{ idea.status }}
        <span class="priority-badge" :data-priority="idea.priority">{{ idea.priority }}</span>
      </div>
    </article>

    <div v-if="ideas.length === 0" class="empty-list">
      <span>⌕</span>
      <p>Keine passenden Ideen gefunden.</p>
    </div>
  </div>
</template>
