import { createRouter, createWebHistory } from 'vue-router'
import supabase from '../supabaseClient'
import LandingPage from '../views/LandingPage.vue'
import Register from '../views/Register.vue'
import Assessment from '../views/Assessment.vue'
import Report from '../views/Report.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import About from '../views/About.vue'
import ResetPassword from '../views/ResetPassword.vue'
import EmailConfirmation from '../views/EmailConfirmation.vue'
import AuthCallback from '../views/AuthCallback.vue' 
import NotFound from '../views/NotFound.vue'
import SharedReportView from '../views/SharedReportView.vue'

const routes = [
  { 
    path: '/', 
    name: 'LandingPage', 
    component: LandingPage 
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register 
  },
  { 
    path: '/assessment', 
    name: 'Assessment', 
    component: Assessment,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/report', 
    name: 'Report', 
    component: Report,
    meta: { requiresAuth: true } 
  },
  { 
    path: '/admin', 
    name: 'AdminDashboard', 
    component: AdminDashboard,
    meta: { requiresAdmin: true } 
  },
  { 
    path: '/about', 
    name: 'About', 
    component: About 
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/reset-password',
    name: 'ResetPassword',
    component: ResetPassword
  },
  {
    path: '/email-confirmation',
    name: 'EmailConfirmation',
    component: EmailConfirmation
  },
  {
    // Make sure this route exists for /auth/callback
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound
  },
  { 
    path: '/shared-report/:token', 
    name: 'SharedReportView', 
    component: SharedReportView 
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Cache for authentication state
let cachedAuthState = null
let lastAuthCheck = 0
const AUTH_CACHE_DURATION = 60 * 1000 // 1 minute cache

// Improved auth check function
async function isAuthenticated() {
  const now = Date.now()
  
  // Use cached value if recent
  if (cachedAuthState !== null && (now - lastAuthCheck) < AUTH_CACHE_DURATION) {
    return cachedAuthState
  }
  
  // Check Supabase auth
  try {
    const { data } = await supabase.auth.getSession()
    cachedAuthState = !!data?.session
  } catch (error) {
    console.error('Auth check error:', error)
    cachedAuthState = false
  }
  
  // If no active session, check if user opted to proceed without verification
  if (!cachedAuthState) {
    const proceedWithoutVerification = localStorage.getItem('proceedWithoutVerification') === 'true'
    const hasUserProfile = !!localStorage.getItem('userProfile')
    
    // Allow access if user chose to proceed without verification
    if (proceedWithoutVerification && hasUserProfile) {
      cachedAuthState = true
    }
  }
  
  lastAuthCheck = now
  return cachedAuthState
}

// Check for admin role
async function isAdmin() {
  // First check if authenticated
  const isLoggedIn = await isAuthenticated()
  if (!isLoggedIn) return false
  
  // For now, we'll use localStorage as a mock for admin check
  // In production, this would check a role or permission in Supabase
  const isAdminUser = localStorage.getItem('isAdmin') === 'true'
  
  return isAdminUser
}

// Navigation guard
router.beforeEach(async (to, from, next) => {
  // Skip auth check for auth-related routes
  if (to.path.startsWith('/auth/') || to.path === '/reset-password') {
    return next()
  }
  
  // Routes that require authentication
  if (to.meta.requiresAuth) {
    const authenticated = await isAuthenticated()
    
    if (!authenticated) {
      // Redirect to login with intended destination
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath } 
      })
    }
  }
  
  // Routes that require admin permission
  if (to.meta.requiresAdmin) {
    const adminAccess = await isAdmin()
    
    if (!adminAccess) {
      // Redirect to home page with message
      return next({ 
        path: '/',
        query: { 
          error: 'admin_required',
          message: 'You need administrator access for this page' 
        } 
      })
    }
  }
  
  // Continue navigation
  next()
})

export default router