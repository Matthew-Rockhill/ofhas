const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const PDFDocument = require('pdfkit')
const { createClient } = require('@supabase/supabase-js')
const serverless = require('serverless-http')
const crypto = require('crypto') // Add this for token generation
const nodemailer = require('nodemailer') // Add this for email sending
const path = require('path')

require('dotenv').config()

// Load environment variables (ensure you create a .env file in api/ with your Supabase keys)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

// Validate required environment variables
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_KEY')
  process.exit(1)
}

// Initialize Supabase client with service role for admin access
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const app = express()

// Enhanced security middleware
app.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  next()
})

// Enable CORS with more specific configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://ofhas.vercel.app', 'https://www.ofhas.com'] // Update with your production domains
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Parse JSON bodies with size limit
app.use(bodyParser.json({ limit: '1mb' }))

// Simple request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`)
  next()
})

// Middleware to verify Supabase JWT
const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Missing or invalid token format.' })
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    // Verify the JWT token with Supabase
    const { data, error } = await supabase.auth.getUser(token)
    
    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized. Invalid token.' })
    }
    
    // Add user info to the request object
    req.user = data.user
    next()
  } catch (error) {
    console.error('Error verifying auth token:', error)
    return res.status(500).json({ error: 'Authentication server error' })
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API Version endpoint
app.get('/api/version', (req, res) => {
  res.json({ version: '1.0.0', environment: process.env.NODE_ENV || 'development' })
})

// ==============================================
// Assessment Questions API Routes
// ==============================================

// GET /api/questions – Retrieve all questions
app.get('/api/questions', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .order('id', { ascending: true })
    
    if (error) {
      throw error
    }
    
    res.json({ questions: data })
  } catch (error) {
    console.error('Error fetching questions:', error)
    res.status(500).json({ error: 'Failed to fetch questions', details: error.message })
  }
})

// POST /api/questions – Add a new question (admin only)
app.post('/api/questions', verifyAuth, async (req, res) => {
  try {
    // Check if user has admin role
    const isAdmin = req.user.app_metadata?.role === 'admin'
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' })
    }
    
    const { copy, pillar } = req.body
    
    if (!copy || !pillar) {
      return res.status(400).json({ error: 'Missing required fields: copy and pillar' })
    }
    
    const { data, error } = await supabase
      .from('questions')
      .insert([{ copy, pillar }])
      .select()
    
    if (error) {
      throw error
    }
    
    res.status(201).json({ question: data[0] })
  } catch (error) {
    console.error('Error adding question:', error)
    res.status(500).json({ error: 'Failed to add question', details: error.message })
  }
})

// PUT /api/questions/:id – Update an existing question (admin only)
app.put('/api/questions/:id', verifyAuth, async (req, res) => {
  try {
    // Check if user has admin role
    const isAdmin = req.user.app_metadata?.role === 'admin'
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' })
    }
    
    const id = parseInt(req.params.id)
    const { copy, pillar } = req.body
    
    if (!copy || !pillar) {
      return res.status(400).json({ error: 'Missing required fields: copy and pillar' })
    }
    
    const { data, error } = await supabase
      .from('questions')
      .update({ copy, pillar })
      .eq('id', id)
      .select()
    
    if (error) {
      throw error
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Question not found' })
    }
    
    res.json({ question: data[0] })
  } catch (error) {
    console.error('Error updating question:', error)
    res.status(500).json({ error: 'Failed to update question', details: error.message })
  }
})

// DELETE /api/questions/:id – Delete a question (admin only)
app.delete('/api/questions/:id', verifyAuth, async (req, res) => {
  try {
    // Check if user has admin role
    const isAdmin = req.user.app_metadata?.role === 'admin'
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden. Admin access required.' })
    }
    
    const id = parseInt(req.params.id)
    
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) {
      throw error
    }
    
    res.json({ message: 'Question deleted' })
  } catch (error) {
    console.error('Error deleting question:', error)
    res.status(500).json({ error: 'Failed to delete question', details: error.message })
  }
})

