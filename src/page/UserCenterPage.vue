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
        <MyBookingsSection
          :bookings="userBookings"
          :activities="activities"
          @cancel-booking="handleCancelBooking"
        />
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
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/utils/useAuth.js'
import MyBookingsSection from '@/section/UserCenterPage/MyBookingsSection.vue'

// Use auth composable
const { user, userProfile, isAuthenticated, isAdminUser, isRegularUser, isLoading: authLoading } = useAuth()

// State
const activities = ref([])
const userBookings = ref([])

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
  // TODO: Implement cancel booking logic
  // Update userBookings array
  const index = userBookings.value.findIndex(b => b.id === booking.id)
  if (index !== -1) {
    userBookings.value[index].status = 'cancelled'
  }
}

// Load data
const loadActivities = async () => {
  // TODO: Load activities from Firestore
  // Mock data for now
  activities.value = [
    {
      id: '1',
      title: 'Mindfulness Meditation',
      description: 'Join us for a guided meditation session to reduce stress and improve focus.',
      type: 'meditation',
      date: new Date('2024-01-15T10:00:00'),
      duration: 60,
      location: 'Community Center Room A',
      maxParticipants: 20,
      currentParticipants: 12,
      price: 0,
      instructor: 'Sarah Johnson',
      requirements: ['Comfortable clothing', 'Yoga mat (optional)'],
      status: 'active'
    },
    {
      id: '2',
      title: 'Anxiety Support Group',
      description: 'A safe space to share experiences and learn coping strategies for anxiety.',
      type: 'support-group',
      date: new Date('2024-01-18T19:00:00'),
      duration: 90,
      location: 'Community Center Room B',
      maxParticipants: 15,
      currentParticipants: 8,
      price: 0,
      instructor: 'Dr. Michael Chen',
      requirements: ['Confidentiality agreement'],
      status: 'active'
    },
    {
      id: '3',
      title: 'Art Therapy Workshop',
      description: 'Express your emotions through creative art activities.',
      type: 'art-therapy',
      date: new Date('2024-01-20T14:00:00'),
      duration: 120,
      location: 'Art Studio',
      maxParticipants: 12,
      currentParticipants: 6,
      price: 15,
      instructor: 'Emma Wilson',
      requirements: ['All materials provided'],
      status: 'active'
    }
  ]
}

const loadUserBookings = async () => {
  // TODO: Load user bookings from Firestore
  // Mock data for now
  if (user.value) {
    userBookings.value = [
      {
        id: 'booking1',
        userId: user.value.uid,
        activityId: '1',
        bookingDate: new Date('2024-01-10T09:00:00'),
        status: 'confirmed',
        notes: 'Looking forward to this session'
      },
      {
        id: 'booking2',
        userId: user.value.uid,
        activityId: '2',
        bookingDate: new Date('2024-01-12T18:30:00'),
        status: 'confirmed',
        notes: ''
      },
      {
        id: 'booking3',
        userId: user.value.uid,
        activityId: '3',
        bookingDate: new Date('2024-01-05T14:00:00'),
        status: 'confirmed',
        notes: 'Past activity'
      }
    ]
  }
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadActivities()
    loadUserBookings()
  }
})
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
