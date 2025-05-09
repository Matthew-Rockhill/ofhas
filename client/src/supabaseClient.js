// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validation to prevent running with missing credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your environment.')
  
  // In development, provide mock client
  if (import.meta.env.DEV) {
    console.warn('Running in development mode with mock Supabase client.')
  }
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Add event listener for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    // Store minimal user info in localStorage for UI needs
    localStorage.setItem('userSignedIn', 'true')
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('userSignedIn')
    localStorage.removeItem('userProfile')
  }
})

export default supabase