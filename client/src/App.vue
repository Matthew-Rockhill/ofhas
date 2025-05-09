<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Add the AuthHandler component at the top of your template -->
    <AuthHandler />
    
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <router-link to="/" class="text-2xl font-bold text-blue-600">OFHAS</router-link>
        <nav>
          <ul class="flex space-x-6">
            <li><router-link to="/" class="text-gray-700 hover:text-blue-600">Home</router-link></li>
            <li><router-link to="/about" class="text-gray-700 hover:text-blue-600">About</router-link></li>
            <li><router-link to="/assessment" class="text-gray-700 hover:text-blue-600">Assessment</router-link></li>
          </ul>
        </nav>
      </div>
    </header>
    
    <main class="flex-grow">
      <router-view />
    </main>
    
    <footer class="bg-gray-800 text-white py-6">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row justify-between">
          <div class="mb-4 md:mb-0">
            <h3 class="text-lg font-semibold mb-2">Financial Health Assessment</h3>
            <p class="text-gray-300">Helping businesses build financial health across 6 pillars</p>
          </div>
          <div>
            <h4 class="text-md font-semibold mb-2">Contact</h4>
            <p class="text-gray-300">info@financialhealth.com</p>
          </div>
        </div>
        <div class="mt-6 border-t border-gray-700 pt-6 text-center text-gray-300">
          &copy; {{ new Date().getFullYear() }} Organisational Financial Health Assessment System. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
// Import the AuthHandler component
import AuthHandler from './components/AuthHandler.vue'

export default {
  name: 'App',
  // Register the component
  components: {
    AuthHandler
  }
}
</script>