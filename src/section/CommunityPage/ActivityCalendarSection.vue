<template>
  <div class="activity-calendar-section">
    <div class="section-header">
      <h2 class="section-title">Activity Calendar</h2>
      <div class="calendar-controls">
        <button class="btn secondary" @click="goToToday">Today</button>
        <button class="btn secondary" @click="previousMonth">← Previous</button>
        <span class="current-month">{{ currentMonthYear }}</span>
        <button class="btn secondary" @click="nextMonth">Next →</button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-container">
      <div class="calendar-header">
        <div class="day-header" v-for="day in weekDays" :key="day">
          {{ day }}
        </div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="day in calendarDays"
          :key="day.date"
          class="calendar-day"
          :class="{
            'other-month': !day.isCurrentMonth,
            'today': day.isToday,
            'has-activities': day.activities.length > 0
          }"
          @click="selectDay(day)"
        >
          <div class="day-number">{{ day.dayNumber }}</div>

          <div class="day-activities" v-if="day.activities.length > 0">
            <div
              v-for="activity in day.activities.slice(0, 3)"
              :key="activity.id"
              class="activity-indicator"
              :class="activity.type"
              :title="activity.title"
              @click.stop="selectActivity(activity)"
            >
              {{ activity.title.substring(0, 10) }}...
            </div>
            <div v-if="day.activities.length > 3" class="more-activities">
              +{{ day.activities.length - 3 }} more
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Selected Day Activities -->
    <div v-if="selectedDay && selectedDay.activities.length > 0" class="selected-day-activities">
      <h3>{{ formatSelectedDay(selectedDay.date) }}</h3>
      <div class="day-activities-list">
        <div
          v-for="activity in selectedDay.activities"
          :key="activity.id"
          class="card activity-summary"
        >
          <div class="activity-summary-header">
            <div class="activity-type-badge" :class="activity.type">
              {{ getTypeLabel(activity.type) }}
            </div>
            <div class="activity-time">
              {{ formatTime(activity.date) }}
            </div>
          </div>

          <div class="activity-summary-body">
            <h4>{{ activity.title }}</h4>
            <p>{{ activity.description }}</p>
            <div class="activity-meta">
              <span>📍 {{ activity.location }}</span>
              <span>👥 {{ activity.currentParticipants }}/{{ activity.maxParticipants }}</span>
              <span v-if="activity.price > 0">💰 ${{ activity.price }}</span>
              <span v-else>🆓 Free</span>
            </div>
          </div>

          <div class="activity-summary-footer">
            <button
              class="btn primary"
              :disabled="!canBookActivity(activity)"
              @click="bookActivity(activity)"
            >
              {{ getBookingButtonText(activity) }}
            </button>
            <button class="btn secondary" @click="viewActivityDetails(activity)">
              Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No activities for selected day -->
    <div v-else-if="selectedDay" class="no-activities-day">
      <div class="card">
        <h3>{{ formatSelectedDay(selectedDay.date) }}</h3>
        <p>No activities scheduled for this day.</p>
      </div>
    </div>

    <!-- Legend -->
    <div class="calendar-legend">
      <h4>Activity Types:</h4>
      <div class="legend-items">
        <div class="legend-item" v-for="type in activityTypes" :key="type.id">
          <div class="legend-color" :class="type.id"></div>
          <span>{{ type.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

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

const emit = defineEmits(['book-activity'])

// State
const currentDate = ref(new Date())
const selectedDay = ref(null)

// Constants
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const activityTypes = [
  { id: 'lecture', label: 'Lecture' },
  { id: 'support-group', label: 'Support Group' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'art-therapy', label: 'Art Therapy' },
  { id: 'exercise', label: 'Exercise' },
  { id: 'social', label: 'Social Event' }
]

// Computed
const currentMonthYear = computed(() => {
  return currentDate.value.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  // First day of the month
  const firstDay = new Date(year, month, 1)

  // Start from Sunday of the first week
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const days = []
  const today = new Date()

  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)

    const dayNumber = date.getDate()
    const isCurrentMonth = date.getMonth() === month
    const isToday = date.toDateString() === today.toDateString()

    // Get activities for this day
    const dayActivities = props.activities.filter(activity => {
      const activityDate = new Date(activity.date)
      return activityDate.toDateString() === date.toDateString()
    })

    days.push({
      date: date.toISOString(),
      dayNumber,
      isCurrentMonth,
      isToday,
      activities: dayActivities
    })
  }

  return days
})

// Methods
const goToToday = () => {
  currentDate.value = new Date()
  selectedDay.value = null
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
  selectedDay.value = null
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  selectedDay.value = null
}

const selectDay = (day) => {
  selectedDay.value = day
}

const selectActivity = (activity) => {
  // Find the day containing this activity
  const day = calendarDays.value.find(d =>
    d.activities.some(a => a.id === activity.id)
  )
  if (day) {
    selectedDay.value = day
  }
}

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

