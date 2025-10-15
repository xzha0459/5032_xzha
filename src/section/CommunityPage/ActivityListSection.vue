<template>
  <div class="activity-list-section">
    <div class="section-header">
      <h1 class="section-title">Community Activities</h1>

      <div class="filter-section">
        <div class="filter-group">
          <label for="typeFilter" class="filter-label">Filter by Type:</label>
          <select id="typeFilter" v-model="selectedType" class="filter">
            <option value="all">All Activities</option>
            <option value="lecture">Lectures</option>
            <option value="support-group">Support Groups</option>
            <option value="meditation">Meditation</option>
            <option value="art-therapy">Art Therapy</option>
            <option value="exercise">Exercise</option>
            <option value="social">Social Events</option>
          </select>
        </div>

        <div class="filter-group">
          <label for="statusFilter" class="filter-label">Status:</label>
          <select id="statusFilter" v-model="selectedStatus" class="filter">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="full">Full</option>
            <option value="cancelled">Cancelled</option>
            <option value="past">Past</option>
          </select>
        </div>
      </div>
    </div>

    <div class="activities-grid" v-if="filteredActivities.length > 0">
      <div
        v-for="activity in paginatedActivities"
        :key="activity.id"
        class="card activity-card"
        @click="selectActivity(activity)"
      >
        <div class="card-header">
          <div class="booking-tag" :class="activity.type">
            {{ getTypeLabel(activity.type) }}
          </div>
          <div class="booking-tag" :class="getStatusClass(activity)">
            {{ getStatusText(activity) }}
          </div>
        </div>

        <div class="card-body">
          <h3 class="card-title">{{ activity.title }}</h3>
          <p class="card-description">{{ activity.description }}</p>

          <div class="card-list">
            <div class="card-item">
              <span class="card-icon">Date:</span>
              <span>{{ formatDate(activity.date) }}</span>
            </div>
            <div class="card-item">
              <span class="card-icon">Time:</span>
              <span>{{ formatTime(activity.date) }} ({{ activity.duration }}min)</span>
            </div>
            <div class="card-item">
              <span class="card-icon">Location:</span>
              <span>{{ activity.location }}</span>
            </div>
            <div class="card-item">
              <span class="card-icon">Participants:</span>
              <span>{{ activity.currentParticipants }}/{{ activity.maxParticipants }} participants</span>
            </div>
            <div class="card-item">
              <span class="card-icon">Instructor:</span>
              <span>{{ activity.instructor }}</span>
            </div>
            <div class="card-item">
              <span class="card-icon">Price:</span>
              <span>{{ activity.price > 0 ? '$' + activity.price : 'Free' }}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <button
            class="btn primary"
            :disabled="!canBookActivity(activity)"
            @click.stop="bookActivity(activity)"
          >
            {{ getBookingButtonText(activity) }}
          </button>
          <button class="btn secondary" @click.stop="viewDetails(activity)">
            View Details
          </button>
        </div>
      </div>
    </div>

    <!-- No activities found -->
    <div v-else class="no-activities">
      <div class="card">
        <h3>No activities found</h3>
        <p>Try adjusting your filters or check back later for new activities.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div class="pagination" v-if="totalPages > 1">
      <button
        class="btn action"
        :disabled="currentPage === 1"
        @click="currentPage--"
      >
        Previous
      </button>
      <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
      <button
        class="btn action"
        :disabled="currentPage === totalPages"
        @click="currentPage++"
      >
        Next
      </button>
    </div>

    <!-- Activity Details Modal -->
    <div class="modal-overlay" v-if="hasSelectedActivity()" @click="closeActivityDetails" role="presentation">
      <div class="modal" @click.stop ref="activityModal"
           role="dialog" aria-modal="true" :aria-labelledby="'activity-modal-title'"
           @keydown="handleModalKeydown">
        <div class="modal-header">
          <h2 class="modal-title" :id="'activity-modal-title'">{{ selectedActivity?.title }}</h2>
          <button class="close-button" ref="activityCloseBtn" @click="closeActivityDetails" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body" v-if="selectedActivity">
          <div class="modal-tags">
            <span class="booking-tag" :class="selectedActivity.type">
              {{ getTypeLabel(selectedActivity.type) }}
            </span>
            <span class="booking-tag" :class="getStatusClass(selectedActivity)">
              {{ getStatusText(selectedActivity) }}
            </span>
          </div>

          <p class="modal-description">{{ selectedActivity.description }}</p>

          <ul class="modal-list">
            <li>
              <strong>Date:</strong>
              {{ formatDate(selectedActivity.date) }}
            </li>
            <li>
              <strong>Time:</strong>
              {{ formatTime(selectedActivity.date) }} ({{ selectedActivity.duration }}min)
            </li>
            <li>
              <strong>Location:</strong>
              {{ selectedActivity.location }}
            </li>
            <li>
              <strong>Instructor:</strong>
              {{ selectedActivity.instructor }}
            </li>
            <li>
              <strong>Participants:</strong>
              {{ selectedActivity.currentParticipants }}/{{ selectedActivity.maxParticipants }} participants
            </li>
            <li>
              <strong>Price:</strong>
              {{ selectedActivity.price > 0 ? '$' + selectedActivity.price : 'Free' }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useAuth } from '@/utils/useAuth'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['activity-selected', 'book-activity'])

