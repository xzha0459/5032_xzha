<template>
  <div class="page">
    <div class="user-page-header">
      <h1 class="user-page-title">Community</h1>
      <p class="user-page-subtitle">Join our community activities and connect with others</p>
    </div>

    <div class="user-page-content">
      <!-- Loading state for auth -->
      <div v-if="authLoading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading...</p>
      </div>

      <!-- Community content -->
      <div v-else-if="isAuthenticated">
        <!-- Navigation Tabs -->
        <div class="community-nav">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-button', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Activities List Tab -->
          <ActivityListSection
            v-if="activeTab === 'activities'"
            :activities="activities"
            @activity-selected="handleActivitySelected"
            @book-activity="handleBookActivity"
          />

          <!-- Calendar Tab -->
          <ActivityCalendarSection
            v-if="activeTab === 'calendar'"
            :activities="activities"
            :bookings="userBookings"
            @book-activity="handleBookActivity"
          />

        </div>
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

    <!-- Activity Details Modal -->
    <div v-if="showActivityDetails" class="modal-overlay" @click="closeActivityDetails">
      <div class="modal large-modal" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedActivity?.title }}</h2>
          <button class="close-button" @click="closeActivityDetails">×</button>
        </div>
        <div class="modal-body" v-if="selectedActivity">
          <div class="activity-details">
            <div class="detail-section">
              <h3>Description</h3>
              <p>{{ selectedActivity.description }}</p>
            </div>

            <div class="detail-section">
              <h3>Activity Information</h3>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Type:</span>
                  <span class="detail-value">{{ selectedActivity.type }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Date:</span>
                  <span class="detail-value">{{ new Date(selectedActivity.date).toLocaleDateString() }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Time:</span>
                  <span class="detail-value">{{ new Date(selectedActivity.date).toLocaleTimeString() }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Duration:</span>
                  <span class="detail-value">{{ selectedActivity.duration }} minutes</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Location:</span>
                  <span class="detail-value">{{ selectedActivity.location }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Instructor:</span>
                  <span class="detail-value">{{ selectedActivity.instructor }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Participants:</span>
                  <span class="detail-value">{{ selectedActivity.currentParticipants }}/{{ selectedActivity.maxParticipants }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Price:</span>
                  <span class="detail-value">{{ selectedActivity.price > 0 ? '$' + selectedActivity.price : 'Free' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section" v-if="selectedActivity.requirements && selectedActivity.requirements.length > 0">
              <h3>Requirements</h3>
              <ul>
                <li v-for="requirement in selectedActivity.requirements" :key="requirement">{{ requirement }}</li>
              </ul>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn action" @click="closeActivityDetails">Close</button>
          <button class="btn primary" @click="handleBookActivity(selectedActivity)" v-if="selectedActivity">
            Book This Activity
          </button>
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

          <div class="form-group">
            <label for="booking-notes">Notes (optional):</label>
            <textarea
              id="booking-notes"
              v-model="bookingNotes"
              class="input"
              placeholder="Any special requirements or notes..."
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn action" @click="closeBookingModal" :disabled="isBooking">Cancel</button>
          <button class="btn primary" @click="confirmBooking" :disabled="isBooking">
            {{ isBooking ? 'Booking...' : 'Confirm Booking' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/utils/useAuth.js'
import { getDocs, collection, addDoc, updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import ActivityListSection from '@/section/CommunityPage/ActivityListSection.vue'
import ActivityCalendarSection from '@/section/CommunityPage/ActivityCalendarSection.vue'

// Use auth composable
const { isAuthenticated, isLoading: authLoading, user } = useAuth()

// State
const activeTab = ref('activities')
const activities = ref([])
const userBookings = ref([])
const selectedActivity = ref(null)
const showActivityDetails = ref(false)
const showBookingModal = ref(false)
const isBooking = ref(false)
const bookingNotes = ref('')

// Tab configuration
const tabs = computed(() => {
  return [
    { id: 'activities', label: 'Activities' },
    { id: 'calendar', label: 'Calendar' }
  ]
})

// Event handlers
const handleActivitySelected = (activity) => {
  selectedActivity.value = activity
  showActivityDetails.value = true
}

const handleBookActivity = (activity) => {
  selectedActivity.value = activity
  showBookingModal.value = true
}

const closeActivityDetails = () => {
  showActivityDetails.value = false
  selectedActivity.value = null
}

const closeBookingModal = () => {
  showBookingModal.value = false
  selectedActivity.value = null
  bookingNotes.value = ''
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

    // 创建预订记录
    const bookingData = {
      userId: user.value.uid,
      userEmail: user.value.email,
      activityId: activity.id,
      activityTitle: activity.title,
      bookingDate: new Date(),
      activityDate: activityDate,
      status: 'confirmed',
      notes: bookingNotes.value.trim(),
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

    // 显示成功消息
    alert('Booking confirmed! You will receive a confirmation email shortly.')

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


onMounted(() => {
  if (isAuthenticated.value) {
    loadActivities()
    loadUserBookings()
  }
})
</script>

<style scoped>
.community-nav {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-light);
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
  font-size: 1rem;
  font-weight: 500;
}

.tab-button:hover {
  color: var(--forest-medium);
  background: var(--forest-light);
}

.tab-button.active {
  color: var(--forest-deep);
  border-bottom-color: var(--forest-deep);
  background: var(--forest-light);
}

.tab-content {
  min-height: 400px;
}

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
