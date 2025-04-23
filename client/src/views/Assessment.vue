<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4">
      <!-- Progress bar -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Progress</span>
          <span class="text-sm font-medium text-blue-600">{{ progressPercent }}% Complete</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full">
          <div class="h-2 bg-blue-600 rounded-full" :style="`width: ${progressPercent}%`"></div>
        </div>
      </div>
      
      <!-- Assessment content -->
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6 border-b border-gray-200">
          <h1 class="text-2xl font-bold text-gray-900">Financial Health Assessment</h1>
          <p class="mt-1 text-gray-600">Rate your organization from 1 (needs significant improvement) to 5 (excellent)</p>
        </div>
        
        <!-- Current question -->
        <div v-if="loading" class="flex justify-center items-center p-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        
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
            <div class="flex space-x-1">
              <template v-for="rating in 10" :key="rating">
                <button 
                  @click="setAnswer(currentQuestion.id, rating)"
                  class="flex-1 py-2 rounded-md text-sm text-center"
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
          
          <div class="flex justify-between pt-4 border-t border-gray-200">
            <button 
              @click="prevQuestion" 
              class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              :disabled="currentIndex === 0"
              :class="{'opacity-50 cursor-not-allowed': currentIndex === 0}"
            >
              Previous
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
        
        <div v-else class="p-6 text-center">
          <p class="text-lg text-gray-700">No questions available. Please try again later.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Assessment',
  data() {
    return {
      loading: true,
      questions: [],
      currentIndex: 0,
      answers: {}
    }
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || null
    },
    isLastQuestion() {
      return this.currentIndex === this.questions.length - 1
    },
    progressPercent() {
      if (this.questions.length === 0) return 0
      const completedCount = Object.keys(this.answers || {}).length
      const percent = Math.round((completedCount / this.questions.length) * 100)
      return Math.min(percent, 100)
    }
  },
  created() {
    this.loadQuestions()
    this.loadProgress()
  },
  methods: {
    loadQuestions() {
      // In production, fetch questions from your API
      // For now, we'll create questions based on the 6 pillars
      
      const allQuestions = [
        // Pillar 1: Business Plan (Financial)
        { id: '1-1', copy: 'How clearly defined are your mission and vision?', pillar: 'Business Plan' },
        { id: '1-2', copy: 'How well-documented are your products and services?', pillar: 'Business Plan' },
        { id: '1-3', copy: 'How accurate are your 3-year sales and profit forecasts?', pillar: 'Business Plan' },
        { id: '1-4', copy: 'How adequate is your capital investment planning?', pillar: 'Business Plan' },
        { id: '1-5', copy: 'How effective is your strategy for managing debtors, stock, and creditors?', pillar: 'Business Plan' },
        { id: '1-6', copy: 'How detailed is your cashflow forecast?', pillar: 'Business Plan' },
        { id: '1-7', copy: 'How secure is your business funding?', pillar: 'Business Plan' },
        
        // Pillar 2: Break Even and Margin
        { id: '2-1', copy: 'How diverse is your product range?', pillar: 'Break Even and Margin' },
        { id: '2-2', copy: 'How detailed is your sales plan by product group?', pillar: 'Break Even and Margin' },
        { id: '2-3', copy: 'How accurate is your product costing and mark-up methodology?', pillar: 'Break Even and Margin' },
        { id: '2-4', copy: 'How well do you track direct expenses?', pillar: 'Break Even and Margin' },
        { id: '2-5', copy: 'How efficiently do you manage your overheads?', pillar: 'Break Even and Margin' },
        { id: '2-6', copy: 'How well do you understand the volume needed to cover overheads?', pillar: 'Break Even and Margin' },
        { id: '2-7', copy: 'How often do you perform "what if" analysis?', pillar: 'Break Even and Margin' },
        
        // Pillar 3: Blueprint - Systems and Procedures
        { id: '3-1', copy: 'How well-established are your flow charts for business processes?', pillar: 'Blueprint' },
        { id: '3-2', copy: 'How complete are your written procedures for business processes?', pillar: 'Blueprint' },
        { id: '3-3', copy: 'How effectively have you adopted electronic systems to manage finances?', pillar: 'Blueprint' },
        { id: '3-4', copy: 'How appropriate is your ERP system for your business needs?', pillar: 'Blueprint' },
        { id: '3-5', copy: 'How robust are your checks and balances for internal controls?', pillar: 'Blueprint' },
        { id: '3-6', copy: 'How extensively do you use technology to reduce manual data capture?', pillar: 'Blueprint' },
        { id: '3-7', copy: 'How well integrated are your systems to avoid duplication of data entry?', pillar: 'Blueprint' },
        
        // Pillar 4: Actual Results
        { id: '4-1', copy: 'How timely and accurate are your daily, weekly, and monthly results?', pillar: 'Actual Results' },
        { id: '4-2', copy: 'How quickly can you produce results with at least 95% accuracy?', pillar: 'Actual Results' },
        { id: '4-3', copy: 'How comprehensive is your reporting of KPIs alongside financials?', pillar: 'Actual Results' },
        { id: '4-4', copy: 'How effectively do you use graphics to illustrate performance trends?', pillar: 'Actual Results' },
        { id: '4-5', copy: 'How regular are your budget comparisons?', pillar: 'Actual Results' },
        { id: '4-6', copy: 'How promptly do you reforecast when necessary?', pillar: 'Actual Results' },
        { id: '4-7', copy: 'How aligned are your management reporting and financials?', pillar: 'Actual Results' },
        
        // Pillar 5: Bank/Cashflow
        { id: '5-1', copy: 'How frequently do you update your cashflow (at least weekly)?', pillar: 'Bank/Cashflow' },
        { id: '5-2', copy: 'How accurately do you reconcile bank balances?', pillar: 'Bank/Cashflow' },
        { id: '5-3', copy: 'How consistently do you compare actuals to previous forecasts?', pillar: 'Bank/Cashflow' },
        { id: '5-4', copy: 'How promptly do you update forecasts based on previous results?', pillar: 'Bank/Cashflow' },
        { id: '5-5', copy: 'How closely do you monitor customer and supplier balances?', pillar: 'Bank/Cashflow' },
        { id: '5-6', copy: 'How effectively do you monitor stock balances?', pillar: 'Bank/Cashflow' },
        { id: '5-7', copy: 'How regularly do you review capital expenditure?', pillar: 'Bank/Cashflow' },
        
        // Pillar 6: Compliance
        { id: '6-1', copy: 'How timely are your employer returns and payments (PAYE, UIF, SDL)?', pillar: 'Compliance' },
        { id: '6-2', copy: 'How current are your CIPC returns (Annual returns and Ownership declarations)?', pillar: 'Compliance' },
        { id: '6-3', copy: 'How punctual are your VAT returns?', pillar: 'Compliance' },
        { id: '6-4', copy: 'How up-to-date are your annual tax returns?', pillar: 'Compliance' },
        { id: '6-5', copy: 'How compliant are you with industry-specific returns?', pillar: 'Compliance' },
        { id: '6-6', copy: 'How timely are your Trade Union/Department of Labour returns?', pillar: 'Compliance' },
        { id: '6-7', copy: 'How regularly do you conduct employee reviews?', pillar: 'Compliance' }
      ]
      
      // Shuffle the questions for each pillar but keep the pillar order
      const shuffledByPillar = {}
      
      allQuestions.forEach(q => {
        if (!shuffledByPillar[q.pillar]) {
          shuffledByPillar[q.pillar] = []
        }
        shuffledByPillar[q.pillar].push(q)
      })
      
      // Shuffle within each pillar
      Object.keys(shuffledByPillar).forEach(pillar => {
        shuffledByPillar[pillar] = shuffledByPillar[pillar].sort(() => Math.random() - 0.5)
      })
      
      // Get the first 3 questions from each pillar to keep the assessment manageable
      const selectedQuestions = []
      Object.values(shuffledByPillar).forEach(pillarQuestions => {
        selectedQuestions.push(...pillarQuestions.slice(0, 3))
      })
      
      // Set the questions and mark as loaded
      this.questions = selectedQuestions
      this.loading = false
    },
    
    loadProgress() {
      try {
        // Check localStorage for any saved progress
        const savedProgress = localStorage.getItem('assessmentProgress')
        if (savedProgress) {
          const progress = JSON.parse(savedProgress)
          // Only restore if the questions have been loaded
          if (this.questions.length > 0) {
            this.currentIndex = progress.currentIndex || 0
            this.answers = progress.answers || {}
          }
        }
      } catch (e) {
        console.error('Error loading progress:', e)
        // If there's an error, just continue with default values
      }
    },
    
    saveProgress() {
      try {
        localStorage.setItem('assessmentProgress', JSON.stringify({
          currentIndex: this.currentIndex,
          answers: this.answers,
          questions: this.questions
        }))
      } catch (e) {
        console.error('Error saving progress:', e)
      }
    },
    
    setAnswer(questionId, rating) {
      this.answers[questionId] = rating
      this.saveProgress()
    },
    
    prevQuestion() {
      if (this.currentIndex > 0) {
        this.currentIndex--
        this.saveProgress()
      }
    },
    
    nextQuestion() {
      if (!this.answers[this.currentQuestion.id]) {
        // Require an answer before proceeding
        return
      }
      
      if (this.isLastQuestion) {
        // Save final results and redirect to report
        try {
          localStorage.setItem('assessmentAnswers', JSON.stringify(this.answers))
          localStorage.setItem('assessmentQuestions', JSON.stringify(this.questions))
          this.$router.push('/report')
        } catch (e) {
          console.error('Error saving final assessment results:', e)
          alert('There was an error saving your results. Please try again.')
        }
      } else {
        this.currentIndex++
        this.saveProgress()
      }
    }
  }
}
</script>