// ==============================================
// Assessment Results API Routes
// ==============================================

// POST /api/assessment – Save assessment results
app.post('/api/assessment', verifyAuth, async (req, res) => {
  try {
    const { answers, questions } = req.body
    
    if (!answers || !questions) {
      return res.status(400).json({ error: 'Missing required fields: answers and questions' })
    }
    
    const userId = req.user.id
    
    const { data, error } = await supabase
      .from('assessments')
      .insert([{ 
        user_id: userId, 
        answers, 
        questions,
        completed_at: new Date().toISOString()
      }])
      .select()
    
    if (error) {
      throw error
    }
    
    // Clean up any progress data now that the assessment is complete
    await supabase
      .from('assessment_progress')
      .delete()
      .eq('user_id', userId)
    
    res.status(201).json({ assessment: data[0] })
  } catch (error) {
    console.error('Error saving assessment:', error)
    res.status(500).json({ error: 'Failed to save assessment', details: error.message })
  }
})

// GET /api/assessment/:userId – Get latest assessment for a user
app.get('/api/assessment/:userId', verifyAuth, async (req, res) => {
  try {
    const requestedUserId = req.params.userId
    const currentUserId = req.user.id
    
    // Only allow users to access their own assessments unless they're an admin
    const isAdmin = req.user.app_metadata?.role === 'admin'
    
    if (requestedUserId !== currentUserId && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden. You can only access your own assessments.' })
    }
    
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', requestedUserId)
      .order('completed_at', { ascending: false })
      .limit(1)
    
    if (error) {
      throw error
    }
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'No assessments found for this user' })
    }
    
    res.json({ assessment: data[0] })
  } catch (error) {
    console.error('Error fetching assessment:', error)
    res.status(500).json({ error: 'Failed to fetch assessment', details: error.message })
  }
})

// ==============================================
// Assessment Progress API Routes
// ==============================================

// POST /api/progress – Save assessment progress
app.post('/api/progress', verifyAuth, async (req, res) => {
  try {
    const { currentIndex, answers, questions } = req.body
    
    if (currentIndex === undefined || !answers || !questions) {
      return res.status(400).json({ error: 'Missing required fields: currentIndex, answers, and questions' })
    }
    
    const userId = req.user.id
    
    const { data, error } = await supabase
      .from('assessment_progress')
      .upsert({ 
        user_id: userId,
        progress: {
          currentIndex,
          answers,
          questions,
          updated_at: new Date().toISOString()
        }
      })
      .select()
    
    if (error) {
      throw error
    }
    
    res.json({ success: true, progress: data[0] })
  } catch (error) {
    console.error('Error saving progress:', error)
    res.status(500).json({ error: 'Failed to save progress', details: error.message })
  }
})

// GET /api/progress – Get assessment progress for current user
app.get('/api/progress', verifyAuth, async (req, res) => {
  try {
    const userId = req.user.id
    
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('progress')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      // If no progress found, that's ok
      if (error.code === 'PGRST116') {
        return res.json({ progress: null })
      }
      throw error
    }
    
    res.json({ progress: data.progress })
  } catch (error) {
    console.error('Error fetching progress:', error)
    res.status(500).json({ error: 'Failed to fetch progress', details: error.message })
  }
})

// ==============================================
// PDF Report Generation
// ==============================================

