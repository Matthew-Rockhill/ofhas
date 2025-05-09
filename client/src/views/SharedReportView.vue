<template>
  <div class="bg-gradient-to-b from-blue-50 to-white">
    <div class="max-w-7xl mx-auto px-4 py-12">
      <!-- Loading indicator -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p class="text-gray-600">Loading shared report...</p>
      </div>
      
      <!-- Error state -->
      <div v-else-if="error" class="bg-white shadow-md rounded-lg p-8 text-center">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Unable to Load Report</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <router-link to="/" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Go to Home
        </router-link>
      </div>
      
      <!-- Report Content -->
      <template v-else-if="reportData">
        <!-- Header -->
        <div class="text-center mb-10">
          <span class="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-4">
            Shared Report
          </span>
          <h1 class="text-3xl md:text-4xl font-bold text-blue-900 mb-4">Financial Health Assessment Results</h1>
          <p class="text-lg text-gray-700 max-w-3xl mx-auto">
            This is a shared financial health assessment report based on the 6 pillars framework.
          </p>
        </div>
        
        <!-- Summary Section -->
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-10">
          <div class="bg-blue-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white">Executive Summary</h2>
          </div>
          
          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Radar Chart -->
              <div class="bg-gray-50 rounded-lg p-6">
                <h3 class="text-lg font-medium text-gray-900 mb-4">Financial Health Profile</h3>
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
                      <span class="text-4xl font-bold text-blue-600">{{ reportData.overallScore }}</span>
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
              <div v-for="(pillar, index) in reportData.pillarResults" :key="index" 
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
              Based on the assessment, here are the key actions recommended to improve financial health:
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div v-for="(action, index) in reportData.recommendedActions" :key="index"
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
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-1">Want to assess your own organization?</h3>
            <p class="text-gray-700">Take a free financial health assessment to get personalized insights.</p>
          </div>
          
          <div class="mt-4 md:mt-0">
            <router-link to="/register" class="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Start Your Assessment
            </router-link>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="mt-8 text-center text-gray-500 text-sm">
          <p>This report was shared via OFHAS - Organizational Financial Health Assessment System.</p>
          <p>Report data valid until {{ expiryDate }}</p>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import Chart from 'chart.js/auto'
import supabase from '../supabaseClient'

export default {
  name: 'SharedReportView',
  setup() {
    const route = useRoute()
    
    // Chart references
    const radarChart = ref(null)
    const doughnutChart = ref(null)
    let radarChartInstance = null
    let doughnutChartInstance = null
    
    // State
    const loading = ref(true)
    const error = ref(null)
    const reportData = ref(null)
    const expiryDate = ref('')
    
    // Computed properties
    const scoreFeedback = computed(() => {
      if (!reportData.value) return ''
      
      const score = parseFloat(reportData.value.overallScore)
      
      if (score >= 8) return "Excellent! This organization has very strong financial health practices across all pillars."
      if (score >= 6) return "Good. This organization has solid financial health with some areas for improvement."
      if (score >= 4) return "Average. There are several important areas that need attention to improve the overall financial health."
      if (score >= 2) return "Below average. This organization needs significant improvements in financial management."
      return "Critical. Immediate attention is needed to address fundamental financial health issues."
    })
    
    // Get feedback for a specific pillar
    const getPillarFeedback = (pillar, score) => {
      if (score >= 8) {
        return `This organization demonstrates excellent practices in ${pillar.toLowerCase()}.`
      } else if (score >= 6) {
        return `This organization has a strong foundation in ${pillar.toLowerCase()}, with some opportunities for refinement.`
      } else if (score >= 4) {
        return `This organization has a decent foundation in ${pillar.toLowerCase()}, but there's significant room for improvement.`
      } else if (score >= 2) {
        return `This organization needs to strengthen its approach to ${pillar.toLowerCase()}.`
      } else {
        return `This organization requires significant improvement in ${pillar.toLowerCase()}. This should be a priority area.`
      }
    }
    
    // Render radar chart
    const renderRadarChart = (data) => {
      if (!radarChart.value) return
      
      const pillarResults = data.pillarResults || []
      const labels = pillarResults.map(p => p.name)
      const scores = pillarResults.map(p => p.score)
      
      if (labels.length === 0) {
        console.warn('No data available for radar chart')
        return
      }
      
      if (radarChartInstance) {
        radarChartInstance.destroy()
      }
      
      const ctx = radarChart.value.getContext('2d')
      radarChartInstance = new Chart(ctx, {
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
          }
        }
      })
    }
    
    // Render doughnut chart
    const renderDoughnutChart = (score) => {
      if (!doughnutChart.value) return
      
      const numericScore = parseFloat(score)
      
      if (isNaN(numericScore)) {
        console.warn('Invalid score for doughnut chart:', score)
        return
      }
      
      if (doughnutChartInstance) {
        doughnutChartInstance.destroy()
      }
      
      const ctx = doughnutChart.value.getContext('2d')
      doughnutChartInstance = new Chart(ctx, {
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
    
    // Load shared report data
    const loadSharedReport = async () => {
      const token = route.params.token
      
      if (!token) {
        error.value = 'Invalid or missing share token.'
        loading.value = false
        return
      }
      
      try {
        // Fetch report data from Supabase
        const { data, error: fetchError } = await supabase
          .from('shared_links')
          .select('*')
          .eq('token', token)
          .single()
        
        if (fetchError) {
          throw fetchError
        }
        
        if (!data) {
          throw new Error('Report not found or has expired.')
        }
        
        // Check if report has expired
        const expiryDate = new Date(data.expires_at)
        if (expiryDate < new Date()) {
          throw new Error('This shared report has expired.')
        }
        
        // Format expiry date
        expiryDate.value = expiryDate.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        
        // Set report data
        reportData.value = data.assessment_data
        
        // Render charts after a short delay to ensure DOM is updated
        setTimeout(() => {
          renderRadarChart(reportData.value)
          renderDoughnutChart(reportData.value.overallScore)
        }, 100)
      } catch (err) {
        console.error('Error loading shared report:', err)
        error.value = err.message || 'Failed to load the shared report. It may have expired or been removed.'
      } finally {
        loading.value = false
      }
    }
    
    // Load data when component is mounted
    onMounted(() => {
      loadSharedReport()
    })
    
    return {
      loading,
      error,
      reportData,
      expiryDate,
      scoreFeedback,
      radarChart,
      doughnutChart,
      getPillarFeedback
    }
  }
}
</script>