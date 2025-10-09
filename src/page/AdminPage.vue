<template>
  <div class="admin-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-10">
          <div class="admin-panel">
            <h1 class="admin-title">Admin Panel</h1>
            <p class="admin-subtitle">Manage users and system settings</p>

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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/composables/useAuth.js'
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
/* Layout */
.admin-page {
  min-height: 100vh;
  background: var(--forest-light);
  padding: 2rem 0;
}

.admin-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px var(--shadow-medium);
  padding: 2rem;
  margin: 2rem 0;
}

/* Typography */
.admin-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--forest-dark);
  margin-bottom: 0.5rem;
  text-align: center;
}

.admin-subtitle {
  font-size: 1.1rem;
  color: var(--forest-medium);
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--forest-dark);
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--forest-sage);
  padding-bottom: 0.5rem;
}


/* Admin sections */
.admin-section {
  margin-bottom: 2rem;
}

.admin-section:last-child {
  margin-bottom: 0;
}

/* Action Buttons */
.admin-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-panel {
    padding: 1rem;
    margin: 1rem 0;
  }

  .admin-title {
    font-size: 2rem;
  }
}
 </style>
