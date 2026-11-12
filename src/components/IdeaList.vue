<script setup>
defineProps({
  ideas: { type: Array, required: true },
  selectedId: { type: Number, default: null },
  votedIds: { type: Array, default: () => [] },
})

defineEmits(['select', 'remove', 'tag', 'vote'])
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
      <div v-if="idea.tags.length" class="tag-list">
        <button
          v-for="tag in idea.tags"
          :key="tag"
          class="tag"
          type="button"
          :title="`Nach #${tag} filtern`"
          @click.stop="$emit('tag', tag)"
          @keydown.enter.stop
          @keydown.space.stop
        >
          #{{ tag }}
        </button>
      </div>
      <div class="idea-card__meta">
        <span class="status-dot" :data-status="idea.status"></span>
        {{ idea.status }}
        <span class="priority-badge" :data-priority="idea.priority">{{ idea.priority }}</span>
        <button
          class="vote-button"
          :class="{ voted: votedIds.includes(idea.id) }"
          type="button"
          :aria-pressed="votedIds.includes(idea.id)"
          :aria-label="`Für ${idea.title} stimmen`"
          @click.stop="$emit('vote', idea.id)"
          @keydown.enter.stop
          @keydown.space.stop
        >
          ▲ {{ idea.votes }}
        </button>
      </div>
    </article>

    <div v-if="ideas.length === 0" class="empty-list">
      <span>⌕</span>
      <p>Keine passenden Ideen gefunden.</p>
    </div>
  </div>
</template>
