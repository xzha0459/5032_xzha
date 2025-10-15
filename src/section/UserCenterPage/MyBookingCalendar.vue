<template>
  <div class="my-booking-calendar">
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
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/firebase.js'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['booking-selected', 'date-selected'])

// State
const bookings = ref([])
const activities = ref([])
const isLoading = ref(true)
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
  height: 'auto',
  events: calendarEvents.value,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  eventDidMount: (info) => {
    // Add custom styling based on booking status
    const booking = info.event.extendedProps.booking
    if (booking) {
      const statusClass = `booking-${booking.status}`
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
  return bookings.value
    .filter(booking => booking.status !== 'cancelled') // 过滤掉已取消的预约
    .map(booking => {
      const activity = getActivityById(booking.activityId)
      if (!activity) return null

      const startDate = new Date(activity.date)
      const endDate = new Date(startDate.getTime() + (activity.duration * 60000)) // duration in minutes

      // Check for conflicts
      const hasConflict = checkBookingConflict(booking, startDate, endDate)

      return {
        id: booking.id,
        title: activity.title,
        start: startDate,
        end: endDate,
        backgroundColor: getEventColor(booking.status),
        borderColor: getEventColor(booking.status),
        textColor: '#ffffff',
        classNames: hasConflict ? ['booking-conflict'] : [],
        extendedProps: {
          booking: booking,
          activity: activity,
          location: activity.location,
          instructor: activity.instructor,
          price: activity.price,
          status: booking.status,
          hasConflict: hasConflict
        }
      }
    }).filter(Boolean)
})

// Check for booking conflicts
const checkBookingConflict = (currentBooking, startDate, endDate) => {
  // Check if there are other bookings that overlap with this one
  const conflictingBookings = bookings.value.filter(booking => {
    if (booking.id === currentBooking.id || booking.status === 'cancelled') {
      return false
    }

    const activity = getActivityById(booking.activityId)
    if (!activity) return false

    const bookingStartDate = new Date(activity.date)
    const bookingEndDate = new Date(bookingStartDate.getTime() + (activity.duration * 60000))

    // Check for time overlap
    return (startDate < bookingEndDate && endDate > bookingStartDate)
  })

  return conflictingBookings.length > 0
}

// Get conflicting bookings for a specific booking
const getConflictingBookings = (booking) => {
  const activity = getActivityById(booking.activityId)
  if (!activity) return []

  const startDate = new Date(activity.date)
  const endDate = new Date(startDate.getTime() + (activity.duration * 60000))

  return bookings.value.filter(otherBooking => {
    if (otherBooking.id === booking.id || otherBooking.status === 'cancelled') {
      return false
    }

    const otherActivity = getActivityById(otherBooking.activityId)
    if (!otherActivity) return false

    const otherStartDate = new Date(otherActivity.date)
    const otherEndDate = new Date(otherStartDate.getTime() + (otherActivity.duration * 60000))

    return (startDate < otherEndDate && endDate > otherStartDate)
  })
}

// Get event color based on booking status
const getEventColor = (status) => {
  const colors = {
    'confirmed': '#28a745',    // Green
    'cancelled': '#dc3545',    // Red
    'waitlist': '#ffc107'      // Yellow
  }
  return colors[status] || '#6c757d' // Default gray
}

// Calendar event handlers
const handleEventClick = (info) => {
  const booking = info.event.extendedProps.booking
  const activity = info.event.extendedProps.activity
  const hasConflict = info.event.extendedProps.hasConflict

  // Emit event to parent component
  emit('booking-selected', {
    booking,
    activity,
    hasConflict,
    conflictingBookings: hasConflict ? getConflictingBookings(booking) : []
  })
}

const handleDateClick = (info) => {
  // Check if there are any activities available on this date
  const clickedDate = new Date(info.dateStr)
  const availableActivities = activities.value.filter(activity => {
    const activityDate = new Date(activity.date)
    return activityDate.toDateString() === clickedDate.toDateString() &&
           activity.status === 'active' &&
           activity.currentParticipants < activity.maxParticipants
  })

  // Emit event to parent component
  emit('date-selected', {
    date: info.dateStr,
    availableActivities
  })
}

// Helper methods
const getActivityById = (activityId) => {
  return activities.value.find(activity => activity.id === activityId)
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

// Lifecycle
onMounted(() => {
  loadData()
})

// Expose methods for parent component
defineExpose({
  refreshData: loadData,
  isLoading
})
</script>

<style scoped>
.my-booking-calendar {
  width: 100%;
}

.calendar-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* FullCalendar Custom Styles */
:deep(.fc) {
  font-family: inherit;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--forest-deep);
}

:deep(.fc-button) {
  background: var(--forest-medium);
  border-color: var(--forest-medium);
  color: white;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s ease;
}

:deep(.fc-button:hover) {
  background: var(--forest-deep);
  border-color: var(--forest-deep);
}

:deep(.fc-button:focus) {
  box-shadow: 0 0 0 3px rgba(34, 139, 34, 0.2);
}

:deep(.fc-button-primary:not(:disabled):active) {
  background: var(--forest-deep);
  border-color: var(--forest-deep);
}

:deep(.fc-daygrid-event) {
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
}

:deep(.fc-event-title) {
  font-weight: 600;
}

/* Booking Status Colors in Calendar */
:deep(.booking-confirmed) {
  background-color: #28a745 !important;
  border-color: #28a745 !important;
}

:deep(.booking-cancelled) {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
}

:deep(.booking-waitlist) {
  background-color: #ffc107 !important;
  border-color: #ffc107 !important;
  color: #000 !important;
}

/* Conflict Styles */
:deep(.booking-conflict) {
  background: repeating-linear-gradient(
    45deg,
    #ff6b6b,
    #ff6b6b 10px,
    #ff8e8e 10px,
    #ff8e8e 20px
  ) !important;
  border: 2px solid #dc3545 !important;
  animation: conflict-pulse 2s infinite;
}

@keyframes conflict-pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Calendar Event Hover Effects */
:deep(.fc-event:hover) {
  opacity: 0.8;
  transform: scale(1.02);
  transition: all 0.2s ease;
}

/* Calendar Day Styles */
:deep(.fc-day-today) {
  background-color: rgba(34, 139, 34, 0.1) !important;
}

:deep(.fc-daygrid-day-number) {
  color: var(--text-primary);
  font-weight: 500;
}

:deep(.fc-daygrid-day-number:hover) {
  color: var(--forest-deep);
}

/* Calendar Popover Styles */
:deep(.fc-popover) {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.fc-popover-header) {
  background: var(--forest-light);
  color: var(--forest-deep);
  font-weight: 600;
}
</style>
