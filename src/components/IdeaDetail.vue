<script setup>
import { RouterLink } from 'vue-router'
import ArgumentList from '@/components/ArgumentList.vue'
import { PRIORITIES, STATUSES } from '@/constants'

const props = defineProps({
  idea: { type: Object, default: null },
  missing: { type: Boolean, default: false },
})

const emit = defineEmits(['update'])

function updateField(field, value) {
  emit('update', { ...props.idea, [field]: value })
}

// "Schule, #nachhaltig ,schule" -> ['schule', 'nachhaltig']
function updateTags(input) {
  const tags = input
    .split(',')
    .map((tag) => tag.trim().replace(/^#/, '').toLocaleLowerCase('de'))
    .filter(Boolean)
  updateField('tags', [...new Set(tags)])
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
      <label class="field field--wide" :class="{ 'field--error': !idea.title.trim() }">
        <span>Titel</span>
        <input
          :value="idea.title"
          type="text"
          required
          :aria-invalid="!idea.title.trim()"
          @input="updateField('title', $event.target.value)"
        />
        <small v-if="!idea.title.trim()" class="field-hint">Bitte gib einen Titel ein.</small>
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
        <span>Eingebracht von</span>
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

      <label class="field field--wide">
        <span>Tags (mit Komma trennen)</span>
        <input
          :value="idea.tags.join(', ')"
          type="text"
          placeholder="z. B. nachhaltig, schule"
          @change="updateTags($event.target.value)"
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

    <div class="arguments">
      <ArgumentList
        :key="`pro-${idea.id}`"
        title="Pro"
        variant="pro"
        :items="idea.pros"
        @update="updateField('pros', $event)"
      />
      <ArgumentList
        :key="`contra-${idea.id}`"
        title="Contra"
        variant="contra"
        :items="idea.cons"
        @update="updateField('cons', $event)"
      />
    </div>
  </section>

  <section v-else-if="missing" class="detail-panel detail-panel--empty">
    <div class="empty-illustration">?</div>
    <h2>Idee nicht gefunden</h2>
    <p>Diese Idee existiert nicht (mehr). Vielleicht wurde sie gelöscht.</p>
    <RouterLink class="back-link" to="/">← Zur Übersicht</RouterLink>
  </section>

  <section v-else class="detail-panel detail-panel--empty">
    <div class="empty-illustration">✦</div>
    <h2>Wähle eine Idee aus</h2>
    <p>Die Details erscheinen hier und können direkt bearbeitet werden.</p>
  </section>
</template>
