<template>
    <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Create New Password</h2>
        
        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <form v-if="!success" @submit.prevent="resetPassword">
          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700">New Password</label>
            <div class="mt-1">
              <input v-model="password" id="password" name="password" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                minlength="8" />
            </div>
            <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
          </div>
          
          <div class="mb-6">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div class="mt-1">
              <input v-model="confirmPassword" id="confirmPassword" name="confirmPassword" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
          
          <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent 
            rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            :disabled="loading">
            <span v-if="loading">Processing...</span>
            <span v-else>Reset Password</span>
          </button>
        </form>
        
        <div v-if="success" class="text-center">
          <div class="bg-green-100 text-green-700 p-4 rounded-md mb-6">
            Your password has been successfully reset!
          </div>
          <router-link to="/login" class="w-full flex justify-center py-2 px-4 border border-transparent 
            rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
            Return to Login
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import supabase from '../supabaseClient'
  
  export default {
    name: 'ResetPassword',
    data() {
      return {
        password: '',
        confirmPassword: '',
        loading: false,
        error: null,
        success: false
      }
    },
    methods: {
      async resetPassword() {
        this.loading = true
        this.error = null
        
        // Validate passwords match
        if (this.password !== this.confirmPassword) {
          this.error = "Passwords do not match"
          this.loading = false
          return
        }
        
        // Validate password strength
        if (this.password.length < 8) {
          this.error = "Password must be at least 8 characters"
          this.loading = false
          return
        }
        
        try {
          // For development - mock password reset if Supabase isn't configured
          if (!supabaseUrl || !supabaseAnonKey) {
            // Simulate a successful password reset
            setTimeout(() => {
              this.success = true
              this.loading = false
            }, 1000)
            return
          }
          
          // In production with Supabase
          const { error } = await supabase.auth.updateUser({
            password: this.password
          })
          
          if (error) {
            this.error = error.message
          } else {
            this.success = true
          }
        } catch (e) {
          this.error = "An unexpected error occurred. Please try again."
          console.error(e)
        } finally {
          this.loading = false
        }
      }
    }
  }
  </script>