<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div v-if="alreadyLoggedIn" class="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded mb-6 text-center">
        <p class="mb-4">You are already logged in.</p>
        <button @click="logout" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Log out</button>
      </div>
      <div v-else>
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
              <label for="organizationName" class="block text-sm font-medium text-gray-700">Organization Name</label>
              <div class="mt-1">
                <input v-model="organizationName" id="organizationName" name="organizationName" type="text" 
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
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
                  minlength="8"
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                  placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm" />
              </div>
              <p class="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
            </div>
            <div class="flex items-center">
              <input id="terms" name="terms" type="checkbox" v-model="termsAccepted" required
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded">
              <label for="terms" class="ml-2 block text-sm text-gray-700">
                I agree to the <a href="#" class="text-blue-600 hover:text-blue-500">Terms of Service</a> and <a href="#" class="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </label>
            </div>
            <div>
              <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent 
                rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                :disabled="loading || !termsAccepted">
                <span v-if="loading">
                  <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
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
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import supabase from '../supabaseClient'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const alreadyLoggedIn = ref(false)
    
    // Form data
    const firstName = ref('')
    const lastName = ref('')
    const organizationName = ref('')
    const email = ref('')
    const password = ref('')
    const termsAccepted = ref(false)
    
    // State
    const loading = ref(false)
    const error = ref(null)
    
    onMounted(async () => {
      const { data } = await supabase.auth.getSession()
      if (data?.session) {
        alreadyLoggedIn.value = true
      }
    })

    const logout = async () => {
      await supabase.auth.signOut()
      alreadyLoggedIn.value = false
      router.push('/')
    }

    const register = async () => {
      // Reset error
      error.value = null
      
      // Validate form
      if (!termsAccepted.value) {
        error.value = "You must accept the terms and conditions"
        return
      }
      
      loading.value = true
      
      try {
        // Create user metadata
        const userData = {
          first_name: firstName.value,
          last_name: lastName.value,
          organization: organizationName.value || ''
        }
        
        // Register with Supabase
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.value,
          password: password.value,
          options: {
            data: userData
          }
        })
        
        if (authError) {
          throw new Error(authError.message)
        }
        
        // Store basic user profile in localStorage
        localStorage.setItem('userProfile', JSON.stringify({
          email: email.value,
          firstName: firstName.value,
          lastName: lastName.value,
          organization: organizationName.value || ''
        }))
        
        // Check if email confirmation is required
        const needsEmailConfirmation = !data.session
        
        if (needsEmailConfirmation) {
          // Go to email confirmation page with option to proceed
          router.push({
            path: '/email-confirmation',
            query: { email: email.value }
          })
        } else {
          // If auto-confirmed (dev environment), go directly to assessment
          router.push('/assessment')
        }
      } catch (err) {
        error.value = err.message || "Registration failed. Please try again."
        console.error("Registration error:", err)
      } finally {
        loading.value = false
      }
    }
    
    return {
      alreadyLoggedIn,
      firstName,
      lastName,
      organizationName,
      email,
      password,
      termsAccepted,
      loading,
      error,
      register,
      logout
    }
  }
}
</script>