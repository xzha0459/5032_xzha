<template>
  <div class="activity-management-section">
    <div class="section-header">
      <h2 class="section-title">Activity Management</h2>
      <button class="btn primary" @click="openCreateModal">
        <span class="btn-icon">+</span>
        Create Activity
      </button>
    </div>

    <!-- Management Stats -->
    <div class="management-stats">
      <div class="stat-card">
        <div class="stat-number">{{ activities.length }}</div>
        <div class="stat-label">Total Activities</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ activeActivities.length }}</div>
        <div class="stat-label">Active</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ totalBookings }}</div>
        <div class="stat-label">Total Bookings</div>
      </div>
      <div class="stat-card">
        <div class="stat-number">{{ upcomingActivities.length }}</div>
        <div class="stat-label">Upcoming</div>
      </div>
    </div>

    <!-- Activities Table -->
    <div class="activities-table-container">
      <div class="table-header">
        <h3>All Activities</h3>
        <div class="table-controls">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search activities..."
            class="search-input"
          />
          <select v-model="statusFilter" class="filter-select">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div class="table-wrapper">
        <table class="activities-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Type</th>
              <th>Date & Time</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in filteredActivities" :key="activity.id">
              <td class="activity-info">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-location">{{ activity.location }}</div>
              </td>
              <td>
                <span class="booking-tag" :class="activity.type">
                  {{ getTypeLabel(activity.type) }}
                </span>
              </td>
              <td>
                <div class="date-time">
                  <div>{{ formatDate(activity.date) }}</div>
                  <div class="time">{{ formatTime(activity.date) }}</div>
                </div>
              </td>
              <td>
                <div class="participants">
                  <div class="participant-count">
                    {{ activity.currentParticipants }}/{{ activity.maxParticipants }}
                  </div>
                  <div class="participant-bar">
                    <div
                      class="participant-fill"
                      :style="{ width: getParticipantPercentage(activity) + '%' }"
                    ></div>
                  </div>
                </div>
              </td>
              <td>
                <span class="booking-tag" :class="getStatusClass(activity)">
                  {{ getStatusText(activity) }}
                </span>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="btn-icon-btn"
                    @click="editActivity(activity)"
                    title="Edit Activity"
                  >
                    ✏️
                  </button>
                  <button
                    class="btn-icon-btn"
                    @click="viewBookings(activity)"
                    title="View Bookings"
                  >
                    👥
                  </button>
                  <button
                    class="btn-icon-btn danger"
                    @click="deleteActivity(activity)"
                    title="Delete Activity"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Activity Modal -->
    <div v-if="showActivityModal" class="modal-overlay" @click="closeActivityModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ isEditing ? 'Edit Activity' : 'Create Activity' }}</h2>
          <button class="close-button" @click="closeActivityModal">×</button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveActivity">
            <div class="form-grid">
              <div class="form-group">
                <label for="title">Activity Title *</label>
                <input
                  id="title"
                  v-model="activityForm.title"
                  type="text"
                  required
                  class="input"
                  placeholder="Enter activity title"
                />
              </div>

              <div class="form-group">
                <label for="type">Activity Type *</label>
                <select id="type" v-model="activityForm.type" required class="input">
                  <option value="">Select type</option>
                  <option value="lecture">Lecture</option>
                  <option value="support-group">Support Group</option>
                  <option value="meditation">Meditation</option>
                  <option value="art-therapy">Art Therapy</option>
                  <option value="exercise">Exercise</option>
                  <option value="social">Social Event</option>
                </select>
              </div>

              <div class="form-group">
                <label for="date">Date *</label>
                <input
                  id="date"
                  v-model="activityForm.date"
                  type="date"
                  required
                  class="input"
                />
              </div>

              <div class="form-group">
                <label for="time">Time *</label>
                <input
                  id="time"
                  v-model="activityForm.time"
                  type="time"
                  required
                  class="input"
                />
              </div>

              <div class="form-group">
                <label for="duration">Duration (minutes) *</label>
                <input
                  id="duration"
                  v-model="activityForm.duration"
                  type="number"
                  min="15"
                  max="480"
                  required
                  class="input"
                />
              </div>

              <div class="form-group">
                <label for="maxParticipants">Max Participants *</label>
                <input
                  id="maxParticipants"
                  v-model="activityForm.maxParticipants"
                  type="number"
                  min="1"
                  max="100"
                  required
                  class="input"
                />
              </div>

              <div class="form-group">
                <label for="location">Location *</label>
                <input
                  id="location"
                  v-model="activityForm.location"
                  type="text"
                  required
                  class="input"
                  placeholder="Enter location"
                />
              </div>

              <div class="form-group">
                <label for="instructor">Instructor *</label>
                <input
                  id="instructor"
                  v-model="activityForm.instructor"
                  type="text"
                  required
                  class="input"
                  placeholder="Enter instructor name"
                />
              </div>

              <div class="form-group">
                <label for="price">Price ($)</label>
                <input
                  id="price"
                  v-model="activityForm.price"
                  type="number"
                  min="0"
                  step="0.01"
                  class="input"
                />
              </div>

              <div class="form-group">
                <label for="status">Status</label>
                <select id="status" v-model="activityForm.status" class="input">
                  <option value="active">Active</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                id="description"
                v-model="activityForm.description"
                required
                rows="4"
                class="input"
                placeholder="Enter activity description"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="requirements">Requirements (one per line)</label>
              <textarea
                id="requirements"
                v-model="requirementsText"
                rows="3"
                class="input"
                placeholder="Enter requirements, one per line"
              ></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn secondary" @click="closeActivityModal">
                Cancel
              </button>
              <button type="submit" class="btn primary" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : (isEditing ? 'Update Activity' : 'Create Activity') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Bookings Modal -->
    <div v-if="showBookingsModal" class="modal-overlay" @click="closeBookingsModal">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h2>Bookings for {{ selectedActivity?.title }}</h2>
          <button class="close-button" @click="closeBookingsModal">×</button>
        </div>
        <div class="modal-body">
          <div class="bookings-list">
            <div
              v-for="booking in activityBookings"
              :key="booking.id"
              class="booking-item"
            >
              <div class="booking-info">
                <div class="booking-user">{{ booking.userEmail || 'User ' + booking.userId }}</div>
                <div class="booking-date">Booked: {{ formatBookingDate(booking.bookingDate) }}</div>
                <div class="booking-tag" :class="booking.status">
                  {{ getStatusLabel(booking.status) }}
                </div>
              </div>
              <div class="card-note" v-if="booking.notes">
                <strong>Notes:</strong> {{ booking.notes }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => []
  },
  bookings: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['activity-updated', 'activity-created', 'activity-deleted'])

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const showActivityModal = ref(false)
const showBookingsModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const selectedActivity = ref(null)

