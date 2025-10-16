<template>
  <div class="my-bookings-list">
    <!-- Filter Tabs -->
    <div class="toggle-tabs">
      <button
        v-for="filter in bookingFilters"
        :key="filter.id"
        :class="['toggle-tab', { active: activeFilter === filter.id }]"
        @click="activeFilter = filter.id"
      >
        {{ filter.label }}
        <span class="filter-count">({{ filter.count }})</span>
      </button>
    </div>

    <!-- Bookings List -->
    <div class="bookings-list" v-if="!isLoading && filteredBookings.length > 0">
      <div
        v-for="booking in paginatedBookings"
        :key="booking.id"
        class="card"
        :class="`booking-${booking.status}`"
      >
        <div class="card-header">
          <h3 class="card-title">{{ getActivityTitle(booking.activityId) }}</h3>
          <div class="booking-date">
            Booked on {{ formatBookingDate(booking.bookingDate) }}
          </div>
          <div class="booking-tag" :class="getBookingStatusClass(booking)">
            {{ getStatusLabel(booking) }}
          </div>
        </div>

        <div class="card-body">
          <p>{{ getActivityDescription(booking.activityId) }}</p>

            <div class="card-list">
              <div class="card-item">
                <span class="card-icon">Date:</span>
                <span>{{ formatActivityDate(booking.activityId) }}</span>
              </div>
              <div class="card-item">
                <span class="card-icon">Time:</span>
                <span>{{ formatActivityTime(booking.activityId) }}</span>
              </div>
              <div class="card-item">
                <span class="card-icon">Location:</span>
                <span>{{ getActivityLocation(booking.activityId) }}</span>
              </div>
              <div class="card-item">
                <span class="card-icon">Instructor:</span>
                <span>{{ getActivityInstructor(booking.activityId) }}</span>
              </div>
              <div class="card-item" v-if="getActivityPrice(booking.activityId) > 0">
                <span class="card-icon">Price:</span>
                <span>${{ getActivityPrice(booking.activityId) }}</span>
              </div>
              <div class="card-item" v-else>
                <span class="card-icon">Cost:</span>
                <span>Free</span>
              </div>
            </div>
        </div>

        <div class="card-footer">
          <div class="card-action">
            <button
              class="btn secondary"
              @click="viewActivityDetails(booking.activityId)"
            >
              View Activity
            </button>

            <button
              v-if="canCancelBooking(booking)"
              class="btn action danger"
              @click="cancelBooking(booking)"
            >
              Cancel Booking
            </button>

          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <div class="card">
        <div class="loading-content">
          <div class="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </div>
    </div>

    <!-- No bookings found -->
    <div v-else-if="!isLoading && filteredBookings.length === 0" class="no-bookings">
      <div class="card">
        <div class="no-bookings-content">
          <div class="no-bookings-text">No Bookings</div>
          <h3>No bookings found</h3>
          <p v-if="activeFilter === 'all'">
            You haven't booked any activities yet.
            <router-link to="/community" @click="$emit('switch-tab', 'activities')">
              Browse available activities
            </router-link>
            to get started!
          </p>
          <p v-else>
            No {{ activeFilter }} bookings found.
          </p>
        </div>
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

    <!-- Cancel Booking Modal -->
    <div v-if="showCancelModal" class="modal-overlay" @click="closeCancelModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Cancel Booking</h2>
          <button class="close-button" @click="closeCancelModal">×</button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to cancel your booking for <strong>{{ selectedBooking?.activityTitle }}</strong>?</p>
          <p class="warning-text">This action cannot be undone.</p>
          <div class="modal-actions">
            <button class="btn secondary" @click="closeCancelModal">Keep Booking</button>
            <button class="btn danger" @click="confirmCancelBooking">Cancel Booking</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { getDocs, collection, updateDoc, doc, query, where } from 'firebase/firestore'
import { db } from '@/firebase.js'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['cancel-booking', 'switch-tab'])

// State
const activeFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 8
const showCancelModal = ref(false)
const selectedBooking = ref(null)
const bookings = ref([])
const activities = ref([])
const isLoading = ref(true)

// Activity details modal state
const selectedActivity = ref(null)
const lastFocusedBeforeModal = ref(null)
const activityModal = ref(null)
const activityCloseBtn = ref(null)

// Computed

