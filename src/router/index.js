// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/page/HomePage.vue'
import RegisterPage from '@/page/RegisterPage.vue'
import LoginPage from '@/page/LoginPage.vue'
import AdminPage from '@/page/AdminPage.vue'
import { useAuth } from '@/composables/useAuth.js'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
  },
  {
    path: '/register',
    name: 'Register',
    component: RegisterPage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: {
      requiresAuth: true,
      role: 'admin'
    },
    beforeEnter: (to, from, next) => {
      const { user, hasPermission } = useAuth()

      if (!user.value) {
        // User not authenticated, redirect to login
        next('/login')
        return
      }

      if (!hasPermission('admin')) {
        // User doesn't have admin permission, redirect to home
        next('/')
        return
      }

      next()
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
