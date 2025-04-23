<template>
    <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50">
      <div class="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 class="text-2xl font-bold mb-6 text-center">Log In</h2>
        
        <div v-if="message" class="mb-6 p-3 bg-green-100 text-green-700 rounded-md">
          {{ message }}
        </div>
        
        <form @submit.prevent="login">
          <div class="mb-4">
            <label class="block mb-1">Email</label>
            <input v-model="email" type="email" class="w-full border rounded px-3 py-2" required />
          </div>
          <div class="mb-6">
            <label class="block mb-1">Password</label>
            <input v-model="password" type="password" class="w-full border rounded px-3 py-2" required />
          </div>
          <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            :disabled="loading">
            <span v-if="loading">Logging in...</span>
            <span v-else>Log In</span>
          </button>
        </form>
        
        <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <div class="mt-4 text-center">
          <p class="text-sm text-gray-600 mb-2">
            Don't have an account? <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
              Register here
            </router-link>
          </p>
          <button 
            @click="forgotPassword" 
            class="text-sm font-medium text-blue-600 hover:text-blue-500"
            :disabled="resetLoading"
          >
            <span v-if="resetLoading">Processing...</span>
            <span v-else>Forgot your password?</span>
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import supabase from '../supabaseClient'
  
  export default {
    name: 'Login',
    data() {
      return {
        email: '',
        password: '',
        loading: false,
        error: null,
        message: null,
        resetLoading: false
      }
    },
    created() {
      // Check if redirected with a message
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.has('message')) {
        this.message = urlParams.get('message')
      }
    },
    methods: {
      async login() {
        this.loading = true
        this.error = null
        
        try {
          // Simple Supabase login
          const { data, error } = await supabase.auth.signInWithPassword({
            email: this.email,
            password: this.password
          })
          
          if (error) {
            this.error = error.message
          } else if (data?.session) {
            // For development fallback
            localStorage.setItem('userProfile', JSON.stringify({
              email: this.email
            }))
            
            // Go to assessment
            this.$router.push('/assessment')
          } else {
            this.error = "Login failed. Please try again."
          }
        } catch (e) {
          this.error = "An unexpected error occurred. Please try again."
          console.error(e)
        } finally {
          this.loading = false
        }
      },
      
      async forgotPassword() {
        if (!this.email) {
          this.error = "Please enter your email address first"
          return
        }
        
        this.resetLoading = true
        this.error = null
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(this.email)
          
          if (error) {
            this.error = error.message
          } else {
            this.message = "Password reset instructions sent to your email"
          }
        } catch (e) {
          this.error = "Failed to send reset instructions. Please try again."
          console.error(e)
        } finally {
          this.resetLoading = false
        }
      }
    }
  }
  </script>