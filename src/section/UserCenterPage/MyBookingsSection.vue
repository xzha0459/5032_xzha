<template>
  <div class="my-bookings-section">
    <div class="section-header">
      <h2 class="section-title">My Bookings</h2>
      <div class="booking-stats">
        <div class="stat-item">
          <span class="stat-number">{{ confirmedBookings.length }}</span>
          <span class="stat-label">Confirmed</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ upcomingBookings.length }}</span>
          <span class="stat-label">Upcoming</span>
        </div>
        <div class="stat-item">
          <span class="stat-number">{{ pastBookings.length }}</span>
          <span class="stat-label">Past</span>
        </div>
      </div>
    </div>

    <!-- Filter Tabs -->
    <div class="booking-filters">
      <button
        v-for="filter in bookingFilters"
        :key="filter.id"
        :class="['filter-tab', { active: activeFilter === filter.id }]"
        @click="activeFilter = filter.id"
      >
        {{ filter.label }}
        <span class="filter-count">({{ filter.count }})</span>
      </button>
    </div>

    <!-- Bookings List -->
    <div class="bookings-list" v-if="filteredBookings.length > 0">
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
          <div class="booking-tag" :class="booking.status">
            {{ getStatusLabel(booking.status) }}
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

            <div class="card-note" v-if="booking.notes">
              <h4>Your Notes:</h4>
              <p>{{ booking.notes }}</p>
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
              class="btn danger"
              @click="cancelBooking(booking)"
            >
              Cancel Booking
            </button>

            <button
              v-if="isPastBooking(booking)"
              class="btn primary"
              @click="rateActivity(booking)"
            >
              Rate Activity
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No bookings found -->
    <div v-else class="no-bookings">
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
import { ref, computed } from 'vue'

const props = defineProps({
  bookings: {
    type: Array,
    required: true,
    default: () => []
  },
  activities: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['cancel-booking', 'switch-tab'])

// State
const activeFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 8
const showCancelModal = ref(false)
const selectedBooking = ref(null)

// Computed
const confirmedBookings = computed(() => {
  return props.bookings.filter(booking => booking.status === 'confirmed')
})

const upcomingBookings = computed(() => {
  return props.bookings.filter(booking => {
    const activity = getActivityById(booking.activityId)
    return booking.status === 'confirmed' && activity && new Date(activity.date) > new Date()
  })
})

const pastBookings = computed(() => {
  return props.bookings.filter(booking => {
    const activity = getActivityById(booking.activityId)
    return activity && new Date(activity.date) < new Date()
  })
})

const bookingFilters = computed(() => [
  { id: 'all', label: 'All Bookings', count: props.bookings.length },
  { id: 'confirmed', label: 'Confirmed', count: confirmedBookings.value.length },
  { id: 'upcoming', label: 'Upcoming', count: upcomingBookings.value.length },
  { id: 'past', label: 'Past', count: pastBookings.value.length },
  { id: 'cancelled', label: 'Cancelled', count: props.bookings.filter(b => b.status === 'cancelled').length }
])

const filteredBookings = computed(() => {
  switch (activeFilter.value) {
    case 'confirmed':
      return confirmedBookings.value
    case 'upcoming':
      return upcomingBookings.value
    case 'past':
      return pastBookings.value
    case 'cancelled':
      return props.bookings.filter(booking => booking.status === 'cancelled')
    default:
      return props.bookings
  }
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
  return props.activities.find(activity => activity.id === activityId)
}

const getActivityTitle = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.title : 'Activity not found'
}

const getActivityDescription = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.description : ''
}

const getActivityLocation = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.location : ''
}

const getActivityInstructor = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.instructor : ''
}

const getActivityPrice = (activityId) => {
  const activity = getActivityById(activityId)
  return activity ? activity.price : 0
}

const formatActivityDate = (activityId) => {
  const activity = getActivityById(activityId)
  if (!activity) return ''
  return new Date(activity.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatActivityTime = (activityId) => {
  const activity = getActivityById(activityId)
  if (!activity) return ''
  return new Date(activity.date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatBookingDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getStatusLabel = (status) => {
  const labels = {
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled',
    'waitlist': 'Waitlist'
  }
  return labels[status] || status
}

const canCancelBooking = (booking) => {
  if (booking.status !== 'confirmed') return false
  const activity = getActivityById(booking.activityId)
  if (!activity) return false
  return new Date(activity.date) > new Date()
}

const isPastBooking = (booking) => {
  const activity = getActivityById(booking.activityId)
  if (!activity) return false
  return new Date(activity.date) < new Date()
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

const confirmCancelBooking = () => {
  if (selectedBooking.value) {
    emit('cancel-booking', selectedBooking.value)
    closeCancelModal()
  }
}

const viewActivityDetails = (activityId) => {
  // TODO: Implement activity details modal
  console.log('View activity details:', activityId)
}

const rateActivity = (booking) => {
  // TODO: Implement rating modal
  console.log('Rate activity:', booking)
}
</script>

<style scoped>
.my-bookings-section {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.booking-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--forest-deep);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.booking-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
}

.filter-tab {
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-tab:hover {
  color: var(--forest-medium);
  background: var(--forest-light);
}

.filter-tab.active {
  color: var(--forest-deep);
  border-bottom-color: var(--forest-deep);
  background: var(--forest-light);
}

.filter-count {
  font-size: 0.75rem;
  opacity: 0.7;
}

.bookings-list {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

/* Use global card styles */



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


/* moved to global: .card-note */

/* removed local .booking-footer and .booking-actions styles; using global .card-footer and .card-action */

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
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .booking-stats {
    justify-content: center;
  }

  .booking-filters {
    justify-content: center;
  }

  .booking-actions {
    flex-direction: column;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