// Get user role from auth
const { isAdminUser } = useAuth()

// State
const selectedType = ref('all')
const selectedStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6
const selectedActivity = ref(null)
const showActivityDetails = ref(false)
const lastFocusedBeforeModal = ref(null)
const activityModal = ref(null)
const activityCloseBtn = ref(null)

// Computed
const filteredActivities = computed(() => {
  let filtered = props.activities

  // Filter by type
  if (selectedType.value !== 'all') {
    filtered = filtered.filter(activity => activity.type === selectedType.value)
  }

  // Filter by status
  if (selectedStatus.value !== 'all') {
    filtered = filtered.filter(activity => {
      const now = new Date()
      const activityDate = new Date(activity.date)

      switch (selectedStatus.value) {
        case 'active':
          return activity.status === 'active' &&
                 activity.currentParticipants < activity.maxParticipants &&
                 activityDate >= now
        case 'full':
          return activity.status === 'active' &&
                 activity.currentParticipants >= activity.maxParticipants &&
                 activityDate >= now
        case 'cancelled':
          return activity.status === 'cancelled'
        case 'past':
          return activityDate < now
        default:
          return true
      }
    })
  }

  // Sort by date
  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
})

const totalPages = computed(() => {
  return Math.ceil(filteredActivities.value.length / itemsPerPage)
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredActivities.value.slice(start, end)
})

// Methods
const getTypeLabel = (type) => {
  const labels = {
    'lecture': 'Lecture',
    'support-group': 'Support Group',
    'meditation': 'Meditation',
    'art-therapy': 'Art Therapy',
    'exercise': 'Exercise',
    'social': 'Social Event'
  }
  return labels[type] || type
}

const getStatusClass = (activity) => {
  const now = new Date()
  const activityDate = new Date(activity.date)

  if (activity.status === 'cancelled') return 'cancelled'
  if (activityDate < now) return 'past'
  if (activity.currentParticipants >= activity.maxParticipants) return 'full'
  return 'active'
}

const getStatusText = (activity) => {
  const now = new Date()
  const activityDate = new Date(activity.date)

  if (activity.status === 'cancelled') return 'Cancelled'
  if (activityDate < now) return 'Past'
  if (activity.currentParticipants >= activity.maxParticipants) return 'Full'
  return 'Active'
}

const canBookActivity = (activity) => {
  // Admins cannot book activities
  if (isAdminUser.value) {
    return false
  }

  const activityDate = new Date(activity.date)
  return activity.status === 'active' &&
         activity.currentParticipants < activity.maxParticipants &&
         activityDate > new Date()
}

const getBookingButtonText = (activity) => {
  // Show different text for admins
  if (isAdminUser.value) {
    return 'Admin View Only'
  }

  if (activity.status !== 'active') return 'Cancelled'
  if (activity.currentParticipants >= activity.maxParticipants) return 'Full'
  if (new Date(activity.date) < new Date()) return 'Past Event'
  return 'Book Now'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const selectActivity = (activity) => {
  // 记录触发元素以便关闭后还原焦点
  lastFocusedBeforeModal.value = document.activeElement
  selectedActivity.value = activity
  showActivityDetails.value = true
  nextTick(() => {
    // 将焦点移到关闭按钮
    const btn = activityCloseBtn.value
    if (btn && btn.focus) btn.focus()
  })
}

const closeActivityDetails = () => {
  showActivityDetails.value = false
  selectedActivity.value = null
  // 关闭后把焦点还原到触发元素
  if (lastFocusedBeforeModal.value && lastFocusedBeforeModal.value.focus) {
    lastFocusedBeforeModal.value.focus()
  }
}

const hasSelectedActivity = () => {
  return selectedActivity.value !== null
}

// 焦点陷阱与ESC
const handleModalKeydown = (e) => {
  if (e.key === 'Escape') {
    closeActivityDetails()
    return
  }
  if (e.key !== 'Tab') return
  const modal = activityModal.value
  if (!modal) return
  const focusable = modal.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  )
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

const bookActivity = (activity) => {
  // Prevent admins from booking
  if (isAdminUser.value) {
    return
  }

  if (canBookActivity(activity)) {
    emit('book-activity', activity)
    // Don't close activity details modal - let the booking modal handle it
  }
}

const viewDetails = (activity) => {
  selectActivity(activity)
}

// Expose methods for parent component
defineExpose({
  closeActivityDetails
})
</script>

<style scoped>
.activity-list-section {
  padding: 0;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.activity-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.no-activities {
  text-align: center;
  padding: 3rem 1rem;
}

.no-activities .card {
  max-width: 400px;
  margin: 0 auto;
}

.no-activities h3 {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.no-activities p {
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
