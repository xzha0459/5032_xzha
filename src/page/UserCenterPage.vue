<template>
  <div class="page">
    <div class="user-page-header">
      <h1 class="user-page-title">User Center</h1>
      <div class="user-page-subtitle">Manage your bookings and preferences</div>
    </div>

    <div class="user-page-content">
      <!-- Loading state for auth -->
      <div v-if="authLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- User content -->
      <div v-else-if="isAuthenticated && isRegularUser" class="user-content-layout">
        <!-- Sidebar Navigation -->
        <div class="sidebar">
          <!-- User Profile in Sidebar -->
          <div class="sidebar-profile">
            <div class="profile-avatar">
              <span class="avatar-text">{{ userInitial }}</span>
            </div>
            <div class="profile-info">
              <h3 class="profile-name">{{ userDisplayName }}</h3>
              <p class="profile-email">{{ user?.email }}</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <button
              v-for="section in availableSections"
              :key="section.id"
              :class="['nav-item', { active: activeSection === section.id }]"
              @click="setActiveSection(section.id)"
            >
              <span class="nav-label">{{ section.label }}</span>
            </button>
          </nav>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Mood History Section -->
          <div v-if="activeSection === 'mood'" class="mood-history-section">
            <div class="section-header">
              <h2 class="section-title">Mood Diary</h2>
              <router-link to="/mood-diary" class="btn primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                </svg>
                Add Entry
              </router-link>
            </div>

            <MoodHistory />
          </div>

          <!-- My Bookings Section -->
          <div v-if="activeSection === 'bookings'" class="bookings-section">
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
            <MyBookingsList
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
import MyBookingsList from '@/section/UserCenterPage/MyBookingsList.vue'
import MyBookingCalendar from '@/section/UserCenterPage/MyBookingCalendar.vue'
import MoodHistory from '@/section/UserCenterPage/MoodHistory.vue'

// Use auth composable
const { user, userProfile, isAuthenticated, isAdminUser, isRegularUser, isLoading: authLoading } = useAuth()

// State
const viewMode = ref('list') // 'list' or 'calendar'
const activeSection = ref('mood') // 'mood', 'bookings'

// Available sections
const availableSections = ref([
  {
    id: 'mood',
    label: 'Mood Diary'
  },
  {
    id: 'bookings',
    label: 'My Bookings'
  }
])

// Methods
const setActiveSection = (sectionId) => {
  activeSection.value = sectionId
}

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
.user-page-content {
  padding: 4rem 6rem 4rem 6rem;
}

.user-content-layout {
  display: flex;
  gap: 2rem;
  min-height: 600px;
}

.sidebar {
  width: 250px;
  background: transparent;
  padding: 1rem;
  height: fit-content;
  position: sticky;
  top: 2rem;
}

.sidebar-profile {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--border-light);
}

.sidebar-profile .profile-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--forest-deep);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.sidebar-profile .avatar-text {
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
}

.sidebar-profile .profile-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.sidebar-profile .profile-name {
  margin: 0 0 0.25rem 0;
  color: var(--forest-deep);
  font-size: 1.1rem;
  font-weight: 600;
}

.sidebar-profile .profile-email {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  width: 100%;
}

.nav-item:hover {
  background: var(--forest-light);
  color: var(--forest-deep);
}

.nav-item.active {
  background: var(--forest-deep);
  color: white;
}

.nav-label {
  font-weight: 500;
  font-size: 0.95rem;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding-top: 0;
}

/* Section Styles */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.section-title {
  margin-top: 0;
  margin-bottom: 0;
  text-align: left;
}

.card {
  margin-top: 1rem;
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
  .user-content-layout {
    flex-direction: column;
    gap: 1rem;
  }

  .sidebar {
    width: 100%;
    position: static;
    order: 1;
  }

  .main-content {
    order: 2;
  }

  .sidebar-profile {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }

  .sidebar-profile .profile-info {
    text-align: center;
  }

  .sidebar-profile .profile-name,
  .sidebar-profile .profile-email {
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }

  .sidebar-nav {
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-item {
    flex-shrink: 0;
    min-width: auto;
    justify-content: center;
  }

  .nav-label {
    font-size: 0.85rem;
  }
}
</style>
