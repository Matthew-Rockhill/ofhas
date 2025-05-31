// src/services/assessmentService.js
import supabase from '../supabaseClient'

// Get all questions for the assessment
export const getAllQuestions = () => {
  return [
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
}

// Shuffle an array randomly
export const shuffleArray = (array) => {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

// Save assessment progress to local storage
export const saveProgressLocally = (progress) => {
  try {
    localStorage.setItem('assessmentProgress', JSON.stringify({
      ...progress,
      timestamp: new Date().toISOString()
    }))
    return true
  } catch (e) {
    console.error('Error saving progress to localStorage:', e)
    return false
  }
}

// Load assessment progress from local storage
export const loadProgressFromLocal = () => {
  try {
    const savedProgress = localStorage.getItem('assessmentProgress')
    if (savedProgress) {
      return JSON.parse(savedProgress)
    }
    return null
  } catch (e) {
    console.error('Error loading progress from localStorage:', e)
    return null
  }
}

// Save assessment progress to Supabase
export const saveProgressToSupabase = async (userId, progress) => {
  if (!userId || !supabase) return false
  
  try {
    const { error } = await supabase
      .from('assessment_progress')
      .upsert({
        user_id: userId,
        progress: {
          currentIndex: progress.currentIndex,
          answers: progress.answers,
          timestamp: new Date().toISOString()
        }
      }, { onConflict: ['user_id'] })
    
    if (error) {
      console.error('Error saving to Supabase:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in saveProgressToSupabase:', error)
    return false
  }
}

// Load assessment progress from Supabase
export const loadProgressFromSupabase = async (userId) => {
  if (!userId || !supabase) return null
  
  try {
    const { data, error } = await supabase
      .from('assessment_progress')
      .select('progress')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      console.error('Error loading from Supabase:', error)
      return null
    }
    
    return data?.progress || null
  } catch (error) {
    console.error('Error in loadProgressFromSupabase:', error)
    return null
  }
}

// Get current user ID
export const getCurrentUserId = async () => {
  try {
    // Try to get from Supabase session
    const { data } = await supabase.auth.getSession()
    if (data?.session?.user?.id) {
      return data.session.user.id
    }
    
    // Fallback to localStorage
    const userProfile = localStorage.getItem('userProfile')
    if (userProfile) {
      const profile = JSON.parse(userProfile)
      return profile.id
    }
    
    return null
  } catch (e) {
    console.error('Error getting current user ID:', e)
    return null
  }
}

// Save completed assessment
export const saveCompletedAssessment = async (assessment) => {
  const userId = await getCurrentUserId()
  
  if (!userId) {
    // Save locally only
    localStorage.setItem('assessmentAnswers', JSON.stringify(assessment.answers))
    localStorage.setItem('assessmentQuestions', JSON.stringify(assessment.questions))
    localStorage.setItem('assessmentCompleted', new Date().toISOString())
    return { success: true, local: true }
  }
  
  // Save to Supabase if possible
  try {
    const { error } = await supabase
      .from('assessments')
      .insert({
        user_id: userId,
        answers: assessment.answers,
        questions: assessment.questions,
        completed_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error saving assessment to Supabase:', error)
      // Fall back to local storage
      localStorage.setItem('assessmentAnswers', JSON.stringify(assessment.answers))
      localStorage.setItem('assessmentQuestions', JSON.stringify(assessment.questions))
      localStorage.setItem('assessmentCompleted', new Date().toISOString())
      return { success: true, local: true, error: error.message }
    }
    
    return { success: true, local: false }
  } catch (error) {
    console.error('Error in saveCompletedAssessment:', error)
    
    // Fall back to local storage
    localStorage.setItem('assessmentAnswers', JSON.stringify(assessment.answers))
    localStorage.setItem('assessmentQuestions', JSON.stringify(assessment.questions))
    localStorage.setItem('assessmentCompleted', new Date().toISOString())
    return { success: true, local: true, error: error.message }
  }
}

// Get the latest completed assessment for a user from Supabase
export const getCompletedAssessmentFromSupabase = async (userId) => {
  if (!userId || !supabase) return null;
  
  try {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error loading assessment from Supabase:', error);
      return null;
    }
    
    if (data.length === 0) {
      console.warn('No assessments found in Supabase for user:', userId);
      return null;
    }
    
    console.log('Loaded assessment from Supabase:', data[0]);
    
    // Return the assessment data
    return {
      answers: data[0].answers || {},
      questions: data[0].questions || [],
      completed_at: data[0].completed_at
    };
  } catch (error) {
    console.error('Error in getCompletedAssessmentFromSupabase:', error);
    return null;
  }
};