// Existing endpoint to generate PDF from assessment ID
app.get('/api/pdf/:assessmentId', verifyAuth, async (req, res) => {
  try {
    const assessmentId = req.params.assessmentId
    
    // Fetch the assessment
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single()
    
    if (assessmentError) {
      throw assessmentError
    }
    
    if (!assessment) {
      return res.status(404).json({ error: 'Assessment not found' })
    }
    
    // Check authorization - only owner or admin can access
    const isOwner = assessment.user_id === req.user.id
    const isAdmin = req.user.app_metadata?.role === 'admin'
    
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ error: 'Forbidden. You can only access your own reports.' })
    }
    
    // Fetch user details
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', assessment.user_id)
      .single()
    
    if (userError && userError.code !== 'PGRST116') {
      throw userError
    }
    
    // Generate PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="assessment_report_${assessmentId}.pdf"`)
    
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    doc.pipe(res)
    
    // Use modernized colors 
    const primaryColor = '#2563eb' // blue-600
    const secondaryColor = '#1e293b' // slate-800
    const accentColor = '#475569' // slate-600
    
    // Add logo/header
    const logoPath = path.join(__dirname, 'ofhas_logo.png')
    doc.image(logoPath, { fit: [120, 60], align: 'center', valign: 'top' })
    doc.moveDown()
    
    doc.fontSize(24).fillColor(primaryColor).text('Financial Health Assessment Report', { align: 'center' })
    doc.moveDown()
    
    // Add date and user info
    doc.fontSize(12).fillColor(accentColor)
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' })
    
    if (userData) {
      doc.moveDown()
        .text(`Organization: ${userData.organization_name || 'Not specified'}`, { align: 'left' })
        .text(`Prepared for: ${userData.first_name} ${userData.last_name}`, { align: 'left' })
    }
    
    doc.moveDown(2)
    
    // Summary section
    doc.fontSize(16).fillColor(primaryColor).text('Executive Summary', { underline: true })
    doc.moveDown()
    
    // Calculate overall score
    const answers = assessment.answers || {}
    const answerKeys = Object.keys(answers)
    const answerValues = Object.values(answers)
    const avgScore = answerValues.length > 0 
      ? (answerValues.reduce((sum, score) => sum + score, 0) / answerValues.length).toFixed(1) 
      : 'N/A'
    
    doc.fontSize(12).fillColor(secondaryColor)
      .text(`Overall Score: ${avgScore}/10`, { continued: true })
      .fillColor(accentColor)
      .text(` (${answerKeys.length} questions answered)`, { align: 'left' })
    
    doc.moveDown(2)
    
    // Pillar breakdown 
    doc.fontSize(16).fillColor(primaryColor).text('Pillar Breakdown', { underline: true })
    doc.moveDown()
    
    // Group questions and scores by pillar
    const questions = assessment.questions || []
    const pillarGroups = {}
    
    questions.forEach(question => {
      if (answers[question.id]) {
        if (!pillarGroups[question.pillar]) {
          pillarGroups[question.pillar] = {
            scores: [],
            questions: []
          }
        }
        
        pillarGroups[question.pillar].scores.push(answers[question.id])
        pillarGroups[question.pillar].questions.push({
          copy: question.copy,
          score: answers[question.id]
        })
      }
    })
    
    // Write scores for each pillar
    Object.entries(pillarGroups).forEach(([pillar, data]) => {
      const average = (data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length).toFixed(1)
      
      doc.fontSize(14).fillColor(secondaryColor).text(pillar, { underline: true })
      doc.fontSize(12).fillColor(accentColor).text(`Average Score: ${average}/10`)
      doc.moveDown(0.5)
      
      // Top strengths and areas for improvement
      const sortedQuestions = [...data.questions].sort((a, b) => b.score - a.score)
      const strengths = sortedQuestions.slice(0, 2)
      const improvements = sortedQuestions.slice(-2).reverse()
      
      if (strengths.length > 0) {
        doc.fontSize(10).fillColor(secondaryColor).text('Strengths:')
        strengths.forEach(q => {
          doc.fontSize(9).fillColor(accentColor)
            .text(`• ${q.copy} (Score: ${q.score}/10)`)
        })
        doc.moveDown(0.5)
      }
      
      if (improvements.length > 0) {
        doc.fontSize(10).fillColor(secondaryColor).text('Areas for Improvement:')
        improvements.forEach(q => {
          doc.fontSize(9).fillColor(accentColor)
            .text(`• ${q.copy} (Score: ${q.score}/10)`)
        })
      }
      
      doc.moveDown()
    })
    
    doc.moveDown(2)
    
    // Recommendations section
    doc.fontSize(16).fillColor(primaryColor).text('Recommendations', { underline: true })
    doc.moveDown()
    
    // Find the lowest scoring pillars
    const pillarAverages = Object.entries(pillarGroups).map(([pillar, data]) => {
      const average = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      return { pillar, average }
    }).sort((a, b) => a.average - b.average)
    
    // Get the 2 lowest scoring pillars
    const focusPillars = pillarAverages.slice(0, 2)
    
    // Add recommendations based on pillar scores
    focusPillars.forEach(({ pillar, average }) => {
      doc.fontSize(14).fillColor(secondaryColor).text(`Improving ${pillar}`, { underline: true })
      
      if (average < 3) {
        doc.fontSize(10).fillColor(accentColor)
          .text(`Your organization scored quite low in this area (${average.toFixed(1)}/10). This should be a priority area for immediate improvement.`)
      } else if (average < 7) {
        doc.fontSize(10).fillColor(accentColor)
          .text(`Your organization showed moderate performance in this area (${average.toFixed(1)}/10). Focus on strategic improvements.`)
      } else {
        doc.fontSize(10).fillColor(accentColor)
          .text(`Your organization is doing well in this area (${average.toFixed(1)}/10). Continue to maintain and refine these processes.`)
      }
      
      doc.moveDown(0.5)
      
      // Add pillar-specific advice
      const advice = getPillarAdvice(pillar)
      doc.fontSize(10).fillColor(accentColor).text(advice)
      
      doc.moveDown()
    })
    
    // Footer
    const pageCount = doc.bufferedPageRange().count
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
      
      // Add page number
      doc.fontSize(8).fillColor(accentColor)
        .text(
          `Page ${i + 1} of ${pageCount}`, 
          50, 
          doc.page.height - 50, 
          { align: 'center' }
        )
        
      // Add footer
      doc.fontSize(8).fillColor(accentColor)
        .text(
          'Organizational Financial Health Assessment System (OFHAS)',
          50,
          doc.page.height - 30,
          { align: 'center' }
        )
    }
    
    doc.end()
  } catch (error) {
    console.error('Error generating PDF report:', error)
    res.status(500).json({ error: 'Failed to generate PDF report', details: error.message })
  }
})

