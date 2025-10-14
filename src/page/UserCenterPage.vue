<template>
  <div class="page">
    <div class="user-page-header">
      <h1 class="user-page-title">User Center</h1>
      <p class="user-page-subtitle">Manage your bookings and preferences</p>
    </div>

    <div class="user-page-content">
      <!-- Loading state for auth -->
      <div v-if="authLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- User content -->
      <div v-else-if="isAuthenticated && isRegularUser">
        <!-- User Profile Section -->
        <div class="user-profile-section">
          <div class="card">
            <div class="profile-header">
              <div class="profile-avatar">
                <span class="avatar-text">{{ userInitial }}</span>
              </div>
              <div class="profile-info">
                <h2 class="profile-name">{{ userDisplayName }}</h2>
                <p class="profile-email">{{ user?.email }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- My Bookings Section -->
        <MyBookingsSection :user="user" @cancel-booking="handleCancelBooking" />
      </div>

      <!-- Not authenticated or wrong role -->
      <div v-else class="not-authenticated">
        <div class="card">
          <h2>Access Denied</h2>
          <p v-if="!isAuthenticated">Please log in to access your user center.</p>
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
import { computed } from 'vue'
import { useAuth } from '@/utils/useAuth.js'
import MyBookingsSection from '@/section/UserCenterPage/MyBookingsSection.vue'

// Use auth composable
const { user, userProfile, isAuthenticated, isAdminUser, isRegularUser, isLoading: authLoading } = useAuth()

// Computed
const userInitial = computed(() => {
  if (user.value?.displayName) {
    return user.value.displayName.charAt(0).toUpperCase()
  }
  if (user.value?.email) {
    return user.value.email.charAt(0).toUpperCase()
  }
  return 'U'
})

const userDisplayName = computed(() => {
  if (!user.value) return 'User'
  // 优先使用 Firestore 中的 username，如果没有则使用邮箱前缀
  return userProfile.value?.username || user.value.email?.split('@')[0] || 'User'
})

// Methods
const handleCancelBooking = (booking) => {
  console.log('Cancel booking:', booking)
  // MyBookingsSection now handles the cancellation internally
}
</script>

<style scoped>
.user-profile-section {
  margin-bottom: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--forest-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-text {
  font-size: 2rem;
  font-weight: 600;
  color: white;
}

.profile-info {
  flex: 1;
}

.profile-name {
  margin: 0 0 0.5rem 0;
  color: var(--forest-deep);
  font-size: 1.5rem;
}

.profile-email {
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
}

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

.access-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
