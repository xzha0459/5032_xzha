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
            <option value="past">Past</option>
          </select>
        </div>
      </div>
    </div>

    <div v-if="filteredActivities.length > 0" class="activities-grid">
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
        </div>

        <div class="card-footer">
          <button class="btn secondary" @click.stop="selectActivity(activity)">
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
    <div v-if="totalPages > 1" class="pagination">
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

const emit = defineEmits(['show-activity-details'])

// State
const selectedType = ref('all')
const selectedStatus = ref('all')
const currentPage = ref(1)
const itemsPerPage = 6

// Helper function for status priority
const getStatusPriority = (activity) => {
  const now = new Date()
  const activityDate = new Date(activity.date)
  if (activity.status === 'cancelled') return 3
  if (activityDate < now) return 2 // Past
  if (activity.status === 'active' &&
      activity.currentParticipants < activity.maxParticipants) return 0 // Active
  return 1 // Full
}

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
        case 'past':
          return activityDate < now
        default:
          return true
      }
    })
  }

  // Sort by status priority (Active first), then by date
  return filtered.sort((a, b) => {
    const aDate = new Date(a.date)
    const bDate = new Date(b.date)

    const aPriority = getStatusPriority(a)
    const bPriority = getStatusPriority(b)

    // First sort by priority, then by date
    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    return aDate - bDate
  })
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

const selectActivity = (activity) => {
  emit('show-activity-details', activity)
}

// Expose methods for parent component
defineExpose({
  selectActivity
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