// NEW ENDPOINT: Generate a PDF report from assessment data
app.post('/api/pdf', verifyAuth, async (req, res) => {
  try {
    const { pillarResults, overallScore, recommendedActions } = req.body
    
    // Validate required data
    if (!pillarResults || !overallScore) {
      return res.status(400).json({ 
        error: 'Missing required fields: pillarResults and overallScore are required' 
      })
    }
    
    // Generate PDF
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="financial_health_report.pdf"')
    
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    doc.pipe(res)
    
    // Use modernized colors 
    const primaryColor = '#2563eb' // blue-600
    const secondaryColor = '#1e293b' // slate-800
    const accentColor = '#475569' // slate-600
    
    // Add logo/header
    const logoPath = path.join(__dirname, 'ofhas_logo.png')
    doc.image(logoPath, { fit: [120, 60], align: 'center', valign: 'top' })
    doc.moveDown()
    
    doc.fontSize(24).fillColor(primaryColor).text('Financial Health Assessment Report', { align: 'center' })
    doc.moveDown()
    
    // Add date info
    doc.fontSize(12).fillColor(accentColor)
      .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' })
    
    // Fetch user profile information if available
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, organization_name')
        .eq('id', req.user.id)
        .single()
      
      if (profileData) {
        doc.moveDown()
          .text(`Organization: ${profileData.organization_name || 'Not specified'}`, { align: 'left' })
          .text(`Prepared for: ${profileData.first_name} ${profileData.last_name}`, { align: 'left' })
      }
    } catch (profileError) {
      console.error('Error fetching profile for PDF:', profileError)
      // Continue without profile info if not available
    }
    
    doc.moveDown(2)
    
    // Overall Score Section
    doc.fontSize(16).fillColor(primaryColor).text('Executive Summary', { underline: true })
    doc.moveDown()
    
    doc.fontSize(12).fillColor(secondaryColor)
      .text(`Overall Score: ${overallScore}/10`, { align: 'left' })
    
    // Add score feedback
    let scoreFeedback = ''
    const score = parseFloat(overallScore)
    
    if (score >= 8) {
      scoreFeedback = "Excellent! Your organization has very strong financial health practices across all pillars."
    } else if (score >= 6) {
      scoreFeedback = "Good. Your organization has solid financial health with some areas for improvement."
    } else if (score >= 4) {
      scoreFeedback = "Average. There are several important areas that need attention to improve your overall financial health."
    } else if (score >= 2) {
      scoreFeedback = "Below average. Your organization needs significant improvements in financial management."
    } else {
      scoreFeedback = "Critical. Immediate attention is needed to address fundamental financial health issues."
    }
    
    doc.fontSize(12).fillColor(accentColor)
      .text(scoreFeedback, { align: 'left' })
    
    doc.moveDown(2)
    
    // Pillar breakdown 
    doc.fontSize(16).fillColor(primaryColor).text('Pillar Breakdown', { underline: true })
    doc.moveDown()
    
    // Write scores for each pillar
    pillarResults.forEach((pillar) => {
      doc.fontSize(14).fillColor(secondaryColor).text(pillar.name, { underline: true })
      doc.fontSize(12).fillColor(accentColor).text(`Average Score: ${pillar.score}/10`)
      doc.moveDown(0.5)
      
      // Add pillar-specific feedback
      let pillarFeedback = ''
      if (pillar.score >= 8) {
        pillarFeedback = `Your organization demonstrates excellent practices in ${pillar.name.toLowerCase()}.`
      } else if (pillar.score >= 6) {
        pillarFeedback = `Your organization has a strong foundation in ${pillar.name.toLowerCase()}, with some opportunities for refinement.`
      } else if (pillar.score >= 4) {
        pillarFeedback = `Your organization has a decent foundation in ${pillar.name.toLowerCase()}, but there's significant room for improvement.`
      } else if (pillar.score >= 2) {
        pillarFeedback = `Your organization needs to strengthen its approach to ${pillar.name.toLowerCase()}.`
      } else {
        pillarFeedback = `Your organization requires significant improvement in ${pillar.name.toLowerCase()}. This should be a priority area.`
      }
      
      doc.fontSize(12).fillColor(accentColor).text(pillarFeedback)
      doc.moveDown(0.5)
      
      // Areas to focus on
      if (pillar.focusAreas && pillar.focusAreas.length > 0) {
        doc.fontSize(10).fillColor(secondaryColor).text('Areas to Focus On:')
        pillar.focusAreas.forEach(area => {
          doc.fontSize(9).fillColor(accentColor)
            .text(`• ${area}`)
        })
      }
      
      doc.moveDown()
    })
    
    doc.moveDown(2)
    
    // Recommendations section
    doc.fontSize(16).fillColor(primaryColor).text('Recommended Actions', { underline: true })
    doc.moveDown()
    
    // Add recommendations
    if (recommendedActions && recommendedActions.length > 0) {
      recommendedActions.forEach((action, index) => {
        doc.fontSize(14).fillColor(secondaryColor).text(`${index + 1}. ${action.title}`, { underline: false })
        doc.fontSize(10).fillColor(accentColor).text(action.description)
        doc.moveDown()
      })
    }
    
    // Footer
    const pageCount = doc.bufferedPageRange().count
    for (let i = 0; i < pageCount; i++) {
      doc.switchToPage(i)
      
      // Add page number
      doc.fontSize(8).fillColor(accentColor)
        .text(
          `Page ${i + 1} of ${pageCount}`, 
          50, 
          doc.page.height - 50, 
          { align: 'center' }
        )
        
      // Add footer
      doc.fontSize(8).fillColor(accentColor)
        .text(
          'Organizational Financial Health Assessment System (OFHAS)',
          50,
          doc.page.height - 30,
          { align: 'center' }
        )
    }
    
    doc.end()
  } catch (error) {
    console.error('Error generating PDF from data:', error)
    res.status(500).json({ error: 'Failed to generate PDF report', details: error.message })
  }
})

