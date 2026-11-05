<script setup>
import { PRIORITIES, STATUSES } from '@/constants'

const props = defineProps({
  idea: { type: Object, default: null },
})

const emit = defineEmits(['update'])

function updateField(field, value) {
  emit('update', { ...props.idea, [field]: value })
}
</script>

<template>
  <section v-if="idea" class="detail-panel">
    <div class="detail-heading">
      <div>
        <p class="eyebrow">DETAILANSICHT</p>
        <h2>{{ idea.title || 'Unbenannte Idee' }}</h2>
      </div>
      <span class="save-indicator">✓ automatisch gespeichert</span>
    </div>

    <div class="form-grid">
      <label class="field field--wide">
        <span>Titel</span>
        <input
          :value="idea.title"
          type="text"
          @input="updateField('title', $event.target.value)"
        />
      </label>

      <label class="field">
        <span>Kategorie</span>
        <input
          :value="idea.category"
          type="text"
          @input="updateField('category', $event.target.value)"
        />
      </label>

      <label class="field">
        <span>Verantwortlich</span>
        <input
          :value="idea.owner"
          type="text"
          @input="updateField('owner', $event.target.value)"
        />
      </label>

      <label class="field">
        <span>Status</span>
        <select :value="idea.status" @change="updateField('status', $event.target.value)">
          <option v-for="status in STATUSES" :key="status">{{ status }}</option>
        </select>
      </label>

      <label class="field">
        <span>Priorität</span>
        <select
          :value="idea.priority"
          @change="updateField('priority', $event.target.value)"
        >
          <option v-for="priority in PRIORITIES" :key="priority">{{ priority }}</option>
        </select>
      </label>

      <label class="field">
        <span>Fällig am</span>
        <input
          :value="idea.dueDate"
          type="date"
          @input="updateField('dueDate', $event.target.value)"
        />
      </label>

      <label class="field">
        <span>Fortschritt: {{ idea.progress }} %</span>
        <input
          :value="idea.progress"
          class="range"
          type="range"
          min="0"
          max="100"
          step="5"
          @input="updateField('progress', Number($event.target.value))"
        />
      </label>

      <label class="field field--wide">
        <span>Beschreibung</span>
        <textarea
          :value="idea.description"
          rows="6"
          @input="updateField('description', $event.target.value)"
        ></textarea>
      </label>
    </div>
  </section>

  <section v-else class="detail-panel detail-panel--empty">
    <div class="empty-illustration">✦</div>
    <h2>Wähle eine Idee aus</h2>
    <p>Die Details erscheinen hier und können direkt bearbeitet werden.</p>
  </section>
</template>
