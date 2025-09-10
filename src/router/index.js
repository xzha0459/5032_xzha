// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/page/HomePage.vue'
import RegisterPage from '@/page/RegisterPage.vue'
import LoginPage from '@/page/LoginPage.vue'

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
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