// ==============================================
// Report Sharing Features
// ==============================================

// POST /api/share/email - Share report via email
app.post('/api/share/email', verifyAuth, async (req, res) => {
  try {
    const { assessmentData, recipientEmail, senderName, message, includePdf } = req.body
    
    // Validate inputs
    if (!assessmentData || !recipientEmail) {
      return res.status(400).json({ error: 'Missing required data: assessmentData or recipientEmail' })
    }
    
    // Create email transporter
    // For production, you'd use a real SMTP server
    // For development/testing, you can use services like Ethereal (https://ethereal.email/)
    // or configure your own SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASSWORD || 'password'
      }
    })
    
    // Get user profile data for the sender
    const user = req.user
    const { data: profileData } = await supabase
      .from('profiles')
      .select('first_name, last_name, organization_name')
      .eq('id', user.id)
      .single()
    
    const displayName = senderName || 
      (profileData ? `${profileData.first_name} ${profileData.last_name}` : 'A colleague')
    
    const organization = profileData?.organization_name || 'their organization'
    
    // Prepare email content
    const emailContent = `
      <h2>Financial Health Assessment Results</h2>
      <p>${displayName} has shared the results of their financial health assessment with you.</p>
      
      ${message ? `<p>Message from ${displayName}:</p><blockquote>${message}</blockquote>` : ''}
      
      <h3>Summary</h3>
      <p>Overall Score: <strong>${assessmentData.overallScore}/10</strong></p>
      
      <h3>Pillar Scores</h3>
      <ul>
        ${assessmentData.pillarResults.map(pillar => `
          <li><strong>${pillar.name}:</strong> ${pillar.score}/10</li>
        `).join('')}
      </ul>
      
      <p>For a complete breakdown of the results, ${includePdf ? 'see the attached PDF report.' : 
        'ask the sender to provide you with the detailed report.'}</p>
      
      <hr>
      <p>This email was sent from the Organizational Financial Health Assessment System (OFHAS).</p>
    `
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_FROM || '"OFHAS" <noreply@ofhas.com>',
      to: recipientEmail,
      subject: `${displayName} has shared a Financial Health Assessment with you`,
      html: emailContent
    }
    
    // If includePdf is true, generate and attach the PDF
    if (includePdf) {
      // Create a PDF in memory
      const pdfBuffer = await generatePdfBuffer(assessmentData)
      
      // Attach the PDF
      mailOptions.attachments = [
        {
          filename: 'financial-health-report.pdf',
          content: pdfBuffer
        }
      ]
    }
    
    // Send the email
    const info = await transporter.sendMail(mailOptions)
    
    // Store sharing record in database
    await supabase
      .from('shared_reports')
      .insert({
        user_id: user.id,
        recipient_email: recipientEmail,
        shared_at: new Date().toISOString(),
        included_pdf: includePdf
      })
    
    res.json({ 
      success: true, 
      message: 'Report shared successfully',
      messageId: info.messageId
    })
  } catch (error) {
    console.error('Error sharing report via email:', error)
    res.status(500).json({ error: 'Failed to share report', details: error.message })
  }
})

