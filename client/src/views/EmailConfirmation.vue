<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
      <!-- Email sent confirmation -->
      <div v-if="!emailVerified">
        <div class="mb-6">
          <div class="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>
        
        <h2 class="text-2xl font-bold mb-4 text-gray-900">Verify Your Email</h2>
        
        <p class="text-gray-700 mb-6">
          We've sent a confirmation email to <strong>{{ email }}</strong>
        </p>

        <!-- Progress/Status -->
        <div class="mb-6">
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div>
                <span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                  Step 2 of 3
                </span>
              </div>
              <div class="text-right">
                <span class="text-xs font-semibold inline-block text-blue-600">
                  Verification Required
                </span>
              </div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div style="width: 66%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600"></div>
            </div>
          </div>
        </div>

        <!-- Options section -->
        <div class="border-t border-gray-200 pt-6 mt-6">
          <h3 class="text-lg font-medium mb-4 text-gray-900">Next Steps</h3>
          
          <div class="space-y-4">
            <!-- Skip option -->
            <div class="bg-blue-50 p-4 rounded-lg text-left">
              <h4 class="font-medium text-blue-800 mb-1">Want to start immediately?</h4>
              <p class="text-sm text-blue-700 mb-2">
                You can begin the assessment right away and verify your email later.
              </p>
              <button 
                @click="proceedToAssessment" 
                class="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700"
              >
                Continue to Assessment
              </button>
            </div>
            
            <!-- Resend email option -->
            <div class="bg-gray-50 p-4 rounded-lg text-left">
              <h4 class="font-medium text-gray-800 mb-1">Didn't receive the email?</h4>
              <p class="text-sm text-gray-600 mb-2">
                Check your spam folder or request a new confirmation email.
              </p>
              <button 
                @click="resendConfirmation" 
                class="border border-gray-300 bg-white text-gray-700 text-sm px-3 py-1.5 rounded hover:bg-gray-50"
                :disabled="resending"
              >
                <span v-if="resending">Sending...</span>
                <span v-else>Resend Email</span>
              </button>
            </div>
            
            <!-- Wrong email option -->
            <div class="bg-gray-50 p-4 rounded-lg text-left">
              <h4 class="font-medium text-gray-800 mb-1">Wrong email address?</h4>
              <p class="text-sm text-gray-600 mb-2">
                You can go back and correct your email.
              </p>
              <router-link 
                to="/register" 
                class="border border-gray-300 bg-white text-gray-700 text-sm px-3 py-1.5 rounded hover:bg-gray-50 inline-block"
              >
                Back to Register
              </router-link>
            </div>
          </div>
        </div>
        
        <!-- Status messages -->
        <div v-if="resendSuccess" class="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
          {{ resendSuccess }}
        </div>
        
        <div v-if="resendError" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ resendError }}
        </div>
      </div>
      
      <!-- Email verified success state -->
      <div v-else>
        <div class="mb-6">
          <div class="bg-green-100 text-green-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="w-8 h-8">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 class="text-2xl font-bold mb-4 text-gray-900">Email Verified!</h2>
        
        <p class="text-gray-700 mb-6">
          Your email has been successfully verified. You're now ready to continue with the assessment.
        </p>
        
        <router-link 
          to="/assessment" 
          class="w-full block bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Continue to Assessment
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import supabase from '../supabaseClient'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

export default {
  name: 'EmailConfirmation',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const email = ref('')
    const resending = ref(false)
    const resendSuccess = ref(null)
    const resendError = ref(null)
    const emailVerified = ref(false)
    
    onMounted(() => {
      // Get email from route query or localStorage
      email.value = route.query.email || ''
      
      if (!email.value) {
        const userProfile = localStorage.getItem('userProfile')
        if (userProfile) {
          try {
            const profile = JSON.parse(userProfile)
            email.value = profile.email || ''
          } catch (e) {
            console.error('Error parsing user profile:', e)
          }
        }
      }
      
      // Save email to localStorage for future use
      if (email.value) {
        localStorage.setItem('pendingConfirmationEmail', email.value)
      } else {
        const pendingEmail = localStorage.getItem('pendingConfirmationEmail')
        if (pendingEmail) {
          email.value = pendingEmail
        }
      }
      
      // Check if verification token exists in URL
      checkVerificationToken()
    })
    
    // Check if the URL contains a verification token
    const checkVerificationToken = async () => {
      const hash = window.location.hash
      const query = window.location.search
      
      if (hash && hash.includes('access_token')) {
        // The hash includes tokens, process the sign-in
        const { data, error } = await supabase.auth.getSession()
        
        if (!error && data?.session) {
          // Successfully authenticated and verified
          emailVerified.value = true
        }
      } else if (query && query.includes('type=signup')) {
        // Email confirmation was successful
        emailVerified.value = true
      }
    }
    
    const resendConfirmation = async () => {
      resending.value = true
      resendSuccess.value = null
      resendError.value = null
      
      try {
        if (!supabase) {
          // Mock for development
          setTimeout(() => {
            resendSuccess.value = "Confirmation email has been resent. Please check your inbox."
            resending.value = false
          }, 1000)
          return
        }
        
        const { error } = await supabase.auth.resend({
          type: 'signup',
          email: email.value
        })
        
        if (error) {
          resendError.value = error.message
        } else {
          resendSuccess.value = "Confirmation email has been resent. Please check your inbox."
        }
      } catch (e) {
        resendError.value = "An unexpected error occurred. Please try again."
        console.error(e)
      } finally {
        resending.value = false
      }
    }
    
    const proceedToAssessment = () => {
      // Store a flag indicating the user chose to proceed without verification
      localStorage.setItem('proceedWithoutVerification', 'true')
      // Redirect to assessment
      router.push('/assessment')
    }
    
    return {
      email,
      resending,
      resendSuccess,
      resendError,
      emailVerified,
      resendConfirmation,
      proceedToAssessment
    }
  }
}
</script>