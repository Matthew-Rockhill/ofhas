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
    path: '/auth/callback',
    name: 'AuthCallback',
    component: AuthCallback
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simple navigation guard for auth
router.beforeEach(async (to, from, next) => {
  // For development, use localStorage to check if user is logged in
  const isLocalStorageAuth = !!localStorage.getItem('userProfile')
  
  // Check Supabase auth
  const { data } = await supabase.auth.getSession()
  const isSupabaseAuth = !!data?.session
  
  // Either auth method is valid
  const isLoggedIn = isSupabaseAuth || isLocalStorageAuth
  
  if (to.meta.requiresAuth && !isLoggedIn) {
    next('/login')
  } else if (to.meta.requiresAdmin) {
    // Mock admin check for now
    const isAdmin = localStorage.getItem('isAdmin') === 'true'
    
    if (!isLoggedIn || !isAdmin) {
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router