// POST /api/share/link - Generate shareable link
app.post('/api/share/link', verifyAuth, async (req, res) => {
  try {
    const { assessmentData } = req.body
    const user = req.user
    
    // Generate a unique token for this share
    const shareToken = crypto.randomBytes(32).toString('hex')
    
    // Store the assessment data with the token
    const { error } = await supabase
      .from('shared_links')
      .insert({
        token: shareToken,
        user_id: user.id,
        assessment_data: assessmentData,
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)).toISOString() // 30 days expiry
      })
    
    if (error) {
      throw error
    }
    
    // Generate shareable URL
    const baseUrl = process.env.NODE_ENV === 'production'
      ? (process.env.PUBLIC_URL || 'https://ofhas.vercel.app')
      : 'http://localhost:5173'
    
    const shareUrl = `${baseUrl}/shared-report/${shareToken}`
    
    res.json({
      success: true,
      shareUrl,
      expiresIn: '30 days'
    })
  } catch (error) {
    console.error('Error generating shareable link:', error)
    res.status(500).json({ error: 'Failed to generate shareable link', details: error.message })
  }
})

// GET /api/shared/:token - Retrieve shared report data (public endpoint, no auth required)
app.get('/api/shared/:token', async (req, res) => {
  try {
    const token = req.params.token
    
    // Fetch the shared report data
    const { data, error } = await supabase
      .from('shared_links')
      .select('*')
      .eq('token', token)
      .single()
    
    if (error) {
      throw error
    }
    
    if (!data) {
      return res.status(404).json({ error: 'Shared report not found or has expired.' })
    }
    
    // Check if report has expired
    const expiryDate = new Date(data.expires_at)
    if (expiryDate < new Date()) {
      return res.status(410).json({ error: 'This shared report has expired.' })
    }
    
    // Return the assessment data
    res.json({
      assessment: data.assessment_data,
      expiresAt: data.expires_at
    })
  } catch (error) {
    console.error('Error retrieving shared report:', error)
    res.status(500).json({ error: 'Failed to retrieve shared report', details: error.message })
  }
})

