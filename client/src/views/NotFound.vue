<template>
  <div class="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
    <div class="text-center">
      <h1 class="text-9xl font-bold text-blue-600">404</h1>
      <h2 class="text-3xl font-semibold mt-4 mb-6 text-gray-800">Page Not Found</h2>
      <p class="text-lg text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <router-link to="/" class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-block">
        Return to Home
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFound'
}
</script>