const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const PDFDocument = require('pdfkit')
const { createClient } = require('@supabase/supabase-js')

require('dotenv').config()

// Load environment variables (ensure you create a .env file in api/ with your Supabase keys)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const app = express()
app.use(cors())
app.use(bodyParser.json())

// For demo purposes, questions are stored in memory.
// In production, store these in Supabase or another database.
let questions = [
  { id: 1, copy: 'How well do you manage cash flow?', pillar: 'Cashflow' },
  { id: 2, copy: 'How accurate are your financial forecasts?', pillar: 'Forecasting' },
  { id: 3, copy: 'Do you have effective internal controls?', pillar: 'Internal Controls' },
  { id: 4, copy: 'How robust is your business strategy?', pillar: 'Strategy' },
  { id: 5, copy: 'Are you effectively managing debts?', pillar: 'Debt Management' }
]

// GET /api/questions – Retrieve all questions
app.get('/api/questions', (req, res) => {
  res.json({ questions })
})

// POST /api/questions – Add a new question
app.post('/api/questions', (req, res) => {
  const { copy, pillar } = req.body
  const newQuestion = {
    id: questions.length ? questions[questions.length - 1].id + 1 : 1,
    copy,
    pillar
  }
  questions.push(newQuestion)
  res.json({ question: newQuestion })
})

// PUT /api/questions/:id – Update an existing question
app.put('/api/questions/:id', (req, res) => {
  const id = parseInt(req.params.id)
  const { copy, pillar } = req.body
  const question = questions.find(q => q.id === id)
  if (question) {
    question.copy = copy
    question.pillar = pillar
    res.json({ question })
  } else {
    res.status(404).json({ error: 'Question not found' })
  }
})

// DELETE /api/questions/:id – Delete a question
app.delete('/api/questions/:id', (req, res) => {
  const id = parseInt(req.params.id)
  questions = questions.filter(q => q.id !== id)
  res.json({ message: 'Question deleted' })
})

// POST /api/assessment – Save assessment results (example using Supabase)
app.post('/api/assessment', async (req, res) => {
  const { userId, answers } = req.body
  const { data, error } = await supabase
    .from('assessments')
    .insert([{ user_id: userId, answers }])
  if (error) {
    res.status(500).json({ error: error.message })
  } else {
    res.json({ data })
  }
})

// GET /api/pdf – Generate a PDF report
app.get('/api/pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=assessment_report.pdf')
  
  const doc = new PDFDocument({ size: 'A4', margin: 50 })
  doc.pipe(res)
  
  // Use modernized colors inspired by your provided PDF (adjust as needed)
  const primaryColor = '#229ace'
  const secondaryColor = '#1a1a1a'
  
  doc.fontSize(20).fillColor(primaryColor).text('Assessment Report', { align: 'center' })
  doc.moveDown()
  
  // For demo purposes, we use sample results.
  // In production, fetch the actual assessment data.
  const sampleResults = {
    'Cashflow': 4.2,
    'Forecasting': 3.8,
    'Internal Controls': 4.0,
    'Strategy': 3.5,
    'Debt Management': 4.1
  }
  
  for (const [pillar, score] of Object.entries(sampleResults)) {
    doc.fontSize(14).fillColor(secondaryColor).text(`${pillar}: ${score}`)
  }
  
  doc.end()
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

module.exports = app
