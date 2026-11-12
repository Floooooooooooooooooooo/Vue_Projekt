<script setup>
import { ref } from 'vue'

defineProps({
  comments: { type: Array, required: true },
})

const emit = defineEmits(['add', 'remove'])

const author = ref('')
const text = ref('')

function addComment() {
  const body = text.value.trim()
  if (!body) return

  emit('add', { author: author.value.trim() || 'Anonym', text: body })
  text.value = ''
}

function formatTime(isoDate) {
  return new Date(isoDate).toLocaleString('de-AT', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <section class="comments">
    <h3>
      Kommentare <span>{{ comments.length }}</span>
    </h3>

    <ul v-if="comments.length" class="comment-list">
      <li v-for="comment in comments" :key="comment.id">
        <div class="comment-list__head">
          <strong>{{ comment.author }}</strong>
          <time :datetime="comment.createdAt">{{ formatTime(comment.createdAt) }}</time>
          <button
            class="icon-button"
            type="button"
            aria-label="Kommentar löschen"
            @click="emit('remove', comment.id)"
          >
            ×
          </button>
        </div>
        <p>{{ comment.text }}</p>
      </li>
    </ul>
    <p v-else class="comments__empty">Noch keine Kommentare – schreib den ersten Gedanken dazu.</p>

    <form class="comment-form" @submit.prevent="addComment">
      <input v-model="author" type="text" placeholder="Dein Name" aria-label="Name" />
      <textarea
        v-model="text"
        rows="2"
        placeholder="Kommentar schreiben … (Strg + Enter zum Senden)"
        aria-label="Kommentar"
        @keydown.ctrl.enter="addComment"
      ></textarea>
      <button type="submit" :disabled="!text.trim()">Kommentieren</button>
    </form>
  </section>
</template>
