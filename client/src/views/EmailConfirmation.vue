<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <div class="mb-6">
        <div class="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      </div>
      
      <h2 class="text-2xl font-bold mb-4 text-gray-900">Check Your Email</h2>
      
      <p class="text-gray-700 mb-6">
        We've sent a confirmation email to <strong>{{ email }}</strong>. Please check your inbox and click the verification link to activate your account.
      </p>
      
      <div class="border-t border-gray-200 pt-6 mt-6">
        <h3 class="text-lg font-medium mb-4 text-gray-900">Didn't receive the email?</h3>
        
        <p class="text-gray-700 mb-4">
          Please check your spam folder. If you still don't see it, you can request a new confirmation email.
        </p>
        
        <button 
          @click="resendConfirmation" 
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 mb-4"
          :disabled="resending"
        >
          <span v-if="resending">Sending...</span>
          <span v-else>Resend Confirmation Email</span>
        </button>
        
        <div v-if="resendSuccess" class="text-green-600 mb-4">
          {{ resendSuccess }}
        </div>
        
        <div v-if="resendError" class="text-red-600 mb-4">
          {{ resendError }}
        </div>
        
        <p class="text-sm text-gray-600">
          Already confirmed? <router-link to="/login" class="text-blue-600 hover:text-blue-500">Sign in here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../supabaseClient'

export default {
  name: 'EmailConfirmation',
  data() {
    return {
      email: '',
      resending: false,
      resendSuccess: null,
      resendError: null
    }
  },
  created() {
    // Try to get email from router query or localStorage
    this.email = this.$route.query.email || ''
    
    if (!this.email) {
      const userProfile = localStorage.getItem('userProfile')
      if (userProfile) {
        try {
          const profile = JSON.parse(userProfile)
          this.email = profile.email || ''
        } catch (e) {
          console.error('Error parsing user profile:', e)
        }
      }
    }
    
    // Save email to localStorage for future use
    if (this.email) {
      localStorage.setItem('pendingConfirmationEmail', this.email)
    } else {
      const pendingEmail = localStorage.getItem('pendingConfirmationEmail')
      if (pendingEmail) {
        this.email = pendingEmail
      }
    }
  },
  methods: {
    async resendConfirmation() {
      this.resending = true
      this.resendSuccess = null
      this.resendError = null
      
      try {
        // For development - mock resend if Supabase isn't configured
        if (!supabaseUrl || !supabaseAnonKey) {
          // Simulate a successful resend
          setTimeout(() => {
            this.resendSuccess = "Confirmation email has been resent. Please check your inbox."
            this.resending = false
          }, 1000)
          return
        }
        
        // In production with Supabase
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: this.email
        })
        
        if (error) {
          this.resendError = error.message
        } else {
          this.resendSuccess = "Confirmation email has been resent. Please check your inbox."
        }
      } catch (e) {
        this.resendError = "An unexpected error occurred. Please try again."
        console.error(e)
      } finally {
        this.resending = false
      }
    }
  }
}
</script>