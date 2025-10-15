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
          <h2>Start Your Mood Journey</h2>
          <p>Please log in to track your emotions and get AI-powered insights.</p>
          <router-link to="/login" class="btn primary">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuth } from '@/utils/useAuth.js'
import MoodDiary from '@/components/MoodDiary.vue'

// Use auth composable
const { isAuthenticated, isRegularUser, isLoading: authLoading } = useAuth()

// State
</script>

<style scoped>
.not-authenticated {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.not-authenticated .card {
  text-align: center;
  max-width: 400px;
}

.not-authenticated .card h2 {
  margin-bottom: 1rem;
  color: var(--forest-deep);
}

.not-authenticated .card p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
}
</style>
