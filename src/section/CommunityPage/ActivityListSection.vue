<template>
  <div class="activity-list-section">
    <div class="section-header">
      <h2 class="section-title">Community Activities</h2>
      <div class="section-controls">
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
            <option value="all">All</option>
            <option value="active">Available</option>
            <option value="full">Full</option>
            <option value="upcoming">Upcoming</option>
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

          <div class="card-note" v-if="activity.requirements && activity.requirements.length > 0">
            <h4>Requirements:</h4>
            <ul>
              <li v-for="requirement in activity.requirements" :key="requirement">
                {{ requirement }}
              </li>
            </ul>
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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['activity-selected', 'book-activity'])

// State
const selectedType = ref('all')
const selectedStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6

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
      switch (selectedStatus.value) {
        case 'active':
          return activity.status === 'active' && activity.currentParticipants < activity.maxParticipants
        case 'full':
          return activity.status === 'active' && activity.currentParticipants >= activity.maxParticipants
        case 'upcoming':
          return activity.date > new Date()
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
  if (activity.status !== 'active') return 'cancelled'
  if (activity.currentParticipants >= activity.maxParticipants) return 'full'
  if (activity.date < new Date()) return 'past'
  return 'available'
}

const getStatusText = (activity) => {
  if (activity.status !== 'active') return 'Cancelled'
  if (activity.currentParticipants >= activity.maxParticipants) return 'Full'
  if (activity.date < new Date()) return 'Past'
  return 'Available'
}

const canBookActivity = (activity) => {
  return activity.status === 'active' &&
         activity.currentParticipants < activity.maxParticipants &&
         activity.date > new Date()
}

const getBookingButtonText = (activity) => {
  if (activity.status !== 'active') return 'Cancelled'
  if (activity.currentParticipants >= activity.maxParticipants) return 'Full'
  if (activity.date < new Date()) return 'Past Event'
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
  emit('activity-selected', activity)
}

const bookActivity = (activity) => {
  if (canBookActivity(activity)) {
    emit('book-activity', activity)
  }
}

const viewDetails = (activity) => {
  // TODO: Implement activity details modal
  console.log('View details for:', activity)
}
</script>

<style scoped>
.activity-list-section {
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

.section-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.filter {
  padding: 0.5rem;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  background: white;
  font-size: 0.875rem;
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


/* removed local .activity-requirements styles; using global .card-note */
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
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .section-controls {
    justify-content: center;
  }

  .activities-grid {
    grid-template-columns: 1fr;
  }
}
</style>
