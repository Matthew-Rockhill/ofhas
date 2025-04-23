<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Get Started
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Register to take your financial health assessment
        </p>
      </div>
      
      <div class="bg-white p-8 rounded-lg shadow-md">
        <form @submit.prevent="register" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
              <div class="mt-1">
                <input v-model="firstName" id="firstName" name="firstName" type="text" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
            
            <div>
              <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
              <div class="mt-1">
                <input v-model="lastName" id="lastName" name="lastName" type="text" required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
            </div>
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
            <div class="mt-1">
              <input v-model="email" id="email" name="email" type="email" autocomplete="email" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input v-model="password" id="password" name="password" type="password" required
                class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
            </div>
          </div>
          
          <div>
            <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent 
              rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading">
              <span v-if="loading">Processing...</span>
              <span v-else>Continue to Assessment</span>
            </button>
          </div>
        </form>
        
        <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
      </div>
      
      <div class="text-center">
        <p class="text-sm text-gray-600">
          Already registered? <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../supabaseClient'

export default {
  name: 'Register',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      loading: false,
      error: null
    }
  },
  methods: {
    async register() {
      this.loading = true
      this.error = null
      
      try {
        // Basic Supabase registration
        const { data, error } = await supabase.auth.signUp({
          email: this.email,
          password: this.password,
          options: {
            data: {
              first_name: this.firstName,
              last_name: this.lastName
            }
          }
        })
        
        if (error) {
          this.error = error.message
          this.loading = false
          return
        }
        
        // If we have a session, user is logged in
        if (data?.session) {
          // Store user profile for development fallback
          localStorage.setItem('userProfile', JSON.stringify({
            firstName: this.firstName,
            lastName: this.lastName,
            email: this.email
          }))
          
          // Go to assessment
          this.$router.push('/assessment')
        } else {
          // If no session, inform user about confirmation
          this.error = "Please check your email to confirm your registration"
          setTimeout(() => {
            this.$router.push('/login')
          }, 3000)
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