// Form data
const activityForm = reactive({
  title: '',
  description: '',
  type: '',
  date: '',
  time: '',
  duration: 60,
  location: '',
  instructor: '',
  maxParticipants: 20,
  price: 0,
  status: 'active',
  requirements: []
})

const requirementsText = ref('')

// Computed
const activeActivities = computed(() => {
  return props.activities.filter(activity => activity.status === 'active')
})

const upcomingActivities = computed(() => {
  return props.activities.filter(activity => {
    return activity.status === 'active' && new Date(activity.date) > new Date()
  })
})

const totalBookings = computed(() => {
  return props.bookings.length
})

const filteredActivities = computed(() => {
  let filtered = props.activities

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(activity =>
      activity.title.toLowerCase().includes(query) ||
      activity.description.toLowerCase().includes(query) ||
      activity.instructor.toLowerCase().includes(query) ||
      activity.location.toLowerCase().includes(query)
    )
  }

  // Status filter
  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(activity => activity.status === statusFilter.value)
  }

  return filtered.sort((a, b) => new Date(a.date) - new Date(b.date))
})

const activityBookings = computed(() => {
  if (!selectedActivity.value) return []
  return props.bookings.filter(booking => booking.activityId === selectedActivity.value.id)
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
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

const getParticipantPercentage = (activity) => {
  return Math.round((activity.currentParticipants / activity.maxParticipants) * 100)
}

const getStatusClass = (activity) => {
  if (activity.status !== 'active') return 'cancelled'
  if (activity.currentParticipants >= activity.maxParticipants) return 'full'
  if (activity.date < new Date()) return 'past'
  return 'active'
}

const getStatusText = (activity) => {
  if (activity.status !== 'active') return 'Cancelled'
  if (activity.currentParticipants >= activity.maxParticipants) return 'Full'
  if (activity.date < new Date()) return 'Past'
  return 'Active'
}

const getStatusLabel = (status) => {
  const labels = {
    'confirmed': 'Confirmed',
    'cancelled': 'Cancelled',
    'waitlist': 'Waitlist'
  }
  return labels[status] || status
}

const openCreateModal = () => {
  resetForm()
  isEditing.value = false
  showActivityModal.value = true
}

const editActivity = (activity) => {
  // Populate form with activity data
  Object.assign(activityForm, {
    ...activity,
    date: new Date(activity.date).toISOString().split('T')[0],
    time: new Date(activity.date).toTimeString().slice(0, 5)
  })
  requirementsText.value = activity.requirements ? activity.requirements.join('\n') : ''
  isEditing.value = true
  showActivityModal.value = true
}

const deleteActivity = (activity) => {
  if (confirm(`Are you sure you want to delete "${activity.title}"?`)) {
    emit('activity-deleted', activity.id)
  }
}

const viewBookings = (activity) => {
  selectedActivity.value = activity
  showBookingsModal.value = true
}

const closeActivityModal = () => {
  showActivityModal.value = false
  resetForm()
}

const closeBookingsModal = () => {
  showBookingsModal.value = false
  selectedActivity.value = null
}

const resetForm = () => {
  Object.assign(activityForm, {
    title: '',
    description: '',
    type: '',
    date: '',
    time: '',
    duration: 60,
    location: '',
    instructor: '',
    maxParticipants: 20,
    price: 0,
    status: 'active',
    requirements: []
  })
  requirementsText.value = ''
}

const saveActivity = async () => {
  isSaving.value = true

  try {
    // Parse requirements
    const requirements = requirementsText.value
      .split('\n')
      .map(req => req.trim())
      .filter(req => req.length > 0)

    // Combine date and time
    const dateTime = new Date(`${activityForm.date}T${activityForm.time}`)

    const activityData = {
      ...activityForm,
      date: dateTime.toISOString(),
      requirements,
      currentParticipants: isEditing.value ? activityForm.currentParticipants || 0 : 0
    }

    if (isEditing.value) {
      emit('activity-updated', activityData)
    } else {
      emit('activity-created', activityData)
    }

    closeActivityModal()
  } catch (error) {
    console.error('Error saving activity:', error)
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
.activity-management-section {
  padding: 0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.btn-icon {
  margin-right: 0.5rem;
}

.management-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: var(--forest-deep);
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.activities-table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-light);
  flex-wrap: wrap;
  gap: 1rem;
}

.table-header h3 {
  margin: 0;
  color: var(--forest-deep);
}

.table-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-input {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  min-width: 200px;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
}

.table-wrapper {
  overflow-x: auto;
}

.activities-table {
  width: 100%;
  border-collapse: collapse;
}

.activities-table th {
  background: var(--forest-light);
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--forest-deep);
  border-bottom: 1px solid var(--border-light);
}

.activities-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--border-light);
  vertical-align: top;
}

