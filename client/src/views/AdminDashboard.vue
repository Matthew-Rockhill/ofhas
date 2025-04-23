<template>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="max-w-5xl mx-auto bg-white p-6 rounded shadow">
        <h2 class="text-2xl font-bold mb-4">Admin Dashboard</h2>
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Manage Questions</h3>
          <table class="min-w-full border">
            <thead>
              <tr class="bg-gray-200">
                <th class="py-2 px-4 border">ID</th>
                <th class="py-2 px-4 border">Copy</th>
                <th class="py-2 px-4 border">Pillar</th>
                <th class="py-2 px-4 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="question in questions" :key="question.id">
                <td class="py-2 px-4 border">{{ question.id }}</td>
                <td class="py-2 px-4 border">{{ question.copy }}</td>
                <td class="py-2 px-4 border">{{ question.pillar }}</td>
                <td class="py-2 px-4 border">
                  <button @click="editQuestion(question)" class="bg-blue-500 text-white px-2 py-1 rounded">Edit</button>
                  <button @click="deleteQuestion(question.id)" class="bg-red-500 text-white px-2 py-1 rounded ml-2">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div>
          <h3 class="text-xl font-semibold mb-2">Add New Question</h3>
          <form @submit.prevent="addQuestion">
            <div class="mb-4">
              <label class="block mb-1">Question Copy</label>
              <input v-model="newQuestion.copy" type="text" class="w-full border rounded px-3 py-2" required />
            </div>
            <div class="mb-4">
              <label class="block mb-1">Pillar</label>
              <input v-model="newQuestion.pillar" type="text" class="w-full border rounded px-3 py-2" required />
            </div>
            <button type="submit" class="bg-green-500 text-white px-4 py-2 rounded">Add Question</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios'
  export default {
    name: 'AdminDashboard',
    data() {
      return {
        questions: [],
        newQuestion: {
          copy: '',
          pillar: ''
        }
      }
    },
    created() {
      this.fetchQuestions()
    },
    methods: {
      async fetchQuestions() {
        try {
          const res = await axios.get('/api/questions')
          this.questions = res.data.questions
        } catch (error) {
          console.error('Error fetching questions:', error)
        }
      },
      async addQuestion() {
        try {
          const res = await axios.post('/api/questions', this.newQuestion)
          this.questions.push(res.data.question)
          this.newQuestion.copy = ''
          this.newQuestion.pillar = ''
        } catch (error) {
          console.error('Error adding question:', error)
        }
      },
      async editQuestion(question) {
        const newCopy = prompt('Edit question copy:', question.copy)
        const newPillar = prompt('Edit pillar:', question.pillar)
        if (newCopy && newPillar) {
          try {
            const res = await axios.put(`/api/questions/${question.id}`, {
              copy: newCopy,
              pillar: newPillar
            })
            const index = this.questions.findIndex(q => q.id === question.id)
            if (index !== -1) {
              this.questions.splice(index, 1, res.data.question)
            }
          } catch (error) {
            console.error('Error updating question:', error)
          }
        }
      },
      async deleteQuestion(id) {
        if (confirm('Are you sure you want to delete this question?')) {
          try {
            await axios.delete(`/api/questions/${id}`)
            this.questions = this.questions.filter(q => q.id !== id)
          } catch (error) {
            console.error('Error deleting question:', error)
          }
        }
      }
    }
  }
  </script>
  