const formatSelectedDay = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
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

const bookActivity = (activity) => {
  if (canBookActivity(activity)) {
    emit('book-activity', activity)
  }
}

const viewActivityDetails = (activity) => {
  // TODO: Implement activity details modal
  console.log('View details for:', activity)
}

onMounted(() => {
  // Initialize with today's date
  goToToday()
})
</script>

<style scoped>
.activity-calendar-section {
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

.calendar-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-month {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--forest-deep);
  min-width: 150px;
  text-align: center;
}

.calendar-container {
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.calendar-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background: var(--forest-light);
}

.day-header {
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  color: var(--forest-deep);
  border-right: 1px solid var(--border-light);
}

.day-header:last-child {
  border-right: none;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.calendar-day {
  min-height: 120px;
  padding: 0.5rem;
  border-right: 1px solid var(--border-light);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background-color 0.2s ease;
  position: relative;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day:hover {
  background: var(--forest-light);
}

.calendar-day.other-month {
  background: #f8f9fa;
  color: var(--text-secondary);
}

.calendar-day.today {
  background: var(--forest-light);
  font-weight: 600;
}

.calendar-day.today .day-number {
  background: var(--forest-deep);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-number {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.day-activities {
  position: absolute;
  bottom: 0.25rem;
  left: 0.25rem;
  right: 0.25rem;
}

.activity-indicator {
  font-size: 0.7rem;
  padding: 0.125rem 0.25rem;
  margin-bottom: 0.125rem;
  border-radius: 3px;
  background: var(--forest-medium);
  color: white;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-indicator.lecture {
  background: var(--forest-deep);
}

.activity-indicator.support-group {
  background: #1976d2;
}

.activity-indicator.meditation {
  background: #7b1fa2;
}

.activity-indicator.art-therapy {
  background: #f57c00;
}

.activity-indicator.exercise {
  background: #388e3c;
}

.activity-indicator.social {
  background: #c2185b;
}

.more-activities {
  font-size: 0.7rem;
  color: var(--text-secondary);
  text-align: center;
  font-style: italic;
}

.selected-day-activities {
  margin-bottom: 2rem;
}

.selected-day-activities h3 {
  color: var(--forest-deep);
  margin-bottom: 1rem;
}

.day-activities-list {
  display: grid;
  gap: 1rem;
}

.activity-summary {
  border-left: 4px solid var(--forest-medium);
}

.activity-summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.activity-type-badge.lecture {
  background: var(--forest-light);
  color: var(--forest-deep);
}

.activity-type-badge.support-group {
  background: #e3f2fd;
  color: #1976d2;
}

.activity-type-badge.meditation {
  background: #f3e5f5;
  color: #7b1fa2;
}

.activity-type-badge.art-therapy {
  background: #fff3e0;
  color: #f57c00;
}

.activity-type-badge.exercise {
  background: #e8f5e8;
  color: #388e3c;
}

.activity-type-badge.social {
  background: #fce4ec;
  color: #c2185b;
}

.activity-time {
  font-weight: 600;
  color: var(--forest-deep);
}

.activity-summary-body h4 {
  margin-bottom: 0.5rem;
  color: var(--forest-deep);
}

.activity-summary-body p {
  color: var(--text-secondary);
  margin-bottom: 1rem;
  line-height: 1.5;
}

.activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.activity-summary-footer {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.activity-summary-footer .btn {
  flex: 1;
}

.no-activities-day {
  text-align: center;
  padding: 2rem;
}

.no-activities-day .card {
  max-width: 400px;
  margin: 0 auto;
}

.no-activities-day h3 {
  color: var(--text-secondary);
  margin-bottom: 1rem;
}

.no-activities-day p {
  color: var(--text-secondary);
}

.calendar-legend {
  background: white;
  padding: 1.5rem;
  border: 1px solid var(--border-light);
  border-radius: 8px;
}

.calendar-legend h4 {
  margin-bottom: 1rem;
  color: var(--forest-deep);
}

.legend-items {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.lecture {
  background: var(--forest-deep);
}

.legend-color.support-group {
  background: #1976d2;
}

.legend-color.meditation {
  background: #7b1fa2;
}

.legend-color.art-therapy {
  background: #f57c00;
}

.legend-color.exercise {
  background: #388e3c;
}

.legend-color.social {
  background: #c2185b;
}

/* Responsive Design */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .calendar-controls {
    justify-content: center;
  }

  .calendar-day {
    min-height: 80px;
    padding: 0.25rem;
  }

  .day-number {
    font-size: 0.75rem;
  }

  .activity-indicator {
    font-size: 0.6rem;
    padding: 0.1rem 0.2rem;
  }

  .activity-summary-footer {
    flex-direction: column;
  }

  .legend-items {
    justify-content: center;
  }
}
</style>
