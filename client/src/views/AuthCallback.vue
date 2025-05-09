<template>
    <div class="min-h-screen flex flex-col items-center justify-center p-4">
      <div class="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 class="text-2xl font-semibold text-gray-700 mb-2">Processing Authentication</h2>
        <p class="text-gray-600">Please wait while we complete your authentication...</p>
      </div>
    </div>
  </template>
  
  <script>
  import supabase from '../supabaseClient'
  
export default {
  name: 'AuthCallback',
  async mounted() {
    try {
      // Get the URL hash and query parameters
      const hash = window.location.hash
      const query = new URLSearchParams(window.location.search)
      const type = query.get('type')
      
      console.log("Auth callback details:", { hash, query: query.toString(), type })

      if (hash && hash.includes('access_token')) {
        // Handle token in hash (login, signup)
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error processing auth callback:', error)
          this.$router.push('/login?error=auth_callback_failed')
        } else if (data?.session) {
          // Successfully authenticated
          console.log('Authentication successful')
          this.$router.push('/assessment')
        } else {
          // No valid session
          this.$router.push('/login?error=no_session')
        }
      } else if (type === 'recovery') {
        // Password reset flow
        this.$router.push('/reset-password')
      } else if (type === 'signup' || type === 'magiclink') {
        // Email confirmation was successful
        localStorage.setItem('emailConfirmed', 'true')
        this.$router.push('/login?message=email_confirmed')
      } else {
        // Fallback to login
        this.$router.push('/login')
      }
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      this.$router.push('/login?error=unexpected')
    }
  }
}
  </script>