<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center" style="background: rgba(0,0,0,0.15);">
    <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-8 relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
      <h2 class="text-2xl font-bold mb-6 text-blue-900">Contact Us</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-gray-700 mb-1">Name</label>
          <input v-model="form.name" type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
        </div>
        <div>
          <label class="block text-gray-700 mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" required />
        </div>
        <div>
          <label class="block text-gray-700 mb-1">Service</label>
          <input v-model="form.service" type="text" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" :readonly="!!form.service" />
        </div>
        <div>
          <label class="block text-gray-700 mb-1">Message</label>
          <textarea v-model="form.message" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400" rows="4" required></textarea>
        </div>
        <div v-if="error" class="text-red-600 text-sm">{{ error }}</div>
        <button type="submit" class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors font-semibold">Send</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContactModal',
  props: {
    show: Boolean,
    service: String
  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        service: this.service || '',
        message: ''
      },
      error: ''
    }
  },
  watch: {
    service(newVal) {
      this.form.service = newVal || ''
    },
    show(newVal) {
      if (!newVal) {
        this.form = { name: '', email: '', service: this.service || '', message: '' }
        this.error = ''
      }
    }
  },
  methods: {
    handleSubmit() {
      if (!this.form.name || !this.form.email || !this.form.message) {
        this.error = 'Please fill in all required fields.'
        return
      }
      this.error = ''
      this.$emit('submit', { ...this.form })
    }
  }
}
</script> 