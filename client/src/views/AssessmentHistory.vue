<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-3xl mx-auto px-4">
      <h1 class="text-2xl font-bold text-blue-900 mb-6">Assessment History</h1>
      <div v-if="loading" class="flex justify-center items-center py-16">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
      <div v-else-if="assessments.length === 0" class="bg-white p-8 rounded-lg shadow text-center">
        <p class="text-gray-700">You have not completed any assessments yet.</p>
      </div>
      <div v-else class="space-y-4">
        <div v-for="assessment in assessments" :key="assessment.id" class="bg-white rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div class="text-lg font-semibold text-blue-700">Completed: {{ formatDate(assessment.completed_at) }}</div>
            <div class="text-gray-700">Overall Score: <span class="font-bold">{{ assessment.overallScore }}</span></div>
          </div>
          <router-link :to="`/report?id=${assessment.id}`" class="mt-4 md:mt-0 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center">View Report</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import supabase from '../supabaseClient'
import * as AssessmentService from '../services/assessmentService'

export default {
  name: 'AssessmentHistory',
  setup() {
    const loading = ref(true)
    const assessments = ref([])

    const formatDate = (dateStr) => {
      const d = new Date(dateStr)
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const fetchAssessments = async () => {
      loading.value = true
      const userId = await AssessmentService.getCurrentUserId()
      if (!userId) {
        assessments.value = []
        loading.value = false
        return
      }
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
      if (error) {
        assessments.value = []
      } else {
        assessments.value = (data || []).map(a => ({
          ...a,
          overallScore: a.answers ? calcOverallScore(a.answers) : 'N/A'
        }))
      }
      loading.value = false
    }

    const calcOverallScore = (answers) => {
      const values = Object.values(answers || {})
      if (!values.length) return 'N/A'
      const sum = values.reduce((acc, v) => acc + (typeof v === 'number' ? v : parseFloat(v)), 0)
      return (sum / values.length).toFixed(1)
    }

    onMounted(() => {
      fetchAssessments()
    })

    return {
      loading,
      assessments,
      formatDate
    }
  }
}
</script> 