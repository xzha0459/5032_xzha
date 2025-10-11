// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/page/HomePage.vue'
import RegisterPage from '@/page/RegisterPage.vue'
import LoginPage from '@/page/LoginPage.vue'
import AdminPage from '@/page/AdminPage.vue'
import WellbeingPage from '@/page/WellbeingPage.vue'

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
    path: '/wellbeing',
    name: 'Wellbeing',
    component: WellbeingPage,
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminPage,
    meta: {
      requiresAuth: true,
      role: 'admin'
    }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
