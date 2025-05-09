<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-black bg-opacity-50" @click="close"></div>
    
    <!-- Modal content -->
    <div class="bg-white rounded-lg shadow-xl max-w-md w-full z-10 overflow-hidden">
      <!-- Header -->
      <div class="bg-blue-600 px-5 py-4">
        <h3 class="text-lg font-semibold text-white">Share Your Report</h3>
      </div>
      
      <!-- Body -->
      <div class="p-5">
        <!-- Tab selection -->
        <div class="flex border-b border-gray-200 mb-4">
          <button 
            @click="method = 'email'" 
            class="px-4 py-2 text-sm font-medium"
            :class="method === 'email' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'"
          >
            Via Email
          </button>
          <button 
            @click="method = 'link'" 
            class="px-4 py-2 text-sm font-medium"
            :class="method === 'link' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'"
          >
            Shareable Link
          </button>
        </div>
        
        <!-- Success message -->
        <div v-if="success" class="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          <p v-if="method === 'email'">Your report has been sent successfully!</p>
          <p v-else>Your shareable link has been generated successfully!</p>
        </div>
        
        <!-- Error message -->
        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {{ error }}
        </div>
        
        <!-- Email sharing form -->
        <form v-if="method === 'email' && !success" @submit.prevent="shareViaEmail" class="space-y-4">
          <div>
            <label for="recipientEmail" class="block text-sm font-medium text-gray-700 mb-1">
              Recipient Email *
            </label>
            <input 
              v-model="recipientEmail" 
              id="recipientEmail" 
              type="email" 
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="colleague@example.com"
            />
          </div>
          
          <div>
            <label for="senderName" class="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input 
              v-model="senderName" 
              id="senderName" 
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your name"
            />
          </div>
          
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700 mb-1">
              Message (Optional)
            </label>
            <textarea 
              v-model="message" 
              id="message" 
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a personal message..."
            ></textarea>
          </div>
          
          <div class="flex items-center">
            <input 
              v-model="includePdf" 
              id="includePdf" 
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="includePdf" class="ml-2 block text-sm text-gray-700">
              Include PDF report as attachment
            </label>
          </div>
          
          <div class="flex justify-end space-x-3 pt-3">
            <button 
              type="button" 
              @click="close" 
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </span>
              <span v-else>Send Email</span>
            </button>
          </div>
        </form>
        
        <!-- Link sharing section -->
        <div v-if="method === 'link'" class="space-y-4">
          <div v-if="!shareableLink && !success" class="text-center py-2">
            <p class="text-gray-700 mb-4">
              Create a shareable link to your report that you can send to colleagues or partners.
            </p>
            <button 
              @click="generateLink" 
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              :disabled="loading"
            >
              <span v-if="loading" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </span>
              <span v-else>Generate Shareable Link</span>
            </button>
          </div>
          
          <div v-if="shareableLink || success" class="space-y-3">
            <p class="text-sm text-gray-700">
              Your report can be accessed using this link:
            </p>
            <div class="flex items-center space-x-2">
              <input 
                type="text" 
                :value="shareableLink" 
                readonly
                class="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button 
                @click="copyLink" 
                class="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span v-if="linkCopied">Copied!</span>
                <span v-else>Copy</span>
              </button>
            </div>
            <p class="text-xs text-gray-500">
              This link will expire in 30 days.
            </p>
          </div>
          
          <div class="flex justify-end space-x-3 pt-3">
            <button 
              type="button" 
              @click="close" 
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShareModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    success: {
      type: Boolean,
      default: false
    },
    error: {
      type: String,
      default: ''
    },
    shareableLink: {
      type: String,
      default: ''
    },
    linkCopied: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      method: 'email',
      recipientEmail: '',
      senderName: '',
      message: '',
      includePdf: true
    }
  },
  methods: {
    close() {
      this.$emit('close')
    },
    shareViaEmail() {
      this.$emit('share-email', {
        recipientEmail: this.recipientEmail,
        senderName: this.senderName,
        message: this.message,
        includePdf: this.includePdf
      })
    },
    generateLink() {
      this.$emit('generate-link')
    },
    copyLink() {
      this.$emit('copy-link')
    }
  }
}
</script>