// Helper function for pillar-specific advice
function getPillarAdvice(pillar) {
  const advice = {
    'Business Plan': 'Focus on creating clear strategic plans with detailed financial forecasts. Define KPIs for measuring progress and regularly review performance against your plan.',
    'Break Even and Margin': 'Review your pricing strategy and cost structure. Track direct and indirect costs carefully and calculate accurate break-even points for all major products/services.',
    'Blueprint': 'Document all financial processes and implement robust systems for managing financial data. Create clear flowcharts for approval processes and separation of duties.',
    'Actual Results': 'Improve your reporting frequency and accuracy. Implement dashboards with key financial metrics and ensure timely and accurate financial statements.',
    'Bank/Cashflow': 'Establish weekly cashflow monitoring. Implement systems to predict and manage working capital needs and ensure timely collections.',
    'Compliance': 'Create a compliance calendar with all regulatory deadlines. Assign responsibility for each compliance requirement and establish review processes.'
  }
  
  return advice[pillar] || 'Review your processes and systems in this area. Look for opportunities to standardize, document, and improve.'
}

// Helper function to generate PDF buffer
async function generatePdfBuffer(assessmentData) {
  return new Promise((resolve, reject) => {
    try {
      // Create a new PDF document
      const doc = new PDFDocument({ size: 'A4', margin: 50 })
      
      // Buffer to collect PDF data
      const buffers = []
      doc.on('data', buffer => buffers.push(buffer))
      doc.on('end', () => resolve(Buffer.concat(buffers)))
      
      // Use modernized colors 
      const primaryColor = '#2563eb' // blue-600
      const secondaryColor = '#1e293b' // slate-800
      const accentColor = '#475569' // slate-600
      
      // Add logo/header
      const logoPath = path.join(__dirname, 'ofhas_logo.png')
      doc.image(logoPath, { fit: [120, 60], align: 'center', valign: 'top' })
      doc.moveDown()
      
      doc.fontSize(24).fillColor(primaryColor).text('Financial Health Assessment Report', { align: 'center' })
      doc.moveDown()
      
      // Add date
      doc.fontSize(12).fillColor(accentColor)
        .text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' })
      
      doc.moveDown(2)
      
      // Overall Score Section
      doc.fontSize(16).fillColor(primaryColor).text('Executive Summary', { underline: true })
      doc.moveDown()
      
      doc.fontSize(12).fillColor(secondaryColor)
        .text(`Overall Score: ${assessmentData.overallScore}/10`, { align: 'left' })
      
      // Add score feedback
      let scoreFeedback = ''
      const score = parseFloat(assessmentData.overallScore)
      
      if (score >= 8) {
        scoreFeedback = "Excellent! Your organization has very strong financial health practices across all pillars."
      } else if (score >= 6) {
        scoreFeedback = "Good. Your organization has solid financial health with some areas for improvement."
      } else if (score >= 4) {
        scoreFeedback = "Average. There are several important areas that need attention to improve your overall financial health."
      } else if (score >= 2) {
        scoreFeedback = "Below average. Your organization needs significant improvements in financial management."
      } else {
        scoreFeedback = "Critical. Immediate attention is needed to address fundamental financial health issues."
      }
      
      doc.fontSize(12).fillColor(accentColor)
        .text(scoreFeedback, { align: 'left' })
      
      doc.moveDown(2)
      
      // Pillar breakdown 
      doc.fontSize(16).fillColor(primaryColor).text('Pillar Breakdown', { underline: true })
      doc.moveDown()
      
      // Write scores for each pillar
      assessmentData.pillarResults.forEach((pillar) => {
        doc.fontSize(14).fillColor(secondaryColor).text(pillar.name, { underline: true })
        doc.fontSize(12).fillColor(accentColor).text(`Average Score: ${pillar.score}/10`)
        doc.moveDown(0.5)
        
        // Add pillar-specific feedback
        let pillarFeedback = ''
        if (pillar.score >= 8) {
          pillarFeedback = `Your organization demonstrates excellent practices in ${pillar.name.toLowerCase()}.`
        } else if (pillar.score >= 6) {
          pillarFeedback = `Your organization has a strong foundation in ${pillar.name.toLowerCase()}, with some opportunities for refinement.`
        } else if (pillar.score >= 4) {
          pillarFeedback = `Your organization has a decent foundation in ${pillar.name.toLowerCase()}, but there's significant room for improvement.`
        } else if (pillar.score >= 2) {
          pillarFeedback = `Your organization needs to strengthen its approach to ${pillar.name.toLowerCase()}.`
        } else {
          pillarFeedback = `Your organization requires significant improvement in ${pillar.name.toLowerCase()}. This should be a priority area.`
        }
        
        doc.fontSize(12).fillColor(accentColor).text(pillarFeedback)
        doc.moveDown(0.5)
        
        // Areas to focus on
        if (pillar.focusAreas && pillar.focusAreas.length > 0) {
          doc.fontSize(10).fillColor(secondaryColor).text('Areas to Focus On:')
          pillar.focusAreas.forEach(area => {
            doc.fontSize(9).fillColor(accentColor)
              .text(`• ${area}`)
          })
        }
        
        doc.moveDown()
      })
      
      doc.moveDown(2)
      
      // Recommendations section
      doc.fontSize(16).fillColor(primaryColor).text('Recommended Actions', { underline: true })
      doc.moveDown()
      
      // Add recommendations
      if (assessmentData.recommendedActions && assessmentData.recommendedActions.length > 0) {
        assessmentData.recommendedActions.forEach((action, index) => {
          doc.fontSize(14).fillColor(secondaryColor).text(`${index + 1}. ${action.title}`, { underline: false })
          doc.fontSize(10).fillColor(accentColor).text(action.description)
          doc.moveDown()
        })
      }
      
      // Footer
      doc.fontSize(8).fillColor(accentColor)
        .text(
          'Organizational Financial Health Assessment System (OFHAS)',
          50,
          doc.page.height - 30,
          { align: 'center' }
        )
      
      // Finalize the PDF
      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}

// Error handling middleware (should be the last middleware)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message 
  })
})

// Start the server if not being used as a serverless function
if (process.env.NODE_ENV !== 'production') {
  const port = process.env.PORT || 3000
  app.listen(port, () => {
    console.log(`Server running on port ${port}`)
  })
}

// Export for serverless use
module.exports = app
module.exports.handler = serverless(app)