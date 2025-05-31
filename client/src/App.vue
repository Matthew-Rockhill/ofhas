<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Add the AuthHandler component at the top of your template -->
    <AuthHandler />
    
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <router-link to="/" class="flex items-center">
          <img src="/ofhas_logo.png" alt="OFHAS Logo" style="height: 40px;" />
        </router-link>
        <nav>
          <ul class="flex space-x-6">
            <template v-if="!isAuthenticated">
              <li><router-link to="/" class="text-gray-700 hover:text-blue-600">Home</router-link></li>
              <li><router-link to="/about" class="text-gray-700 hover:text-blue-600">About</router-link></li>
              <li><router-link to="/assessment" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">Assessment</router-link></li>
            </template>
            <template v-else>
              <li><router-link to="/history" class="inline-block bg-gray-100 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-200 transition-colors">History</router-link></li>
              <li><button @click="handleLogout" class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors">Logout</button></li>
            </template>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="flex-grow">
      <router-view />
    </main>
    
    <footer class="bg-blue-900 text-white py-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Logo and Description -->
          <div class="flex flex-col">
            <h3 class="text-2xl font-bold text-white mb-4">OFHAS</h3>
            <p class="text-blue-100">Empowering organisations to achieve lasting financial wellbeing.<br><br>
Our assessment guides you through six essential pillars, providing insights and practical steps to strengthen your organisation's financial health and resilience.</p>
          </div>

          <!-- Quick Links -->
          <div class="flex flex-col justify-start md:ml-12">
            <h4 class="text-lg font-semibold mb-6">Quick Links</h4>
            <ul class="space-y-4">
              <li><router-link to="/" class="text-blue-100 hover:text-white transition-colours">Home</router-link></li>
              <li><router-link to="/about" class="text-blue-100 hover:text-white transition-colours">About</router-link></li>
              <li><router-link to="/assessment" class="text-blue-100 hover:text-white transition-colours">Assessment</router-link></li>
              <li><router-link to="/history" class="text-blue-100 hover:text-white transition-colours">History</router-link></li>
            </ul>
          </div>

          <!-- Contact -->
          <div class="flex flex-col justify-start">
            <h4 class="text-lg font-semibold mb-6">Contact</h4>
            <a href="mailto:info@ofhas.com" class="text-blue-100 hover:text-white transition-colours flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              info@ofhas.com
            </a>
          </div>
        </div>

        <div class="mt-16 pt-8 border-t border-blue-800 text-center text-blue-100">
          &copy; {{ new Date().getFullYear() }} Organisational Financial Health Assessment System. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
// Import the AuthHandler component
import AuthHandler from './components/AuthHandler.vue'
import { ref, onMounted } from 'vue'
import supabase from './supabaseClient'

export default {
  name: 'App',
  // Register the component
  components: {
    AuthHandler
  },
  setup() {
    const isAuthenticated = ref(false)

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      isAuthenticated.value = !!session
    }

    const handleLogout = async () => {
      await supabase.auth.signOut()
      isAuthenticated.value = false
    }

    onMounted(() => {
      checkAuth()
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        isAuthenticated.value = !!session
      })
    })

    return {
      isAuthenticated,
      handleLogout
    }
  }
}
</script>

<style>
@keyframes scroll-left {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-50%);
  }
}

.animate-scroll-left {
  animation: scroll-left 30s linear infinite;
  display: flex;
  width: max-content;
}

.animate-scroll-left:hover {
  animation-play-state: paused;
}
</style>