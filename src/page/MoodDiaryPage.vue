<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Mood Diary</h1>
      <p class="page-subtitle">Track your emotions and get AI-powered insights</p>
    </div>

    <div class="page-content">
      <!-- Loading state for auth -->
      <div v-if="authLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- User content -->
      <div v-else-if="isAuthenticated && isRegularUser">
        <MoodDiary />
      </div>

      <div v-else class="not-authenticated">
        <div class="card">
          <h2>Access Denied</h2>
          <p v-if="!isAuthenticated">Please log in to access your mood diary.</p>
          <p v-else-if="isAdminUser">Administrators should use the Admin Panel instead.</p>
          <p v-else>You don't have permission to access this page.</p>
          <div class="access-actions">
            <router-link v-if="!isAuthenticated" to="/login" class="btn primary">Login</router-link>
            <router-link v-else-if="isAdminUser" to="/admin" class="btn primary">Go to Admin Panel</router-link>
            <router-link v-else to="/" class="btn primary">Go to Home</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/utils/useAuth.js'
import MoodDiary from '@/components/MoodDiary.vue'

// Use auth composable
const { isAuthenticated, isAdminUser, isRegularUser, isLoading: authLoading } = useAuth()

// State
</script>

<style scoped>

</style>
