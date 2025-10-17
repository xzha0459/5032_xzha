<template>
  <div class="activity-calendar">
    <!-- Calendar Container -->
    <div class="calendar-container">
      <FullCalendar
        ref="calendar"
        :options="calendarOptions"
        @eventClick="handleEventClick"
        @dateClick="handleDateClick"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const props = defineProps({
  activities: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['activity-selected', 'date-selected'])

// State
const calendar = ref(null)

// Calendar configuration
const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  height: 600,
  events: calendarEvents.value,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  eventDidMount: (info) => {
    // Add custom styling based on activity status
    const activity = info.event.extendedProps.activity
    if (activity) {
      const statusClass = `activity-${getActivityStatus(activity)}`
      info.el.classList.add(statusClass)
    }
  },
  dayMaxEvents: 3,
  moreLinkClick: 'popover',
  eventDisplay: 'block',
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }
}))

// Calendar events computed property
const calendarEvents = computed(() => {
  return props.activities
    .map(activity => {
      const startDate = new Date(activity.date)
      const endDate = new Date(startDate.getTime() + (activity.duration * 60000)) // duration in minutes

            return {
              id: activity.id,
              title: activity.title,
              start: startDate,
              end: endDate,
              backgroundColor: getEventColor(activity),
              borderColor: getEventColor(activity),
              textColor: '#ffffff',
              extendedProps: {
                activity: activity,
                location: activity.location,
                instructor: activity.instructor,
                price: activity.price,
                status: activity.status,
                type: activity.type,
                description: activity.description,
                maxParticipants: activity.maxParticipants,
                currentParticipants: activity.currentParticipants
              }
            }
    })
    .filter(event => event !== null)
})

// Get activity status using same logic as ActivityListSection
const getActivityStatus = (activity) => {
  const now = new Date()
  const activityDate = new Date(activity.date)

  if (activity.status === 'cancelled') return 'cancelled'
  if (activityDate < now) return 'past'
  if (activity.currentParticipants >= activity.maxParticipants) return 'full'
  return 'active'
}

// Get event color based on activity status (same as ActivityListSection)
const getEventColor = (activity) => {
  const status = getActivityStatus(activity)

  const colors = {
    'active': '#10b981',    // green
    'full': '#f59e0b',      // orange/amber
    'past': '#6b7280',      // gray
    'cancelled': '#ef4444'  // red
  }

  return colors[status] || '#3b82f6' // default blue
}

// Handle event click
const handleEventClick = (info) => {
  const activity = info.event.extendedProps.activity
  if (activity) {
    emit('activity-selected', activity)
  }
}

// Handle date click
const handleDateClick = (info) => {
  emit('date-selected', info.date)
}

// Lifecycle
onMounted(() => {
  // Calendar will automatically render with the events
})
</script>

<style scoped>

</style>