.activities-table tr:hover {
  background: var(--forest-light);
}

.activity-info {
  min-width: 200px;
}

.activity-title {
  font-weight: 600;
  color: var(--forest-deep);
  margin-bottom: 0.25rem;
}

.activity-location {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* removed local .type-badge styles; using global .booking-tag */

.date-time {
  font-size: 0.875rem;
}

.time {
  color: var(--text-secondary);
}

.participants {
  min-width: 120px;
}

.participant-count {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.participant-bar {
  height: 4px;
  background: #e0e0e0;
  border-radius: 2px;
  overflow: hidden;
}

.participant-fill {
  height: 100%;
  background: var(--forest-medium);
  transition: width 0.3s ease;
}

/* removed local .status-badge styles; using global .booking-tag */

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon-btn {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon-btn:hover {
  background: var(--forest-light);
}

.btn-icon-btn.danger:hover {
  background: #ffebee;
  border-color: #d32f2f;
}

.large-modal {
  max-width: 800px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--forest-deep);
}

.bookings-list {
  max-height: 400px;
  overflow-y: auto;
}

.booking-item {
  padding: 1rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.booking-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.booking-user {
  font-weight: 600;
  color: var(--forest-deep);
}

.booking-date {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* moved to global: .booking-tag */

.booking-notes {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .management-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .table-controls {
    flex-direction: column;
  }

  .search-input {
    min-width: auto;
  }

  .activities-table {
    font-size: 0.875rem;
  }

  .activities-table th,
  .activities-table td {
    padding: 0.5rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .booking-info {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
