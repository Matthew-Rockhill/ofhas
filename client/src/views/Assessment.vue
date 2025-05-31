<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div v-if="!emailConfirmed" class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
      <strong>Action Required:</strong> Please check your email and confirm your account. You must confirm your email to submit your assessment and view your results.
    </div>
    <div class="max-w-3xl mx-auto px-4">
      <!-- Progress bar and pillar indicators -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">{{ currentQuestion?.pillar || '' }}</span>
          <span class="text-sm font-medium text-blue-600">{{ progressPercent }}% Complete</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full">
          <div class="h-2 bg-blue-600 rounded-full" :style="`width: ${progressPercent}%`"></div>
        </div>
        
        <!-- Pillar progress indicators -->
        <div class="mt-4 grid grid-cols-6 gap-2">
          <div v-for="(pillar, index) in pillarProgress" :key="index" 
            class="flex flex-col items-center">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
              :class="[
                pillar.completed === pillar.total 
                  ? 'bg-green-100 text-green-800' 
                  : pillar.completed > 0 
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
              ]">
              {{ pillar.completed }}/{{ pillar.total }}
            </div>
            <span class="text-xs mt-1 text-center text-gray-600">{{ pillar.name.split(' ')[0] }}</span>
          </div>
        </div>
      </div>
      
      <!-- Assessment content -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">Financial Health Assessment</h1>
          <p class="mt-1 text-gray-600">Rate your organization from 1 (needs significant improvement) to 10 (excellent)</p>
        </div>
        
        <!-- Loading state -->
        <div v-if="loading" class="flex justify-center items-center p-16">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        
        <!-- Current question -->
        <div v-else-if="currentQuestion" class="p-6">
          <div class="mb-6">
            <div class="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 mb-2">
              {{ currentQuestion.pillar }}
            </div>
            <h2 class="text-xl font-semibold text-gray-900">{{ currentQuestion.copy }}</h2>
          </div>
          
          <div class="mb-8">
            <div class="flex justify-between mb-2 text-sm text-gray-500">
              <span>Needs Improvement</span>
              <span>Excellent</span>
            </div>
            <div class="grid grid-cols-10 gap-1">
              <template v-for="rating in 10" :key="rating">
                <button 
                  @click="setAnswer(currentQuestion.id, rating)"
                  class="py-3 rounded-md text-sm font-medium"
                  :class="[
                    answers[currentQuestion.id] === rating 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  ]"
                >
                  {{ rating }}
                </button>
              </template>
            </div>
          </div>
          
          <!-- Navigation buttons -->
          <div class="flex justify-between pt-4 border-t border-gray-200">
            <div>
              <button 
                @click="prevQuestion" 
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                :disabled="currentIndex === 0"
                :class="{'opacity-50 cursor-not-allowed': currentIndex === 0}"
              >
                Previous
              </button>
            </div>
            
            <div class="flex gap-3">
              <button
                v-if="!isLastQuestion" 
                @click="skipQuestion"
                class="px-4 py-2 text-sm border border-gray-300 rounded-md font-medium text-gray-700 hover:bg-gray-50"
              >
                Skip for now
              </button>
              
              <button 
                @click="nextQuestion" 
                class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                :disabled="!answers[currentQuestion.id]"
              >
                {{ isLastQuestion ? 'Finish Assessment' : 'Next Question' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- No questions state -->
        <div v-else class="p-6 text-center">
          <p class="text-lg text-gray-700">No questions available. Please try again later.</p>
        </div>
      </div>
      
      <!-- Save progress button -->
      <div class="mt-6 text-center">
        <button 
          @click="saveAndExit" 
          class="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Save progress and continue later
        </button>
      </div>
    </div>
    
    <!-- Skip/Return dialog -->
    <div v-if="showSkippedModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 p-4">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 class="text-lg font-bold mb-4">Skipped Questions</h3>
        <p class="text-gray-700 mb-4">
          You have {{ skippedQuestions.length }} skipped questions. Would you like to go back and complete them?
        </p>
        
        <div class="max-h-48 overflow-y-auto mb-4 border rounded-md">
          <ul class="divide-y">
            <li v-for="(question, index) in skippedQuestions" :key="index" class="p-3 hover:bg-gray-50">
              <button @click="goToQuestion(questions.findIndex(q => q.id === question.id))" class="text-left w-full">
                <span class="block text-sm font-medium text-gray-900">{{ question.pillar }}</span>
                <span class="block text-sm text-gray-700">{{ question.copy }}</span>
              </button>
            </li>
          </ul>
        </div>
        
        <div class="flex justify-end space-x-3">
          <button @click="showSkippedModal = false" class="px-4 py-2 border rounded text-gray-700">
            Close
          </button>
          <button @click="finishAssessment" class="px-4 py-2 bg-blue-600 text-white rounded">
            Finish Anyway
          </button>
        </div>
      </div>
    </div>
    
    <!-- Saving notification -->
    <div v-if="showSavingNotification" 
      class="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white px-4 py-2 rounded-md shadow-lg">
      <div class="flex items-center">
        <svg v-if="savingStatus === 'saving'" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <svg v-else-if="savingStatus === 'saved'" class="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <svg v-else-if="savingStatus === 'error'" class="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>{{ savingMessage }}</span>
      </div>
    </div>
    
    <!-- Email confirmation modal -->
    <div v-if="showConfirmModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <h3 class="text-lg font-bold mb-4 text-yellow-700">Email Confirmation Required</h3>
        <p class="mb-4 text-gray-700">You must confirm your email address before submitting your assessment. Please check your inbox for a confirmation email and follow the instructions.</p>
        <button @click="showConfirmModal = false" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">OK</button>
      </div>
    </div>
    
    <!-- Resume assessment modal -->
    <div v-if="showResumeModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
        <h3 class="text-lg font-bold mb-4 text-blue-700">Resume Assessment?</h3>
        <p class="mb-4 text-gray-700">
          We found an unfinished assessment. Would you like to resume where you left off, or start a new assessment?
        </p>
        <div class="flex justify-center gap-4">
          <button @click="resumeAssessment" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Resume</button>
          <button @click="startNewAssessment" class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">Start New</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import * as AssessmentService from '../services/assessmentService'
import supabase from '../supabaseClient'

export default {
  name: 'Assessment',
  setup() {
    const router = useRouter()
    
    // State
    const loading = ref(true)
    const questions = ref([])
    const currentIndex = ref(0)
    const answers = ref({})
    const showSkippedModal = ref(false)
    const autosaveInterval = ref(null)
    
    // Saving notification state
    const showSavingNotification = ref(false)
    const savingStatus = ref('') // 'saving', 'saved', or 'error'
    const savingMessage = ref('')
    const notificationTimeout = ref(null)
    
    const emailConfirmed = ref(true)
    const showConfirmModal = ref(false)
    
    const showResumeModal = ref(false)
    let pendingSavedProgress = null
    
    // Computed properties
    const currentQuestion = computed(() => questions.value[currentIndex.value] || null)
    
    const isLastQuestion = computed(() => {
      return currentIndex.value === questions.value.length - 1
    })
    
    const progressPercent = computed(() => {
      if (questions.value.length === 0) return 0
      const answeredCount = Object.keys(answers.value).length
      return Math.round((answeredCount / questions.value.length) * 100)
    })
    
    const pillarProgress = computed(() => {
      if (!questions.value.length) return []
      
      // Count questions by pillar
      const pillars = {}
      questions.value.forEach(q => {
        if (!pillars[q.pillar]) {
          pillars[q.pillar] = { name: q.pillar, total: 0, completed: 0 }
        }
        pillars[q.pillar].total++
        
        if (answers.value[q.id]) {
          pillars[q.pillar].completed++
        }
      })
      
      return Object.values(pillars)
    })
    
    const skippedQuestions = computed(() => {
      return questions.value.filter(q => !answers.value[q.id])
    })
    
    // Methods
    const loadQuestions = async () => {
      try {
        const userId = await AssessmentService.getCurrentUserId()
        const allQuestions = AssessmentService.getAllQuestions()
        let savedProgress = null
        if (userId) {
          savedProgress = await AssessmentService.loadProgressFromSupabase(userId)
        }
        if (!savedProgress) {
          savedProgress = AssessmentService.loadProgressFromLocal()
        }
        if (savedProgress && savedProgress.questions && savedProgress.questions.length > 0) {
          // Prompt user to resume or start new
          pendingSavedProgress = savedProgress
          showResumeModal.value = true
        } else {
          // Start fresh
          questions.value = AssessmentService.shuffleArray(allQuestions)
          currentIndex.value = 0
          answers.value = {}
          saveProgress()
          loading.value = false
        }
      } catch (error) {
        console.error('Error loading questions:', error)
        loading.value = false
        showNotification('error', 'Error loading questions')
      }
    }
    
    const saveProgress = async () => {
      const progress = {
        currentIndex: currentIndex.value,
        answers: answers.value,
        questions: questions.value
      }
      
      showNotification('saving', 'Saving progress...')
      
      // Save locally first
      const localSaved = AssessmentService.saveProgressLocally(progress)
      
      // Try to save to Supabase if user is logged in
      const userId = await AssessmentService.getCurrentUserId()
      let remoteSaved = false
      
      if (userId) {
        remoteSaved = await AssessmentService.saveProgressToSupabase(userId, progress)
      }
      
      if (localSaved || remoteSaved) {
        showNotification('saved', 'Progress saved')
      } else {
        showNotification('error', 'Failed to save progress')
      }
    }
    
    // Show a notification toast
    const showNotification = (status, message, duration = 3000) => {
      // Clear any existing timeout
      if (notificationTimeout.value) {
        clearTimeout(notificationTimeout.value)
      }
      
      savingStatus.value = status
      savingMessage.value = message
      showSavingNotification.value = true
      
      // Hide notification after duration
      notificationTimeout.value = setTimeout(() => {
        showSavingNotification.value = false
      }, duration)
    }
    
    const setAnswer = (questionId, rating) => {
      answers.value[questionId] = rating
      saveProgress()
    }
    
    const prevQuestion = () => {
      if (currentIndex.value > 0) {
        currentIndex.value--
        saveProgress()
      }
    }
    
    const nextQuestion = () => {
      if (!answers.value[currentQuestion.value.id]) {
        // Require an answer before proceeding
        return
      }
      
      if (isLastQuestion.value) {
        // Check for skipped questions
        if (skippedQuestions.value.length > 0) {
          showSkippedModal.value = true
        } else {
          finishAssessment()
        }
      } else {
        currentIndex.value++
        saveProgress()
      }
    }
    
    const skipQuestion = () => {
      if (!isLastQuestion.value) {
        currentIndex.value++
        saveProgress()
      }
    }
    
    const goToQuestion = (index) => {
      currentIndex.value = index
      showSkippedModal.value = false
      saveProgress()
    }
    
    const finishAssessment = async () => {
      if (!emailConfirmed.value) {
        showConfirmModal.value = true
        return
      }
      try {
        showNotification('saving', 'Saving assessment...')
        
        // Save final assessment
        const result = await AssessmentService.saveCompletedAssessment({
          answers: answers.value,
          questions: questions.value
        })
        
        if (result.success) {
          // If saved only locally, show a different message
          if (result.local) {
            showNotification('saved', 'Assessment saved locally')
          } else {
            showNotification('saved', 'Assessment saved successfully')
          }
          
          // Redirect to report page
          router.push('/report')
        } else {
          showNotification('error', 'Failed to save assessment')
        }
      } catch (e) {
        console.error('Error saving final assessment results:', e)
        showNotification('error', 'Error saving results. Please try again.')
      }
    }
    
    const saveAndExit = async () => {
      await saveProgress()
      
      // Show a confirmation message
      showNotification('saved', 'Your progress has been saved. You can return anytime to continue.', 5000)
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/')
      }, 1500)
    }
    
    // Set up autosave
    const setupAutosave = () => {
      // Autosave every 30 seconds
      autosaveInterval.value = setInterval(() => {
        if (Object.keys(answers.value).length > 0) {
          saveProgress()
        }
      }, 30000)
    }
    
    const resumeAssessment = () => {
      if (pendingSavedProgress) {
        questions.value = pendingSavedProgress.questions
        currentIndex.value = pendingSavedProgress.currentIndex || 0
        answers.value = pendingSavedProgress.answers || {}
        showNotification('saved', 'Restored your previous progress')
      }
      showResumeModal.value = false
      loading.value = false
    }
    
    const startNewAssessment = async () => {
      // Clear progress from Supabase and localStorage
      const userId = await AssessmentService.getCurrentUserId()
      if (userId) {
        await supabase.from('assessment_progress').delete().eq('user_id', userId)
      }
      localStorage.removeItem('assessmentProgress')
      const allQuestions = AssessmentService.getAllQuestions()
      questions.value = AssessmentService.shuffleArray(allQuestions)
      currentIndex.value = 0
      answers.value = {}
      saveProgress()
      showResumeModal.value = false
      loading.value = false
      showNotification('saved', 'Started a new assessment')
    }
    
    // Check email confirmation status on mount
    onMounted(async () => {
      try {
        const { data } = await supabase.auth.getUser()
        emailConfirmed.value = data?.user?.email_confirmed_at ? true : false
      } catch (e) {
        emailConfirmed.value = true // fallback: allow if error
      }
      loadQuestions()
    })
    
    onBeforeUnmount(() => {
      // Clear interval
      if (autosaveInterval.value) {
        clearInterval(autosaveInterval.value)
      }
      
      // Final save
      saveProgress()
    })
    
    // Save on changes to answers
    watch(answers, () => {
      saveProgress()
    }, { deep: true })
    
    return {
      loading,
      questions,
      currentIndex,
      answers,
      showSkippedModal,
      currentQuestion,
      isLastQuestion,
      progressPercent,
      pillarProgress,
      skippedQuestions,
      savingStatus,
      savingMessage,
      showSavingNotification,
      setAnswer,
      prevQuestion,
      nextQuestion,
      skipQuestion,
      goToQuestion,
      finishAssessment,
      saveAndExit,
      emailConfirmed,
      showConfirmModal,
      showResumeModal,
      resumeAssessment,
      startNewAssessment,
    }
  }
}
</script>