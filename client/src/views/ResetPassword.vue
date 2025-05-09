<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">{{ isSetup ? 'Create Password' : 'Reset Password' }}</h2>
      
      <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
      
      <div v-if="success" class="mb-6 p-3 bg-green-100 text-green-700 rounded-md text-center">
        <p class="mb-4">{{ successMessage }}</p>
        <router-link to="/login" class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Go to Login
        </router-link>
      </div>
      
      <form v-if="!success" @submit.prevent="resetPassword" class="space-y-6">
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
          <div class="mt-1">
            <input 
              v-model="password" 
              id="password" 
              name="password" 
              type="password" 
              autocomplete="new-password" 
              required
              minlength="8"
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
          <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
          <div class="mt-1">
            <input 
              v-model="confirmPassword" 
              id="confirmPassword" 
              name="confirmPassword" 
              type="password" 
              autocomplete="new-password" 
              required
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <button 
            type="submit" 
            class="w-full flex justify-center py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading"
          >
            <span v-if="loading" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
            <span v-else>{{ isSetup ? 'Set Password' : 'Reset Password' }}</span>
          </button>
        </div>
      </form>
      
      <div v-if="!success" class="mt-4 text-center">
        <p class="text-sm text-gray-600">
          Remember your password? 
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import supabase from '../supabaseClient'

export default {
  name: 'ResetPassword',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // Form data
    const password = ref('')
    const confirmPassword = ref('')
    
    // State
    const loading = ref(false)
    const error = ref(null)
    const success = ref(false)
    const successMessage = ref('Your password has been successfully reset!')
    
    // Check if this is an account setup (for invited users) or a password reset
    const isSetup = computed(() => {
      return route.query.mode === 'setup' || localStorage.getItem('resetMode') === 'setup'
    })
    
    // Get hash parameters from URL 
    const getHashParams = () => {
      const hash = window.location.hash.substring(1)
      const result = {}
      
      if (hash) {
        const params = new URLSearchParams(hash)
        params.forEach((value, key) => {
          result[key] = value
        })
      }
      
      return result
    }
    
    // Get access token from URL hash or query params
    const getAccessToken = () => {
      // First check the hash (typical for SPA redirects)
      const hashParams = getHashParams()
      if (hashParams.access_token) {
        return hashParams.access_token
      }
      
      // Then check query params (used in some configurations)
      if (route.query.access_token) {
        return route.query.access_token
      }
      
      return null
    }
    
    onMounted(() => {
      // Update message if this is account setup
      if (isSetup.value) {
        successMessage.value = 'Your password has been successfully set!'
      }
      
      // Check if we have a token in the URL
      const accessToken = getAccessToken()
      
      if (accessToken) {
        // Store token temporarily to use for password update
        localStorage.setItem('resetPasswordToken', accessToken)
        console.log('Reset token stored from URL')
      }
      
      // Log the token situation for debugging
      console.log('Reset password page loaded, token in localStorage:', 
                 localStorage.getItem('resetPasswordToken') ? 'Yes (exists)' : 'No (missing)')
    })
    
    const resetPassword = async () => {
      // Reset error
      error.value = null
      
      // Validate passwords match
      if (password.value !== confirmPassword.value) {
        error.value = 'Passwords do not match'
        return
      }
      
      // Validate password strength
      if (password.value.length < 8) {
        error.value = 'Password must be at least 8 characters'
        return
      }
      
      loading.value = true
      
      try {
        // Try to get the current session
        const { data: sessionData } = await supabase.auth.getSession()
        
        // Get the token from localStorage
        const token = localStorage.getItem('resetPasswordToken')
        
        console.log('Resetting password with:', {
          activeSession: !!sessionData?.session,
          hasToken: !!token
        })
        
        // If there's a session, use it to update the password
        if (sessionData?.session) {
          console.log('Using active session to update password')
          
          const { error: updateError } = await supabase.auth.updateUser({
            password: password.value
          })
          
          if (updateError) {
            throw new Error(updateError.message)
          }
        } 
        // If we have a token but no session, set the session first
        else if (token) {
          console.log('Setting session with token before updating password')
          
          // Set the auth session with the token
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: token,
            refresh_token: ''
          })
          
          if (sessionError) {
            throw new Error(`Error setting session: ${sessionError.message}`)
          }
          
          // Now update the password
          const { error: updateError } = await supabase.auth.updateUser({
            password: password.value
          })
          
          if (updateError) {
            throw new Error(`Error updating password: ${updateError.message}`)
          }
        } else {
          throw new Error('No authentication token or active session found. Please try the reset link again.')
        }
        
        // Clear the temporary token and mode
        localStorage.removeItem('resetPasswordToken')
        localStorage.removeItem('resetMode')
        
        // Show success state
        success.value = true
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push({
            path: '/login',
            query: { message: 'password_reset' }
          })
        }, 3000)
      } catch (err) {
        console.error('Password reset error:', err)
        error.value = err.message || 'Failed to reset password. Please try again.'
      } finally {
        loading.value = false
      }
    }
    
    return {
      password,
      confirmPassword,
      loading,
      error,
      success,
      successMessage,
      isSetup,
      resetPassword
    }
  }
}
</script>