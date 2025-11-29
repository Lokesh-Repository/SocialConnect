import { createClient } from './supabase-server'

export async function getSession() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Session error:', error)
    return null
  }
}

export async function getUser() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('User error:', error)
    return null
  }
}
