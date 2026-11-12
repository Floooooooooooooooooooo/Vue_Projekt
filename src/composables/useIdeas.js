import { onMounted, onUnmounted, reactive, ref } from 'vue'
import { VOTES_KEY } from '@/constants'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'

// Felder, die im Detailformular bearbeitet und in die Datenbank geschrieben werden
const EDITABLE_FIELDS = ['title', 'category', 'status', 'priority', 'description', 'owner', 'tags', 'pros', 'cons']

// nach der letzten Eingabe so lange warten, bevor gespeichert wird
const SAVE_DELAY = 400

const IDEA_COLUMNS = '*, comments(id, author, text, created_at)'

// Datenbank-Zeilen (snake_case) in das Format der App umwandeln
function toComment({ id, author, text, created_at: createdAt }) {
  return { id, author, text, createdAt }
}

function toIdea(row) {
  const { comments = [], created_at: createdAt, ...idea } = row
  return {
    ...idea,
    createdAt,
    comments: comments.map(toComment).sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
  }
}

function readVotedIds() {
  try {
    const saved = JSON.parse(localStorage.getItem(VOTES_KEY))
    return Array.isArray(saved) ? saved : []
  } catch {
    return []
  }
}

export function useIdeas() {
  // reactive: die veränderbare Sammlung unserer Fachdaten
  const ideas = reactive([])
  const isLoading = ref(true)
  const errorMessage = ref('')
  const saveError = ref('')
  // IDs der Ideen, für die in diesem Browser schon abgestimmt wurde
  const votedIds = ref(readVotedIds())

  // noch nicht gespeicherte Änderungen pro Idee: id -> { timer, changes }
  const pendingSaves = new Map()

  function findIdea(id) {
    return ideas.find((idea) => idea.id === id)
  }

  function reportSaveError(action, error) {
    saveError.value = `${action} fehlgeschlagen: ${error.message}`
  }

  async function loadIdeas() {
    isLoading.value = true
    errorMessage.value = ''

    if (!isSupabaseConfigured) {
      errorMessage.value = 'Die Datenbank ist nicht eingerichtet – lege eine .env.local an (siehe README).'
      isLoading.value = false
      return
    }

    const { data, error } = await supabase
      .from('ideas')
      .select(IDEA_COLUMNS)
      .order('created_at', { ascending: false })

    if (error) {
      errorMessage.value = `Die Daten konnten nicht geladen werden (${error.message}).`
    } else {
      ideas.splice(0, ideas.length, ...data.map(toIdea))
    }
    isLoading.value = false
  }

  async function addIdea(title) {
    const { data, error } = await supabase.from('ideas').insert({ title }).select(IDEA_COLUMNS).single()
    if (error) {
      reportSaveError('Anlegen', error)
      return null
    }

    if (!findIdea(data.id)) ideas.unshift(toIdea(data))
    return data.id
  }

  function updateIdea(updatedIdea) {
    const idea = findIdea(updatedIdea.id)
    if (!idea) return

    const changes = {}
    for (const field of EDITABLE_FIELDS) {
      if (field in updatedIdea && updatedIdea[field] !== idea[field]) changes[field] = updatedIdea[field]
    }
    if (Object.keys(changes).length === 0) return

    // sofort anzeigen, verzögert speichern
    Object.assign(idea, changes)
    scheduleSave(idea.id, changes)
  }

  // beim Tippen nicht jeden Buchstaben einzeln an die Datenbank schicken
  function scheduleSave(id, changes) {
    const pending = pendingSaves.get(id) ?? { changes: {} }
    clearTimeout(pending.timer)
    pending.changes = { ...pending.changes, ...changes }
    pending.timer = setTimeout(() => saveChanges(id), SAVE_DELAY)
    pendingSaves.set(id, pending)
  }

  async function saveChanges(id) {
    const pending = pendingSaves.get(id)
    if (!pending) return

    clearTimeout(pending.timer)
    pendingSaves.delete(id)

    const { error } = await supabase.from('ideas').update(pending.changes).eq('id', id)
    if (error) reportSaveError('Speichern', error)
  }

  async function removeIdea(id) {
    if (!findIdea(id)) return false

    const { error } = await supabase.from('ideas').delete().eq('id', id)
    if (error) {
      reportSaveError('Löschen', error)
      return false
    }

    clearTimeout(pendingSaves.get(id)?.timer)
    pendingSaves.delete(id)
    const index = ideas.findIndex((idea) => idea.id === id)
    if (index !== -1) ideas.splice(index, 1)
    return true
  }

  // eine Stimme pro Idee und Browser: erneutes Klicken nimmt die Stimme zurück
  async function toggleVote(id) {
    const idea = findIdea(id)
    if (!idea) return

    const hasVoted = votedIds.value.includes(id)
    const delta = hasVoted ? -1 : 1
    const previousVotedIds = votedIds.value

    idea.votes = Math.max(0, idea.votes + delta)
    votedIds.value = hasVoted
      ? votedIds.value.filter((votedId) => votedId !== id)
      : [...votedIds.value, id]
    localStorage.setItem(VOTES_KEY, JSON.stringify(votedIds.value))

    const { data, error } = await supabase.rpc('vote_idea', { idea_id: id, delta })
    if (error) {
      idea.votes = Math.max(0, idea.votes - delta)
      votedIds.value = previousVotedIds
      localStorage.setItem(VOTES_KEY, JSON.stringify(votedIds.value))
      reportSaveError('Abstimmen', error)
      return
    }

    // Wert aus der Datenbank übernehmen (enthält auch Stimmen anderer)
    if (typeof data === 'number') idea.votes = data
  }

  function insertComment(row) {
    const idea = findIdea(row.idea_id)
    if (idea && !idea.comments.some((comment) => comment.id === row.id)) {
      idea.comments.push(toComment(row))
    }
  }

  function deleteCommentLocally(commentId) {
    for (const idea of ideas) {
      const index = idea.comments.findIndex((comment) => comment.id === commentId)
      if (index !== -1) idea.comments.splice(index, 1)
    }
  }

  async function addComment(ideaId, { author, text }) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ idea_id: ideaId, author, text })
      .select()
      .single()

    if (error) reportSaveError('Kommentieren', error)
    else insertComment(data)
  }

  async function removeComment(ideaId, commentId) {
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    if (error) reportSaveError('Kommentar löschen', error)
    else deleteCommentLocally(commentId)
  }

  // ---------------------------------------------------------------
  // Realtime: Änderungen aus anderen Browsern (z. B. von Florian) live übernehmen
  // ---------------------------------------------------------------

  let channel = null

  function handleIdeaChange({ eventType, new: row, old }) {
    if (eventType === 'DELETE') {
      const index = ideas.findIndex((idea) => idea.id === old.id)
      if (index !== -1) ideas.splice(index, 1)
      return
    }

    const idea = findIdea(row.id)
    if (!idea) {
      ideas.unshift(toIdea(row))
      return
    }

    // eigene, noch nicht gespeicherte Eingaben nicht überschreiben
    if (pendingSaves.has(row.id)) return

    const { comments, ...fields } = toIdea(row)
    Object.assign(idea, fields)
  }

  function handleCommentChange({ eventType, new: row, old }) {
    if (eventType === 'INSERT') insertComment(row)
    if (eventType === 'DELETE') deleteCommentLocally(old.id)
  }

  function subscribe() {
    if (!isSupabaseConfigured || channel) return

    channel = supabase
      .channel('ideenwerkstatt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ideas' }, handleIdeaChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, handleCommentChange)
      .subscribe()
  }

  function unsubscribe() {
    if (!channel) return
    supabase.removeChannel(channel)
    channel = null
  }

  onMounted(subscribe)
  onUnmounted(unsubscribe)

  return {
    ideas,
    votedIds,
    isLoading,
    errorMessage,
    saveError,
    loadIdeas,
    addIdea,
    updateIdea,
    removeIdea,
    toggleVote,
    addComment,
    removeComment,
  }
}
