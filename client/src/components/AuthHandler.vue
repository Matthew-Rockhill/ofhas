<template>
  <!-- This component doesn't render anything visible -->
</template>

<script>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'AuthHandler',
  setup() {
    const router = useRouter()
    
    // Function to extract token and type from URL hash
    const processUrlHash = () => {
      // Check if we have a hash in the URL
      if (!window.location.hash) return false
      
      const hash = window.location.hash.substring(1)
      const params = new URLSearchParams(hash)
      
      // Check if the hash contains auth-related parameters
      if (params.has('access_token') || params.has('type')) {
        const accessToken = params.get('access_token')
        const type = params.get('type')
        
        if (accessToken) {
          // Store the token in localStorage for the auth callback to use
          localStorage.setItem('resetPasswordToken', accessToken)
        }
        
        // Handle different auth types
        if (type === 'recovery' || window.location.hash.includes('type=recovery')) {
          // For password reset, redirect to the reset password page
          router.push('/reset-password')
          return true
        } else if (type === 'signup' || window.location.hash.includes('type=signup')) {
          // For email confirmation, redirect to login with success message
          router.push('/login?message=email_confirmed')
          return true
        } else if (accessToken) {
          // For other auth with token, redirect to auth callback
          router.push('/auth/callback' + window.location.hash)
          return true
        }
      }
      
      return false
    }
    
    onMounted(() => {
      // Process auth parameters if they exist
      processUrlHash()
    })
    
    return {}
  }
}
</script>