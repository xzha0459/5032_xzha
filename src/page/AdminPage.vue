<template>
  <div class="page">
    <div class="user-page-header">
      <h1 class="user-page-title">Admin Panel</h1>
      <p class="user-page-subtitle">Manage users, strategies, and system settings</p>
    </div>

    <div class="user-page-content">
      <div class="admin-panel">
        <!-- Loading state for auth -->
        <div v-if="authLoading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading...</p>
        </div>

        <!-- Admin content -->
        <div v-else-if="isAdminUser">
          <!-- Action Buttons -->
          <div class="admin-actions">
            <EmailSender />
          </div>

          <!-- Tables Section -->
          <TableSection
            :strategies="strategies"
            :users="users"
            @update:strategies="loadStrategiesFromFirestore"
            @update:users="loadUsersFromFirestore"
          />
        </div> <!-- End admin content -->
      </div> <!-- End admin-panel -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/utils/useAuth.js'
import EmailSender from '@/components/EmailSender.vue'
import TableSection from '@/section/AdminPage/TableSection.vue'

// Use auth composable
const { isAdminUser, isLoading: authLoading } = useAuth()

// Router for redirects
import { useRouter } from 'vue-router'
const router = useRouter()

// State
const strategies = ref([])
const users = ref([])

// Methods
const loadStrategiesFromFirestore = async () => {
  try {
    const snap = await getDocs(collection(db, 'strategies'))
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (docs.length > 0) {
      strategies.value = docs
    }
  } catch {
    console.warn('Failed to load strategies from Firestore, using local cache/seeds.')
  }
}

const loadUsersFromFirestore = async () => {
  try {
    const snap = await getDocs(collection(db, 'users'))
    users.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to load users:', e)
    users.value = []
  }
}

// Watch for auth changes and redirect if not admin
watch([authLoading, isAdminUser], ([loading, isAdmin]) => {
  if (!loading && !isAdmin) {
    // User is not admin, redirect to home
    router.push('/')
  }
}, { immediate: true })

// Lifecycle
onMounted(() => {
  loadStrategiesFromFirestore()
  loadUsersFromFirestore()
})
</script>

<style scoped>
/* Action Buttons */
.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}
 </style>
