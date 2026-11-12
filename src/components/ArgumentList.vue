<script setup>
import { ref } from 'vue'

const props = defineProps({
  title: { type: String, required: true },
  items: { type: Array, required: true },
  variant: { type: String, default: 'pro' },
})

const emit = defineEmits(['update'])

const draft = ref('')

function addItem() {
  const text = draft.value.trim()
  if (!text) return

  emit('update', [...props.items, text])
  draft.value = ''
}

function removeItem(index) {
  emit(
    'update',
    props.items.filter((_, i) => i !== index),
  )
}
</script>

<template>
  <div class="argument-list" :class="`argument-list--${variant}`">
    <h3>
      {{ title }} <span>{{ items.length }}</span>
    </h3>

    <ul>
      <li v-for="(item, index) in items" :key="`${index}-${item}`">
        <span>{{ item }}</span>
        <button
          class="icon-button"
          type="button"
          :aria-label="`${item} entfernen`"
          @click="removeItem(index)"
        >
          ×
        </button>
      </li>
      <li v-if="items.length === 0" class="argument-list__empty">Noch nichts eingetragen.</li>
    </ul>

    <form @submit.prevent="addItem">
      <input
        v-model="draft"
        type="text"
        :placeholder="variant === 'pro' ? 'Was spricht dafür?' : 'Was spricht dagegen?'"
        :aria-label="`${title}-Argument hinzufügen`"
      />
      <button type="submit" :disabled="!draft.trim()" aria-label="Hinzufügen">+</button>
    </form>
  </div>
</template>
