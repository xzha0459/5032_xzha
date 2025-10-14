<template>
  <div class="page">
    <div class="user-page-header">
      <h1 class="user-page-title">Community</h1>
      <p class="user-page-subtitle">Join our community activities and connect with others</p>
    </div>

    <div class="user-page-content">
      <!-- Loading state for auth -->
      <div v-if="authLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Community content -->
      <div v-else-if="isAuthenticated">
        <!-- Navigation Tabs -->
        <div class="community-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Activities List Tab -->
          <ActivityListSection
            v-if="activeTab === 'activities'"
            :activities="activities"
            @activity-selected="handleActivitySelected"
            @book-activity="handleBookActivity"
          />

          <!-- Calendar Tab -->
          <ActivityCalendarSection
            v-if="activeTab === 'calendar'"
            :activities="activities"
            :bookings="userBookings"
            @book-activity="handleBookActivity"
          />

          <!-- Admin Management Tab (only for admins) -->
          <ActivityManagementSection
            v-if="activeTab === 'management' && isAdminUser"
            :activities="activities"
            :bookings="allBookings"
            @activity-updated="handleActivityUpdated"
            @activity-created="handleActivityCreated"
            @activity-deleted="handleActivityDeleted"
          />
        </div>
      </div>

      <!-- Not authenticated -->
      <div v-else class="not-authenticated">
        <div class="card">
          <h2>Join Our Community</h2>
          <p>Please log in to view and book community activities.</p>
          <router-link to="/login" class="btn primary">Login</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/utils/useAuth.js'
import ActivityListSection from '@/section/CommunityPage/ActivityListSection.vue'
import ActivityCalendarSection from '@/section/CommunityPage/ActivityCalendarSection.vue'
import ActivityManagementSection from '@/section/CommunityPage/ActivityManagementSection.vue'

// Use auth composable
const { isAuthenticated, isAdminUser, isLoading: authLoading, user } = useAuth()

// State
const activeTab = ref('activities')
const activities = ref([])
const userBookings = ref([])
const allBookings = ref([])

// Tab configuration
const tabs = computed(() => {
  const baseTabs = [
    { id: 'activities', label: 'Activities' },
    { id: 'calendar', label: 'Calendar' }
  ]

  if (isAdminUser.value) {
    baseTabs.push({ id: 'management', label: 'Management' })
  }

  return baseTabs
})

// Event handlers
const handleActivitySelected = (activity) => {
  console.log('Activity selected:', activity)
}

const handleBookActivity = (activity) => {
  console.log('Book activity:', activity)
  // TODO: Implement booking logic
}

const handleActivityUpdated = (activity) => {
  console.log('Activity updated:', activity)
  // TODO: Implement activity update logic
}

const handleActivityCreated = (activity) => {
  console.log('Activity created:', activity)
  // TODO: Implement activity creation logic
}

const handleActivityDeleted = (activityId) => {
  console.log('Activity deleted:', activityId)
  // TODO: Implement activity deletion logic
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
      }
    ]
  }
}

const loadAllBookings = async () => {
  // TODO: Load all bookings for admin view
  // Mock data for now
  allBookings.value = [
    {
      id: 'booking1',
      userId: 'user1',
      activityId: '1',
      bookingDate: new Date('2024-01-10T09:00:00'),
      status: 'confirmed',
      notes: 'Looking forward to this session'
    },
    {
      id: 'booking2',
      userId: 'user2',
      activityId: '2',
      bookingDate: new Date('2024-01-12T18:30:00'),
      status: 'confirmed',
      notes: ''
    }
  ]
}

onMounted(() => {
  if (isAuthenticated.value) {
    loadActivities()
    loadUserBookings()
    if (isAdminUser.value) {
      loadAllBookings()
    }
  }
})
</script>

<style scoped>
.community-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-weight: 500;
}

.tab-button:hover {
  color: var(--forest-medium);
  background: var(--forest-light);
}

.tab-button.active {
  color: var(--forest-deep);
  border-bottom-color: var(--forest-deep);
  background: var(--forest-light);
}

.tab-content {
  min-height: 400px;
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

/* Responsive Design */
@media (max-width: 768px) {
  .community-nav {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tab-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
}
</style>