const upcomingBookings = computed(() => {
  return bookings.value.filter(booking => {
    const activity = getActivityById(booking.activityId)
    return booking.status === 'confirmed' && activity && new Date(activity.date) > new Date()
  })
})

const pastBookings = computed(() => {
  return bookings.value.filter(booking => {
    const activity = getActivityById(booking.activityId)
    return booking.status === 'confirmed' && activity && new Date(activity.date) < new Date()
  })
})

const bookingFilters = computed(() => {
  const cancelledCount = bookings.value.filter(b => b.status === 'cancelled').length
  const activeBookingsCount = bookings.value.filter(b => b.status !== 'cancelled').length
  return [
    { id: 'all', label: 'All Bookings', count: activeBookingsCount },
    { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.value.length },
    { id: 'done', label: 'Done', count: pastBookings.value.length },
    { id: 'cancelled', label: 'Cancelled', count: cancelledCount }
  ]
})

const filteredBookings = computed(() => {
  const filterMap = {
    'upcoming': upcomingBookings.value,
    'done': pastBookings.value,
    'cancelled': bookings.value.filter(booking => booking.status === 'cancelled')
  }
  return filterMap[activeFilter.value] || bookings.value.filter(b => b.status !== 'cancelled')
})

const totalPages = computed(() => {
  return Math.ceil(filteredBookings.value.length / itemsPerPage)
})

const paginatedBookings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBookings.value.slice(start, end)
})

// Methods
const getActivityById = (activityId) => {
  return activities.value.find(activity => activity.id === activityId)
}

// Generic method to get activity property with fallback
const getActivityProperty = (activityId, property, fallback = '') => {
  const activity = getActivityById(activityId)
  return activity ? activity[property] : fallback
}

const getActivityTitle = (activityId) => getActivityProperty(activityId, 'title', 'Activity not found')
const getActivityDescription = (activityId) => getActivityProperty(activityId, 'description')
const getActivityLocation = (activityId) => getActivityProperty(activityId, 'location')
const getActivityInstructor = (activityId) => getActivityProperty(activityId, 'instructor')
const getActivityPrice = (activityId) => getActivityProperty(activityId, 'price', 0)

const formatActivityDate = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? formatDate(activity.date) : ''
}

const formatActivityTime = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? formatTime(activity.date) : ''
}

