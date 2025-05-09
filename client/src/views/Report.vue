<template>
  <div class="bg-gradient-to-b from-blue-50 to-white">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Report Header -->
      <div class="text-center mb-10">
        <h1 class="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Your Financial Health Report</h1>
        <p class="text-lg text-gray-700 max-w-3xl mx-auto">
          Based on your assessment of the 6 pillars of financial health, here's your personalized analysis and recommendations.
        </p>
      </div>
      
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading your assessment data...</p>
      </div>
      
      <!-- No data state -->
      <div v-else-if="!hasData" class="text-center p-12 bg-white rounded-lg shadow-md">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">No Assessment Data Found</h2>
        <p class="text-gray-600 mb-6">
          We couldn't find any completed assessment data. Please complete the assessment to view your report.
        </p>
        <router-link to="/assessment" class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          Take Assessment
        </router-link>
      </div>
      
      <!-- Debug Information (only in development) -->
      <div v-if="showDebug && hasData" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 class="font-medium text-yellow-800 mb-2">Debug Information</h3>
        <div class="text-sm font-mono bg-white p-3 rounded overflow-auto max-h-60">
          <p><strong>Data Source:</strong> {{ dataSource }}</p>
          <p><strong>Raw Answers Sample:</strong> {{ JSON.stringify(Object.fromEntries(Object.entries(rawAnswers).slice(0, 3))) }}...</p>
          <p><strong>Questions Count:</strong> {{ rawQuestions.length }}</p>
          <p><strong>Answers Count:</strong> {{ Object.keys(rawAnswers).length }}</p>
          <p><strong>Pillar Results:</strong> {{ JSON.stringify(calculatedResults) }}</p>
          <p><strong>Overall Score:</strong> {{ overallScore }}</p>
        </div>
        <button @click="refreshData" class="mt-2 px-3 py-1 bg-yellow-200 rounded text-yellow-800 text-sm">
          Refresh Data
        </button>
      </div>
      
      <!-- Report Content (only shown if we have data) -->
      <template v-if="hasData && !isLoading">
        <!-- Summary Section -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10">
          <div class="bg-blue-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white">Executive Summary</h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Radar Chart -->
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Your Financial Health Profile</h3>
                <div class="aspect-square max-w-md mx-auto">
                  <canvas ref="radarChart" class="w-full h-full"></canvas>
                </div>
              </div>
              
              <!-- Overall Score -->
              <div class="bg-gray-50 rounded-lg p-6 flex flex-col">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Overall Financial Health Score</h3>
                
                <div class="flex flex-col items-center justify-center flex-grow">
                  <div class="relative h-40 w-40 mb-6">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <span class="text-4xl font-bold text-blue-600">{{ overallScore }}</span>
                    </div>
                    <canvas ref="doughnutChart" class="w-full h-full"></canvas>
                  </div>
                  
                  <div class="text-center max-w-md">
                    <p class="text-gray-700">
                      {{ scoreFeedback }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Pillar Analysis -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10">
          <div class="bg-blue-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white">Detailed Analysis</h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-for="(pillar, index) in pillarResults" :key="index" 
                class="border rounded-lg overflow-hidden">
                <div class="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
                  <h3 class="font-medium text-gray-900">{{ pillar.name }}</h3>
                  <div class="flex items-center">
                    <span class="font-semibold text-lg mr-2">{{ pillar.score }}</span>
                    <span class="text-sm text-gray-500">/10</span>
                  </div>
                </div>
                <div class="p-4">
                  <p class="text-gray-700 mb-3">{{ getPillarFeedback(pillar.name, pillar.score) }}</p>
                  <h4 class="font-medium text-gray-900 mb-2">Areas to Focus On:</h4>
                  <ul class="list-disc pl-5 text-gray-700 space-y-1">
                    <li v-for="(item, i) in pillar.focusAreas" :key="i">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Recommendations -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10">
          <div class="bg-blue-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white">Recommended Actions</h2>
          </div>
          
          <div class="p-6">
            <p class="text-gray-700 mb-6">
              Based on your assessment, here are the key actions we recommend to improve your organization's financial health:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="(action, index) in recommendedActions" :key="index"
                class="bg-gray-50 p-5 rounded-lg border border-gray-200">
                <div class="flex items-start">
                  <div class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-100 rounded-full text-blue-600 font-bold mr-4">
                    {{ index + 1 }}
                  </div>
                  <div>
                    <h3 class="font-medium text-gray-900 mb-2">{{ action.title }}</h3>
                    <p class="text-gray-700">{{ action.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Actions -->
        <div class="bg-blue-50 rounded-lg shadow-md p-6 flex flex-col md:flex-row items-center justify-between">
          <div class="mb-4 md:mb-0 text-center md:text-left">
            <h3 class="text-lg font-medium text-gray-900 mb-1">Want to share your results?</h3>
            <p class="text-gray-700">Download your report or schedule a consultation to discuss your results.</p>
          </div>
          
          <div class="flex flex-wrap gap-4 justify-center">
            <button @click="downloadPDF" class="flex items-center px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <span class="mr-2">📄</span> Download PDF
            </button>
            <button @click="shareReport" class="flex items-center px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900">
              <span class="mr-2">📤</span> Share Report
            </button>
            <router-link to="/assessment" class="flex items-center px-5 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
              <span class="mr-2">🔄</span> Retake Assessment
            </router-link>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import * as AssessmentService from '../services/assessmentService'
import supabase from '../supabaseClient'

export default {
  name: 'Report',
  setup() {
    // Chart refs
    const radarChart = ref(null)
    const doughnutChart = ref(null)
    const radarChartInstance = ref(null)
    const doughnutChartInstance = ref(null)
    
    // UI state
    const isLoading = ref(true)
    const showDebug = ref(import.meta.env.DEV) // Only show in development mode
    const dataSource = ref('None')
    
    // Data state
    const rawAnswers = ref({})
    const rawQuestions = ref([])
    const calculatedResults = ref({})
    const pillarResults = ref([])
    const overallScore = ref("0.0")
    
    // Computed property to check if we have data
    const hasData = computed(() => {
      return Object.keys(rawAnswers.value).length > 0 && rawQuestions.value.length > 0
    })
    
    // First, add the new function to assessmentService.js
    // This is just for reference - you'll need to add this to the actual service file
    const getCompletedAssessmentFromSupabase = async (userId) => {
      if (!userId || !supabase) return null
      
      try {
        const { data, error } = await supabase
          .from('assessments')
          .select('*')
          .eq('user_id', userId)
          .order('completed_at', { ascending: false })
          .limit(1)
        
        if (error) {
          console.error('Error loading assessment from Supabase:', error)
          return null
        }
        
        if (data.length === 0) {
          console.warn('No assessments found in Supabase for user:', userId)
          return null
        }
        
        console.log('Loaded assessment from Supabase:', data[0])
        dataSource.value = 'Supabase'
        
        // Return the assessment data
        return {
          answers: data[0].answers || {},
          questions: data[0].questions || [],
          completed_at: data[0].completed_at
        }
      } catch (error) {
        console.error('Error in getCompletedAssessmentFromSupabase:', error)
        return null
      }
    }
    
    // Calculate results from the assessment data
    const calculateResults = async () => {
      console.log("Calculating results...")
      
      // Try to get assessment data from Supabase first
      let assessmentData = null
      const userId = await AssessmentService.getCurrentUserId()
      
      if (userId) {
        console.log("User ID found, attempting to load from Supabase:", userId)
        // Use the function if it exists in the service, otherwise use our local implementation
        if (AssessmentService.getCompletedAssessmentFromSupabase) {
          assessmentData = await AssessmentService.getCompletedAssessmentFromSupabase(userId)
        } else {
          assessmentData = await getCompletedAssessmentFromSupabase(userId)
        }
      }
      
      // If not found in Supabase or no user ID, fall back to localStorage
      if (!assessmentData) {
        console.log("Falling back to localStorage for assessment data")
        const storedAnswers = localStorage.getItem('assessmentAnswers')
        const storedQuestions = localStorage.getItem('assessmentQuestions')
        
        if (storedAnswers && storedQuestions) {
          assessmentData = {
            answers: JSON.parse(storedAnswers),
            questions: JSON.parse(storedQuestions)
          }
          dataSource.value = 'localStorage'
        } else {
          console.warn("No assessment data found in localStorage")
          return { results: {}, pillarQuestions: {} }
        }
      }
      
      // Parse and store raw data for debugging
      rawAnswers.value = assessmentData.answers || {}
      rawQuestions.value = assessmentData.questions || []
      
      const answers = rawAnswers.value
      const questions = rawQuestions.value
      
      console.log('Loaded answers:', answers)
      console.log('Loaded questions count:', questions.length)
      console.log('Answers count:', Object.keys(answers).length)
      
      // Group by pillar
      const pillarTotals = {}
      const pillarCounts = {}
      const pillarQuestions = {}
      
      questions.forEach(q => {
        const rating = answers[q.id]
        // Only include questions that have answers
        if (rating !== undefined && rating !== null) {
          if (!pillarTotals[q.pillar]) {
            pillarTotals[q.pillar] = 0
            pillarCounts[q.pillar] = 0
            pillarQuestions[q.pillar] = []
          }
          
          // CRITICAL: Convert rating to number if it's a string
          const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating
          
          pillarTotals[q.pillar] += numericRating
          pillarCounts[q.pillar]++
          pillarQuestions[q.pillar].push({ question: q.copy, rating: numericRating })
        }
      })
      
      // Calculate average scores by pillar
      const results = {}
      for (const pillar in pillarTotals) {
        if (pillarCounts[pillar] > 0) {
          results[pillar] = parseFloat((pillarTotals[pillar] / pillarCounts[pillar]).toFixed(1))
        }
      }
      
      // Store calculated results for debugging
      calculatedResults.value = results
      
      console.log('Calculated pillar results:', results)
      return { results, pillarQuestions }
    }
    
    // Render radar chart
    const renderRadarChart = (results) => {
      const labels = Object.keys(results)
      const scores = Object.values(results)
      
      if (labels.length === 0) {
        console.warn('No data available for radar chart')
        return
      }
      
      if (radarChartInstance.value) {
        radarChartInstance.value.destroy()
      }
      
      const ctx = radarChart.value.getContext('2d')
      radarChartInstance.value = new Chart(ctx, {
        type: 'radar',
        data: {
          labels,
          datasets: [{
            label: 'Financial Health Score',
            data: scores,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(59, 130, 246, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(59, 130, 246, 1)'
          }]
        },
        options: {
          maintainAspectRatio: true,
          scales: {
            r: {
              angleLines: {
                display: true
              },
              suggestedMin: 0,
              suggestedMax: 10
            }
          },
          plugins: {
            legend: {
              display: false
            }
          }
        }
      })
    }
    
    // Render doughnut chart for overall score
    const renderDoughnutChart = (score) => {
      const numericScore = parseFloat(score)
      
      if (isNaN(numericScore)) {
        console.warn('Invalid score for doughnut chart:', score)
        return
      }
      
      if (doughnutChartInstance.value) {
        doughnutChartInstance.value.destroy()
      }
      
      const ctx = doughnutChart.value.getContext('2d')
      doughnutChartInstance.value = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Score', 'Remaining'],
          datasets: [{
            data: [numericScore, 10 - numericScore],
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(229, 231, 235, 0.5)'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          cutout: '75%',
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              enabled: false
            }
          }
        }
      })
    }
    
    // Method to load and update the data
    const loadData = async () => {
      isLoading.value = true
      
      try {
        const { results, pillarQuestions } = await calculateResults()
        
        // Update the pillar results
        pillarResults.value = Object.keys(results).map(pillar => {
          const score = results[pillar]
          
          // Find the lowest scored questions for focus areas
          const questions = pillarQuestions[pillar] || []
          const sortedQuestions = [...questions].sort((a, b) => a.rating - b.rating)
          const focusAreas = sortedQuestions
            .slice(0, 2)
            .map(q => q.question)
          
          return {
            name: pillar,
            score: score,
            focusAreas: focusAreas.length ? focusAreas : ["No specific areas identified."]
          }
        })
        
        // Calculate overall score
        const scores = Object.values(results)
        if (scores.length > 0) {
          const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
          overallScore.value = average.toFixed(1)
        }
        
        // Render charts if we have data
        if (hasData.value) {
          // Use setTimeout to ensure DOM is updated before rendering charts
          setTimeout(() => {
            renderRadarChart(results)
            renderDoughnutChart(overallScore.value)
          }, 0)
        }
      } catch (err) {
        console.error("Error loading assessment data:", err)
      } finally {
        isLoading.value = false
      }
    }
    
    // Function to refresh data (for debugging)
    const refreshData = () => {
      loadData()
    }
    
    // Feedback for the overall score
    const scoreFeedback = computed(() => {
      const score = parseFloat(overallScore.value)
      
      if (score >= 9) return "Excellent! Your organization has very strong financial health practices across all pillars."
      if (score >= 7) return "Good. Your organization has solid financial health with some areas for improvement."
      if (score >= 5) return "Average. There are several important areas that need attention to improve your overall financial health."
      if (score >= 3) return "Below average. Your organization needs significant improvements in financial management."
      return "Critical. Immediate attention is needed to address fundamental financial health issues."
    })
    
    // Feedback for individual pillars
    const getPillarFeedback = (pillar, score) => {
      if (score >= 8) {
        return `Your organization demonstrates excellent practices in ${pillar.toLowerCase()}. Continue maintaining these high standards.`
      } else if (score >= 6) {
        return `Your organization has a strong foundation in ${pillar.toLowerCase()}, with some opportunities for refinement.`
      } else if (score >= 4) {
        return `Your organization has a decent foundation in ${pillar.toLowerCase()}, but there's significant room for improvement.`
      } else if (score >= 2) {
        return `Your organization needs to strengthen its approach to ${pillar.toLowerCase()}.`
      } else {
        return `Your organization requires significant improvement in ${pillar.toLowerCase()}. This should be a priority area.`
      }
    }
    
    // Recommended actions based on pillar scores
    const recommendedActions = computed(() => {
      if (!hasData.value) {
        return []
      }
      
      const actions = []
      
      // Get the two lowest scoring pillars
      const sortedPillars = [...pillarResults.value]
        .sort((a, b) => a.score - b.score)
        .slice(0, 2)
      
      sortedPillars.forEach((pillar) => {
        const action = getPillarAction(pillar.name, pillar.score)
        if (action) {
          actions.push(action)
        }
      })
      
      // Add a general action if we have fewer than 3 actions
      if (actions.length < 3) {
        actions.push({
          title: "Schedule a Financial Health Review",
          description: "Set up a quarterly review process to track progress on your financial health initiatives and make adjustments as needed."
        })
      }
      
      return actions
    })
    
    // Get recommended action for a specific pillar
    const getPillarAction = (pillar, score) => {
      // Return specific actions based on pillar and score
      const actions = {
        'Business Plan': {
          title: "Develop a Comprehensive Financial Business Plan",
          description: "Create or update your business plan with clear financial goals, forecasts, and funding strategies for the next 3 years."
        },
        'Break Even and Margin': {
          title: "Conduct Detailed Breakeven Analysis",
          description: "Review your product costs, pricing strategy, and overhead to determine precise breakeven points and optimize margins."
        },
        'Blueprint': {
          title: "Document Financial Procedures and Systems",
          description: "Create flowcharts and written procedures for all financial processes and evaluate your current financial management systems."
        },
        'Actual Results': {
          title: "Implement Regular Financial Reporting",
          description: "Set up weekly and monthly reporting templates that include KPIs, trend analysis, and budget comparisons."
        },
        'Bank/Cashflow': {
          title: "Establish Weekly Cashflow Monitoring",
          description: "Create a process for weekly updates of cashflow forecasts and reconciliation with actual bank balances."
        },
        'Compliance': {
          title: "Create a Compliance Calendar",
          description: "Develop a comprehensive calendar of all regulatory deadlines and assign responsibility for each compliance requirement."
        }
      }
      
      return actions[pillar]
    }
    
    const downloadPDF = async () => {
      alert("PDF download functionality would be implemented here. This would generate a detailed report based on your assessment results.")
      // In production, this would connect to a PDF generation API or service
    }
    
    const shareReport = () => {
      alert("Share functionality would be implemented here. This would allow you to share your report via email or other channels.")
      // In production, this would integrate with email or social sharing APIs
    }
    
    // Load data when component is mounted
    onMounted(() => {
      loadData()
    })
    
    return {
      // Chart refs
      radarChart,
      doughnutChart,
      
      // Data
      rawAnswers,
      rawQuestions,
      calculatedResults,
      pillarResults,
      overallScore,
      
      // UI state
      isLoading,
      showDebug,
      hasData,
      dataSource,
      
      // Computed
      scoreFeedback,
      recommendedActions,
      
      // Methods
      getPillarFeedback,
      downloadPDF,
      shareReport,
      refreshData
    }
  }
}
</script>