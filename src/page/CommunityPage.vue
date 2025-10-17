<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Community</h1>
      <p class="page-subtitle">Join our community activities and connect with others</p>
    </div>

    <div class="page-content">
      <!-- Loading state for auth -->
      <div v-if="authLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Community content -->
      <div v-else-if="isAuthenticated">
        <!-- View Toggle -->
        <div class="toggle-tabs">
          <button
            :class="['toggle-tab', { active: currentView === 'list' }]"
            @click="currentView = 'list'"
          >
            List View
          </button>
          <button
            :class="['toggle-tab', { active: currentView === 'calendar' }]"
            @click="currentView = 'calendar'"
          >
            Calendar View
          </button>
        </div>

        <!-- Activities List -->
        <ActivityListSection
          v-if="currentView === 'list'"
          ref="activityListRef"
          :activities="activities"
          @book-activity="handleBookActivity"
          @show-activity-details="openActivityDetailsModal"
        />

        <!-- Activity Calendar -->
        <ActivityCalendar
          v-if="currentView === 'calendar'"
          :activities="activities"
          @activity-selected="handleActivitySelected"
          @date-selected="handleDateSelected"
        />
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


    <!-- Booking Modal -->
    <div v-if="showBookingModal" class="modal-overlay" @click="closeBookingModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Book Activity</h2>
          <button class="close-button" @click="closeBookingModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedActivity">
          <p>You are about to book: <strong>{{ selectedActivity.title }}</strong></p>
          <p>Date: {{ new Date(selectedActivity.date).toLocaleDateString() }}</p>
          <p>Time: {{ new Date(selectedActivity.date).toLocaleTimeString() }}</p>
          <p>Price: {{ selectedActivity.price > 0 ? '$' + selectedActivity.price : 'Free' }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn action" @click="closeBookingModal" :disabled="isBooking">Cancel</button>
          <button class="btn primary" @click="confirmBooking" :disabled="isBooking">
            {{ isBooking ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Activity Details Modal -->
    <div v-if="showActivityDetailsModal" class="modal-overlay" @click="closeActivityDetailsModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedActivityForDetails?.title }}</h2>
          <button class="close-button" @click="closeActivityDetailsModal">×</button>
        </div>
        <div class="modal-body" v-if="selectedActivityForDetails">
          <div class="modal-tags">
            <span class="booking-tag" :class="selectedActivityForDetails.type">
              {{ getTypeLabel(selectedActivityForDetails.type) }}
            </span>
            <span class="booking-tag" :class="getStatusClass(selectedActivityForDetails)">
              {{ getStatusText(selectedActivityForDetails) }}
            </span>
          </div>

          <p class="modal-description">{{ selectedActivityForDetails.description }}</p>

          <ul class="modal-list">
            <li>
              <strong>Date:</strong>
              {{ formatDate(selectedActivityForDetails.date) }}
            </li>
            <li>
              <strong>Time:</strong>
              {{ formatTime(selectedActivityForDetails.date) }} ({{ selectedActivityForDetails.duration }}min)
            </li>
            <li>
              <strong>Location:</strong>
              {{ selectedActivityForDetails.location }}
            </li>
            <li>
              <strong>Instructor:</strong>
              {{ selectedActivityForDetails.instructor }}
            </li>
            <li>
              <strong>Participants:</strong>
              {{ selectedActivityForDetails.currentParticipants }}/{{ selectedActivityForDetails.maxParticipants }} participants
            </li>
            <li>
              <strong>Price:</strong>
              {{ selectedActivityForDetails.price > 0 ? '$' + selectedActivityForDetails.price : 'Free' }}
            </li>
          </ul>

          <div class="modal-footer">
            <button
              class="btn primary"
              :disabled="!canBookActivity(selectedActivityForDetails)"
              @click="bookActivityFromDetails(selectedActivityForDetails)"
            >
              {{ getBookingButtonText(selectedActivityForDetails) }}
            </button>
            <button class="btn secondary" @click="closeActivityDetailsModal">
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useAuth } from '@/utils/useAuth.js'
import { getDocs, collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import ActivityListSection from '@/section/CommunityPage/ActivityListSection.vue'
import ActivityCalendar from '@/components/ActivityCalendar.vue'
import { useEmailSender } from '@/utils/useEmailSender.js'

// Use auth composable
const { isAuthenticated, isLoading: authLoading, user } = useAuth()

// Use email sender composable
const { sendBookingConfirmationEmail } = useEmailSender()

// State
const activities = ref([])
const userBookings = ref([])
const selectedActivity = ref(null)
const showBookingModal = ref(false)
const isBooking = ref(false)
const activityListRef = ref(null)
const currentView = ref('list') // 'list' or 'calendar'

// Activity Details Modal State
const selectedActivityForDetails = ref(null)
const showActivityDetailsModal = ref(false)

// 已移除社区导航

// Event handlers
const handleBookActivity = (activity) => {
  selectedActivity.value = activity
  showBookingModal.value = true
}

const handleActivitySelected = (activity) => {
  // Handle activity selection from calendar - show details modal
  openActivityDetailsModal(activity)
}

// Activity Details Modal Methods
const openActivityDetailsModal = (activity) => {
  selectedActivityForDetails.value = activity
  showActivityDetailsModal.value = true
}

const closeActivityDetailsModal = () => {
  showActivityDetailsModal.value = false
  selectedActivityForDetails.value = null
}

const bookActivityFromDetails = (activity) => {
  closeActivityDetailsModal()
  handleBookActivity(activity)
}

// Helper Methods for Activity Details Modal
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
  const activityDate = new Date(activity.date)
  return activity.status === 'active' &&
         activity.currentParticipants < activity.maxParticipants &&
         activityDate > new Date()
}

const getBookingButtonText = (activity) => {
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

const handleDateSelected = (date) => {
  // Handle date selection from calendar
  console.log('Date selected from calendar:', date)
  // You can add additional logic here, like filtering activities by date
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedActivity.value = null
  isBooking.value = false
}

const confirmBooking = async () => {
  if (!selectedActivity.value || !user.value) {
    console.log('Missing required data:', { selectedActivity: selectedActivity.value, user: user.value })
    return
  }

  isBooking.value = true

  try {
    // 检查活动是否还可以预订
    const activity = selectedActivity.value
    const now = new Date()
    const activityDate = new Date(activity.date)

    console.log('User:', user.value)
    console.log('User UID:', user.value.uid)
    console.log('User Email:', user.value.email)
    console.log('Activity:', activity)

    if (activity.status !== 'active') {
      alert('This activity is no longer available for booking.')
      return
    }

    if (activityDate < now) {
      alert('This activity has already passed.')
      return
    }

    if (activity.currentParticipants >= activity.maxParticipants) {
      alert('This activity is full.')
      return
    }

    // 检查与用户现有预订是否时间冲突或重复
    const hasConflict = (() => {
      const activityStart = new Date(activity.date)
      const activityEnd = new Date(activityStart.getTime() + (activity.duration * 60000))
      return userBookings.value.some(b => {
        if (b.status === 'cancelled') return false
        if (b.activityId === activity.id) return true // 同一活动重复预订
        const bookedActivity = activities.value.find(a => a.id === b.activityId)
        if (!bookedActivity) return false
        const bookedStart = new Date(bookedActivity.date)
        const bookedEnd = new Date(bookedStart.getTime() + (bookedActivity.duration * 60000))
        return activityStart < bookedEnd && activityEnd > bookedStart
      })
    })()

    if (hasConflict) {
      alert('This booking conflicts with one of your existing bookings.')
      return
    }

    // 创建预订记录
    const bookingData = {
      userId: user.value.uid,
      userEmail: user.value.email,
      activityId: activity.id,
      activityTitle: activity.title,
      bookingDate: new Date().toISOString(),
      activityDate: activityDate.toISOString(),
      status: 'confirmed',
      price: activity.price
    }

    console.log('Booking data:', bookingData)
    console.log('About to create booking...')

    // 保存预订到 Firebase
    const bookingRef = await addDoc(collection(db, 'bookings'), bookingData)
    console.log('Booking created with ID:', bookingRef.id)

    console.log('About to update activity participants...')
    // 更新活动的参与人数
    await updateDoc(doc(db, 'activities', activity.id), {
      currentParticipants: activity.currentParticipants + 1
    })
    console.log('Activity participants updated')

    // 重新加载数据
    await loadActivities()
    await loadUserBookings()

    // 发送预订确认邮件
    try {
      const emailSent = await sendBookingConfirmationEmail(user.value.email, activity)
      if (emailSent) {
        console.log('Booking confirmation email sent successfully')
      } else {
        console.warn('Failed to send booking confirmation email, but booking was successful')
      }
    } catch (emailError) {
      console.error('Error sending booking confirmation email:', emailError)
      // 邮件发送失败不影响预订成功
    }

    // 显示成功消息
    alert('Booking confirmed! A confirmation email will be sent to your email address.')

    // 关闭模态框
    closeBookingModal()

  } catch (error) {
    console.error('Failed to create booking:', error)
    console.error('Error details:', error.message)
    console.error('Error code:', error.code)
    alert('Failed to create booking. Please try again.')
  } finally {
    isBooking.value = false
  }
}


// Load data
const loadActivities = async () => {
  try {
    const snap = await getDocs(collection(db, 'activities'))
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    activities.value = docs
  } catch (error) {
    console.error('Failed to load activities from Firestore:', error)
    activities.value = []
  }
}

const loadUserBookings = async () => {
  try {
    if (user.value) {
      const snap = await getDocs(collection(db, 'bookings'))
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      userBookings.value = docs.filter(booking => booking.userId === user.value.uid)
    }
  } catch (error) {
    console.error('Failed to load user bookings from Firestore:', error)
    userBookings.value = []
  }
}


// Watch for auth state changes
watch([isAuthenticated, authLoading], ([authenticated, loading]) => {
  if (!loading && authenticated) {
    loadActivities()
    loadUserBookings()
  }
}, { immediate: true })

onMounted(() => {
  // Component mounted
})
</script>

<style scoped>
/* navigation removed */
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

/* Loading state styles */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--forest-light);
  border-top: 4px solid var(--forest-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
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
