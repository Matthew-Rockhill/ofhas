<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
    <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold mb-6 text-center">Log In</h2>
      
      <!-- Success message -->
      <div v-if="message" class="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
        {{ message }}
      </div>
      
      <form @submit.prevent="login" class="space-y-6">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <div class="mt-1">
            <input 
              v-model="email" 
              id="email" 
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="mt-1">
            <input 
              v-model="password" 
              id="password" 
              name="password" 
              type="password" 
              autocomplete="current-password" 
              required 
              class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input 
              id="remember-me" 
              name="remember-me" 
              type="checkbox" 
              v-model="rememberMe"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>
          
          <button 
            type="button" 
            @click="forgotPassword" 
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
            :disabled="resetLoading"
          >
            <span v-if="resetLoading">Processing...</span>
            <span v-else>Forgot password?</span>
          </button>
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
              Logging in...
            </span>
            <span v-else>Sign in</span>
          </button>
        </div>
      </form>
      
      <!-- Error message -->
      <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
            Sign up now
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import supabase from '../supabaseClient'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    
    // Form data
    const email = ref('')
    const password = ref('')
    const rememberMe = ref(false)
    
    // State
    const loading = ref(false)
    const resetLoading = ref(false)
    const error = ref(null)
    const message = ref(null)
    
    onMounted(() => {
      // Check URL parameters for messages or errors
      if (route.query.message) {
        const messages = {
          'email_confirmed': 'Your email has been confirmed. Please sign in.',
          'password_reset': 'Your password has been reset. Please sign in with your new password.',
          'logged_out': 'You have been logged out successfully.'
        }
        
        message.value = messages[route.query.message] || route.query.message
      }
      
      if (route.query.error) {
        const errors = {
          'auth_required': 'Please sign in to access this page.',
          'session_expired': 'Your session has expired. Please sign in again.'
        }
        
        error.value = errors[route.query.error] || route.query.error
      }
      
      // Pre-fill email if provided
      if (route.query.email) {
        email.value = route.query.email
      }
    })
    
    const login = async () => {
      error.value = null
      loading.value = true
      
      try {
        // Sign in with Supabase
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        })
        
        if (authError) {
          throw new Error(authError.message)
        }
        
        if (data?.session) {
          // Store basic user info for UI
          const userData = {
            email: email.value,
            id: data.user.id,
            firstName: data.user.user_metadata?.first_name || '',
            lastName: data.user.user_metadata?.last_name || ''
          }
          
          localStorage.setItem('userProfile', JSON.stringify(userData))
          
          // Clear the "proceed without verification" flag if it was set
          localStorage.removeItem('proceedWithoutVerification')
          
          // Redirect to intended destination or assessment
          const redirectPath = route.query.redirect || '/assessment'
          router.push(redirectPath)
        } else {
          throw new Error('Login failed. Please try again.')
        }
      } catch (err) {
        error.value = err.message || 'Login failed. Please try again.'
        console.error('Login error:', err)
      } finally {
        loading.value = false
      }
    }
    
    const forgotPassword = async () => {
      if (!email.value) {
        error.value = 'Please enter your email address to reset your password'
        return
      }
      
      resetLoading.value = true
      error.value = null
      
      try {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.value, {
          redirectTo: `${window.location.origin}/reset-password`
        })
        
        if (resetError) {
          throw new Error(resetError.message)
        }
        
        message.value = 'Password reset instructions have been sent to your email'
      } catch (err) {
        error.value = err.message || 'Failed to send reset instructions. Please try again.'
        console.error('Password reset error:', err)
      } finally {
        resetLoading.value = false
      }
    }
    
    return {
      email,
      password,
      rememberMe,
      loading,
      resetLoading,
      error,
      message,
      login,
      forgotPassword
    }
  }
}
</script>