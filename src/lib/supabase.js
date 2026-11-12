import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

// null, solange keine .env.local angelegt wurde – useIdeas zeigt dann einen Hinweis
export const supabase = isSupabaseConfigured ? createClient(url, key) : null