const formatBookingDate = (date) => {
  if (!date) return 'Unknown Date'

  // Handle different date formats
  let dateObj
  if (typeof date === 'string') {
    // Try parsing as ISO string first
    dateObj = new Date(date)
  } else if (date.toDate && typeof date.toDate === 'function') {
    // Handle Firestore Timestamp
    dateObj = date.toDate()
  } else {
    dateObj = new Date(date)
  }

  if (isNaN(dateObj.getTime())) {
    console.warn('Invalid date format:', date)
    return 'Invalid Date'
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusLabel = (booking) => {
  // If booking is cancelled, always show cancelled
  if (booking.status === 'cancelled') {
    return 'Cancelled'
  }

  // If booking is waitlist, always show waitlist
  if (booking.status === 'waitlist') {
    return 'Waitlist'
  }

  // For confirmed bookings, check if the activity is in the past
  if (booking.status === 'confirmed') {
    const activity = getActivityById(booking.activityId)
    if (activity && new Date(activity.date) < new Date()) {
      return 'Done'
    }
    return 'Confirmed'
  }

  return booking.status
}

const getBookingStatusClass = (booking) => {
  // If booking is cancelled, always show cancelled
  if (booking.status === 'cancelled') {
    return 'cancelled'
  }

  // If booking is waitlist, always show waitlist
  if (booking.status === 'waitlist') {
    return 'waitlist'
  }

  // For confirmed bookings, check if the activity is in the past
  if (booking.status === 'confirmed') {
    const activity = getActivityById(booking.activityId)
    if (activity && new Date(activity.date) < new Date()) {
      return 'done'
    }
    return 'confirmed'
  }

  return booking.status
}

// Activity modal helper methods
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

const canCancelBooking = (booking) => {
  if (booking.status !== 'confirmed') return false
  const activity = getActivityById(booking.activityId)
  if (!activity) return false
  return new Date(activity.date) > new Date()
}


const cancelBooking = (booking) => {
  const activity = getActivityById(booking.activityId)
  selectedBooking.value = {
    ...booking,
    activityTitle: activity ? activity.title : 'Unknown Activity'
  }
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  selectedBooking.value = null
}

const viewActivityDetails = (activityId) => {
  const activity = getActivityById(activityId)
  if (activity) selectActivity(activity)
}

// Activity details modal methods
const selectActivity = (activity) => {
  lastFocusedBeforeModal.value = document.activeElement
  selectedActivity.value = activity
  nextTick(() => {
    const btn = activityCloseBtn.value
    if (btn?.focus) btn.focus()
  })
}

const closeActivityDetails = () => {
  selectedActivity.value = null
  if (lastFocusedBeforeModal.value?.focus) {
    lastFocusedBeforeModal.value.focus()
  }
}

const hasSelectedActivity = () => {
  return selectedActivity.value !== null
}

const handleModalKeydown = (e) => {
  if (e.key === 'Escape') {
    closeActivityDetails()
    return
  }

  if (e.key === 'Tab') {
    const modal = activityModal.value
    if (!modal) return

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const [firstFocusable, lastFocusable] = [focusable[0], focusable[focusable.length - 1]]
    const activeElement = document.activeElement

    if (e.shiftKey && activeElement === firstFocusable) {
      lastFocusable.focus()
      e.preventDefault()
    } else if (!e.shiftKey && activeElement === lastFocusable) {
      firstFocusable.focus()
      e.preventDefault()
    }
  }
}


// Data loading methods
const loadBookings = async () => {
  if (!props.user) {
    bookings.value = []
    return
  }

  try {
    const q = query(collection(db, 'bookings'), where('userId', '==', props.user.uid))
    const snap = await getDocs(q)
    bookings.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Failed to load bookings:', error)
    bookings.value = []
  }
}

const loadActivities = async () => {
  try {
    const snap = await getDocs(collection(db, 'activities'))
    activities.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (error) {
    console.error('Failed to load activities:', error)
    activities.value = []
  }
}

const loadData = async () => {
  isLoading.value = true
  try {
    await Promise.all([loadBookings(), loadActivities()])
  } catch (error) {
    console.error('Failed to load data:', error)
  } finally {
    isLoading.value = false
  }
}

// Cancel booking functionality
const confirmCancelBooking = async () => {
  if (!selectedBooking.value) return

  try {
    // Update booking status to cancelled
    await updateDoc(doc(db, 'bookings', selectedBooking.value.id), {
      status: 'cancelled'
    })

    // Update activity participants count
    const activity = getActivityById(selectedBooking.value.activityId)
    if (activity) {
      await updateDoc(doc(db, 'activities', activity.id), {
        currentParticipants: Math.max(0, activity.currentParticipants - 1)
      })
    }

    // Reload data and close modal
    await loadData()
    emit('cancel-booking', selectedBooking.value)
    closeCancelModal()

    alert('Booking cancelled successfully!')

  } catch (error) {
    console.error('Failed to cancel booking:', error)
    alert('Failed to cancel booking. Please try again.')
  }
}

// Lifecycle
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.my-bookings-list {
  padding: 0;
}

/* booking-filters now uses global .toggle-tabs/.toggle-tab */
.filter-count {
  font-size: 0.75rem;
  opacity: 0.7;
}

.bookings-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Use global card styles */
.loading-state {
  text-align: center;
  padding: 3rem 1rem;
}

.loading-content {
  max-width: 400px;
  margin: 0 auto;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--forest-light);
  border-top: 4px solid var(--forest-deep);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content p {
  color: var(--text-secondary);
  font-size: 1rem;
}

.booking-date {
  flex-shrink: 0;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.activity-title {
  margin-bottom: 0.5rem;
  color: var(--forest-deep);
}

.activity-description {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.no-bookings {
  text-align: center;
  padding: 3rem 1rem;
}

.no-bookings-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-bookings-text {
  font-size: 2rem;
  font-weight: 600;
  color: var(--forest-light);
  margin-bottom: 1rem;
}

.no-bookings h3 {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.no-bookings p {
  color: var(--text-secondary);
  line-height: 1.5;
}

.no-bookings a {
  color: var(--forest-deep);
  text-decoration: none;
  font-weight: 500;
}

.no-bookings a:hover {
  text-decoration: underline;
}

.warning-text {
  color: #d32f2f;
  font-weight: 500;
  margin-bottom: 1rem;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

/* Responsive Design */
@media (max-width: 768px) {
  .booking-filters {
    justify-content: center;
  }

  .bookings-list {
    grid-template-columns: 1fr;
  }

  .booking-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
