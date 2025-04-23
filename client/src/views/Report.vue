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
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import Chart from 'chart.js/auto'

export default {
  name: 'Report',
  setup() {
    const radarChart = ref(null)
    const doughnutChart = ref(null)
    const radarChartInstance = ref(null)
    const doughnutChartInstance = ref(null)
    
    // Calculate results from the assessment data
    const calculateResults = () => {
      const answers = JSON.parse(localStorage.getItem('assessmentAnswers')) || {}
      const questions = JSON.parse(localStorage.getItem('assessmentQuestions')) || []
      
      // Group by pillar
      const pillarTotals = {}
      const pillarCounts = {}
      const pillarQuestions = {}
      
      questions.forEach(q => {
        const rating = answers[q.id]
        if (rating) {
          if (!pillarTotals[q.pillar]) {
            pillarTotals[q.pillar] = 0
            pillarCounts[q.pillar] = 0
            pillarQuestions[q.pillar] = []
          }
          pillarTotals[q.pillar] += rating
          pillarCounts[q.pillar]++
          pillarQuestions[q.pillar].push({ question: q.copy, rating })
        }
      })
      
      // Calculate average scores by pillar
      const results = {}
      for (const pillar in pillarTotals) {
        results[pillar] = parseFloat((pillarTotals[pillar] / pillarCounts[pillar]).toFixed(1))
      }
      
      return { results, pillarQuestions }
    }
    
    // Render radar chart
    const renderRadarChart = (results) => {
      const labels = Object.keys(results)
      const scores = Object.values(results)
      
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
      if (doughnutChartInstance.value) {
        doughnutChartInstance.value.destroy()
      }
      
      const ctx = doughnutChart.value.getContext('2d')
      doughnutChartInstance.value = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Score', 'Remaining'],
          datasets: [{
            data: [score, 10 - score],
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
    
    // Computed properties
    const pillarResults = computed(() => {
      const { results, pillarQuestions } = calculateResults()
      
      return Object.keys(results).map(pillar => {
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
    })
    
    const overallScore = computed(() => {
      const { results } = calculateResults()
      const scores = Object.values(results)
      if (scores.length === 0) return 0
      
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length
      return average.toFixed(1)
    })
    
    const scoreFeedback = computed(() => {
      const score = parseFloat(overallScore.value)
      
      if (score >= 9) return "Excellent! Your organization has very strong financial health practices across all pillars."
      if (score >= 7) return "Good. Your organization has solid financial health with some areas for improvement."
      if (score >= 5) return "Average. There are several important areas that need attention to improve your overall financial health."
      if (score >= 3) return "Below average. Your organization needs significant improvements in financial management."
      return "Critical. Immediate attention is needed to address fundamental financial health issues."
    })
    
    const recommendedActions = computed(() => {
      const { results } = calculateResults()
      const actions = []
      
      // Get the two lowest scoring pillars
      const sortedPillars = Object.entries(results)
        .sort(([, scoreA], [, scoreB]) => scoreA - scoreB)
        .slice(0, 2)
      
      sortedPillars.forEach(([pillar, score]) => {
        const action = getPillarAction(pillar, score)
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
    
    // Methods
    const getPillarFeedback = (pillar, score) => {
      if (score >= 4) {
        return `Your organization demonstrates strong practices in ${pillar.toLowerCase()}. Continue maintaining these high standards.`
      } else if (score >= 3) {
        return `Your organization has good foundation in ${pillar.toLowerCase()}, but there's room for improvement.`
      } else if (score >= 2) {
        return `Your organization needs to strengthen its approach to ${pillar.toLowerCase()}.`
      } else {
        return `Your organization requires significant improvement in ${pillar.toLowerCase()}. This should be a priority area.`
      }
    }
    
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
    
    // Setup charts on component mount
    onMounted(() => {
      const { results } = calculateResults()
      renderRadarChart(results)
      renderDoughnutChart(parseFloat(overallScore.value))
    })
    
    return {
      radarChart,
      doughnutChart,
      pillarResults,
      overallScore,
      scoreFeedback,
      recommendedActions,
      getPillarFeedback,
      downloadPDF,
      shareReport
    }
  }
}
</script>