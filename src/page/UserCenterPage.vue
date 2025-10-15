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
        <div class="bookings-section">
          <!-- Section Header -->
          <div class="section-header">
            <h2 class="section-title">My Bookings</h2>
          </div>

          <!-- View Toggle -->
          <div class="toggle-tabs">
            <button
              :class="['toggle-tab', { active: viewMode === 'list' }]"
              @click="viewMode = 'list'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
              </svg>
              List View
            </button>
            <button
              :class="['toggle-tab', { active: viewMode === 'calendar' }]"
              @click="viewMode = 'calendar'"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
              Calendar View
            </button>
          </div>

          <!-- List View -->
          <MyBookingsSection
            v-if="viewMode === 'list'"
            :user="user"
            @cancel-booking="handleCancelBooking"
          />

          <!-- Calendar View -->
          <MyBookingCalendar
            v-if="viewMode === 'calendar'"
            :user="user"
            @booking-selected="handleBookingSelected"
            @date-selected="handleDateSelected"
          />
        </div>
      </div>

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
import { computed, ref } from 'vue'
import { useAuth } from '@/utils/useAuth.js'
import MyBookingsSection from '@/section/UserCenterPage/MyBookingsSection.vue'
import MyBookingCalendar from '@/section/UserCenterPage/MyBookingCalendar.vue'

// Use auth composable
const { user, userProfile, isAuthenticated, isAdminUser, isRegularUser, isLoading: authLoading } = useAuth()

// State
const viewMode = ref('list') // 'list' or 'calendar'

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

const handleBookingSelected = (data) => {
  const { booking, activity, hasConflict, conflictingBookings } = data

  let message = `Booking: ${activity.title}\nDate: ${new Date(activity.date).toLocaleDateString()}\nTime: ${new Date(activity.date).toLocaleTimeString()}\nStatus: ${booking.status}`

  if (hasConflict) {
    message += `\n\n⚠️ CONFLICT DETECTED!\nConflicting bookings:\n${conflictingBookings.map(cb => {
      return `- ${cb.activity?.title || 'Unknown'} (${cb.status})`
    }).join('\n')}`
  }

  alert(message)
}

const handleDateSelected = (data) => {
  const { date, availableActivities } = data

  if (availableActivities.length > 0) {
    alert(`Available activities on ${date}:\n${availableActivities.map(a => a.title).join('\n')}`)
  } else {
    alert(`No available activities on ${date}`)
  }
}
</script>

<style scoped>
.user-profile-section {
  margin-bottom: 1rem;
}

.bookings-section {
  margin-top: 2rem;
}

/* View toggle now uses global .toggle-tabs/.toggle-tab styles */
.card {
  margin-top: 1rem;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.profile-avatar {
  width: 70px;
  height: 70px;
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
  font-weight: 600;
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
