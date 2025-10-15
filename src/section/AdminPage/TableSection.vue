<template>
  <!-- Emotion Strategies Table -->
  <div class="table-section">
    <div class="table-header">
      <h2 class="table-Title">Strategy Management</h2>
      <input v-model="strategyGlobalQuery" class="search" placeholder="Search all..." />
    </div>

      <div class="table-container">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.strategies.id"
                    @click="toggleSort('strategies','id')"
                    @keydown.enter="toggleSort('strategies','id')"
                    @keydown.space.prevent="toggleSort('strategies','id')">
                  ID <span>{{ sortIndicators.strategies.id }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.strategies.title"
                    @click="toggleSort('strategies','title')"
                    @keydown.enter="toggleSort('strategies','title')"
                    @keydown.space.prevent="toggleSort('strategies','title')">
                  Title <span>{{ sortIndicators.strategies.title }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.strategies.category"
                    @click="toggleSort('strategies','category')"
                    @keydown.enter="toggleSort('strategies','category')"
                    @keydown.space.prevent="toggleSort('strategies','category')">
                  Category <span>{{ sortIndicators.strategies.category }}</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <!-- Column Filters -->
            <thead class="table-header--filters">
              <tr>
                <th><input v-model="strategyFilters.id" class="search" placeholder="Filter by ID" /></th>
                <th><input v-model="strategyFilters.title" class="search" placeholder="Filter by Title" /></th>
                <th>
                  <select v-model="strategyFilters.category" class="filter">
                    <option value="">All Categories</option>
                    <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
                  </select>
                </th>
                <th>
                  <button class="btn action primary" @click="openStrategyModal()">Add Strategy</button>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in pagedStrategies" :key="row.id">
                <td>{{ row.id }}</td>
                <td>{{ row.title }}</td>
                <td>{{ row.category }}</td>
                <td>
                  <button class="btn action" @click="openStrategyModal(row)">Edit</button>
                  <button class="btn action danger" @click="deleteStrategy(row)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="btn action" :disabled="strategyPage===1" @click="strategyPage--">Prev</button>
          <span class="page-info">{{ strategyPage }} / {{ strategyTotalPages }}</span>
          <button class="btn action" :disabled="strategyPage===strategyTotalPages" @click="strategyPage++">Next</button>
        </div>
      </div>
    </div>

  <!-- Users Management Table -->
  <div class="table-section">
    <div class="table-header">
      <h2 class="table-Title">Users Management</h2>
      <input v-model="usersGlobalQuery" class="search" placeholder="Search all..." />
    </div>

      <div class="table-container">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.users.username"
                    @click="toggleSort('users','username')"
                    @keydown.enter="toggleSort('users','username')"
                    @keydown.space.prevent="toggleSort('users','username')">
                  Username <span>{{ sortIndicators.users.username }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.users.email"
                    @click="toggleSort('users','email')"
                    @keydown.enter="toggleSort('users','email')"
                    @keydown.space.prevent="toggleSort('users','email')">
                  Email <span>{{ sortIndicators.users.email }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.users.role"
                    @click="toggleSort('users','role')"
                    @keydown.enter="toggleSort('users','role')"
                    @keydown.space.prevent="toggleSort('users','role')">
                  Role <span>{{ sortIndicators.users.role }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.users.createdAt"
                    @click="toggleSort('users','createdAt')"
                    @keydown.enter="toggleSort('users','createdAt')"
                    @keydown.space.prevent="toggleSort('users','createdAt')">
                  Created At <span>{{ sortIndicators.users.createdAt }}</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <!-- Column Filters -->
            <thead class="table-header--filters">
              <tr>
                <th><input v-model="usersFilters.username" class="search" placeholder="Filter by Username" /></th>
                <th><input v-model="usersFilters.email" class="search" placeholder="Filter by Email" /></th>
                <th>
                  <select v-model="usersFilters.role" class="filter">
                    <option value="">All Roles</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </th>
                <th><input v-model="usersFilters.createdAt" class="search" placeholder="Filter by Date" /></th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in pagedUsers" :key="row.id">
                <td>{{ row.username || 'Unknown' }}</td>
                <td>{{ row.email || 'N/A' }}</td>
                <td>{{ row.role || 'user' }}</td>
                <td>{{ formatDate(row.createdAt) }}</td>
                <td>
                  <button class="btn action" @click="openUserModal(row)">Edit</button>
                  <button class="btn action danger" @click="deleteUser(row)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="btn action" :disabled="usersPage===1" @click="usersPage--">Prev</button>
          <span class="page-info">{{ usersPage }} / {{ usersTotalPages }}</span>
          <button class="btn action" :disabled="usersPage===usersTotalPages" @click="usersPage++">Next</button>
        </div>
      </div>
    </div>

    <!-- Strategy Modal -->
    <div v-if="showStrategyModal" class="modal-overlay" role="presentation">
      <div class="modal" role="dialog" aria-modal="true" :aria-labelledby="'admin-strategy-modal-title'"
           ref="adminStrategyModal" @keydown="handleAdminModalKeydown">
        <div class="modal-header">
          <h3 class="modal-title" :id="'admin-strategy-modal-title'">{{ editingStrategy ? 'Edit Strategy' : 'Add Strategy' }}</h3>
          <button class="close-button" ref="adminModalCloseBtn" @click="showStrategyModal=false" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body">
          <div class="modal-group">
            <input v-model="strategyForm.id" class="input" placeholder="ID (auto if empty)" />
          <input v-model="strategyForm.title" class="input" placeholder="Title" />
          <select v-model="strategyForm.category" class="input">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <input v-model="strategyForm.tags" class="input" placeholder="Tags (comma separated)" />
          <input v-model="strategyForm.description" class="input" placeholder="Description" />
          <textarea v-model="strategyForm.tips" class="input" placeholder="Tips: one per line, format Title::Description"></textarea>
          </div>

        </div>

        <div class="modal-footer">
          <button class="btn action" @click="showStrategyModal=false">Cancel</button>
          <button class="btn action primary" @click="submitStrategy">Save</button>
        </div>
      </div>
    </div>

  <!-- Activity Management Table -->
  <div class="table-section">
    <div class="table-header">
      <h2 class="table-Title">Activity Management</h2>
      <input v-model="activitiesGlobalQuery" class="search" placeholder="Search all..." />
    </div>

      <div class="table-container">
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.activities.title"
                    @click="toggleSort('activities','title')"
                    @keydown.enter="toggleSort('activities','title')"
                    @keydown.space.prevent="toggleSort('activities','title')">
                  Activity <span>{{ sortIndicators.activities.title }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.activities.type"
                    @click="toggleSort('activities','type')"
                    @keydown.enter="toggleSort('activities','type')"
                    @keydown.space.prevent="toggleSort('activities','type')">
                  Type <span>{{ sortIndicators.activities.type }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.activities.date"
                    @click="toggleSort('activities','date')"
                    @keydown.enter="toggleSort('activities','date')"
                    @keydown.space.prevent="toggleSort('activities','date')">
                  Date & Time <span>{{ sortIndicators.activities.date }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.activities.participants"
                    @click="toggleSort('activities','participants')"
                    @keydown.enter="toggleSort('activities','participants')"
                    @keydown.space.prevent="toggleSort('activities','participants')">
                  Participants <span>{{ sortIndicators.activities.participants }}</span>
                </th>
                <th class="sortable" role="columnheader" tabindex="0"
                    :aria-sort="sortStates.activities.status"
                    @click="toggleSort('activities','status')"
                    @keydown.enter="toggleSort('activities','status')"
                    @keydown.space.prevent="toggleSort('activities','status')">
                  Status <span>{{ sortIndicators.activities.status }}</span>
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <!-- Column Filters -->
            <thead class="table-header--filters">
              <tr>
                <th><input v-model="activitiesFilters.title" class="search" placeholder="Filter by Title" /></th>
                <th>
                  <select v-model="activitiesFilters.type" class="filter">
                    <option value="">All Types</option>
                    <option value="lecture">Lecture</option>
                    <option value="support-group">Support Group</option>
                    <option value="meditation">Meditation</option>
                    <option value="art-therapy">Art Therapy</option>
                    <option value="exercise">Exercise</option>
                    <option value="social">Social Event</option>
                  </select>
                </th>
                <th><input v-model="activitiesFilters.date" class="search" placeholder="Filter by Date (YYYY-MM-DD)" /></th>
                <th><input v-model="activitiesFilters.participants" class="search" placeholder="Filter by Participants" /></th>
                <th>
                  <select v-model="activitiesFilters.status" class="filter">
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="full">Full</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="past">Past</option>
                  </select>
                </th>
                <th>
                  <button class="btn action primary" @click="openActivityModal()">Create Activity</button>
                </th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="row in pagedActivities" :key="row.id">
                <td>
                  <div class="activity-title">{{ row.title }}</div>
                </td>
                <td>
                  {{ getTypeLabel(row.type) }}
                </td>
                <td>
                  <div class="date-time">
                    <div>{{ formatDate(row.date) }}</div>
                    <div class="time">{{ formatTime(row.date) }}</div>
                  </div>
                </td>
                <td>
                  <div class="participant-count">
                    {{ row.currentParticipants }}/{{ row.maxParticipants }}
                  </div>
                </td>
                <td>
                  {{ getStatusText(row) }}
                </td>
                <td>
                  <button class="btn action" @click="openActivityModal(row)">Edit</button>
                  <button class="btn action danger" @click="deleteActivity(row)">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination">
          <button class="btn action" :disabled="activitiesPage===1" @click="activitiesPage--">Prev</button>
          <span class="page-info">{{ activitiesPage }} / {{ activitiesTotalPages }}</span>
          <button class="btn action" :disabled="activitiesPage===activitiesTotalPages" @click="activitiesPage++">Next</button>
        </div>
      </div>
    </div>

  <!-- Activity Modal -->
  <div v-if="showActivityModal" class="modal-overlay" @click="closeActivityModal">
    <div class="modal large-modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditingActivity ? 'Edit Activity' : 'Create Activity' }}</h2>
        <button class="close-button" @click="closeActivityModal">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitActivity">
          <div class="form-grid">
            <div class="form-group">
              <label for="activity-title">Activity Title *</label>
              <input
                id="activity-title"
                v-model="activityForm.title"
                type="text"
                required
                class="input"
                placeholder="Enter activity title"
              />
            </div>

            <div class="form-group">
              <label for="activity-type">Activity Type *</label>
              <select id="activity-type" v-model="activityForm.type" required class="input">
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
              <label for="activity-date">Date *</label>
              <input
                id="activity-date"
                v-model="activityForm.date"
                type="date"
                required
                class="input"
              />
            </div>

            <div class="form-group">
              <label for="activity-time">Time *</label>
              <input
                id="activity-time"
                v-model="activityForm.time"
                type="time"
                required
                class="input"
              />
            </div>

            <div class="form-group">
              <label for="activity-duration">Duration (minutes) *</label>
              <input
                id="activity-duration"
                v-model="activityForm.duration"
                type="number"
                min="15"
                max="480"
                required
                class="input"
              />
            </div>

            <div class="form-group">
              <label for="activity-maxParticipants">Max Participants *</label>
              <input
                id="activity-maxParticipants"
                v-model="activityForm.maxParticipants"
                type="number"
                min="1"
                max="100"
                required
                class="input"
              />
            </div>

            <div class="form-group">
              <label for="activity-location">Location *</label>
              <input
                id="activity-location"
                v-model="activityForm.location"
                type="text"
                required
                class="input"
                placeholder="Enter location"
              />
            </div>

            <div class="form-group">
              <label for="activity-instructor">Instructor *</label>
              <input
                id="activity-instructor"
                v-model="activityForm.instructor"
                type="text"
                required
                class="input"
                placeholder="Enter instructor name"
              />
            </div>

            <div class="form-group">
              <label for="activity-price">Price ($)</label>
              <input
                id="activity-price"
                v-model="activityForm.price"
                type="number"
                min="0"
                step="0.01"
                class="input"
              />
            </div>

            <div class="form-group">
              <label for="activity-status">Status</label>
              <select id="activity-status" v-model="activityForm.status" class="input">
                <option value="active">Active</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label for="activity-description">Description *</label>
            <textarea
              id="activity-description"
              v-model="activityForm.description"
              required
              rows="4"
              class="input"
              placeholder="Enter activity description"
            ></textarea>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn action" @click="closeActivityModal">Cancel</button>
            <button type="submit" class="btn action primary" :disabled="isSavingActivity">
              {{ isSavingActivity ? 'Saving...' : (isEditingActivity ? 'Update Activity' : 'Create Activity') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="modal-overlay" @click="closeDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Confirm Delete</h2>
        <button class="close-button" @click="closeDeleteModal">×</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this activity?</p>
        <p><strong>{{ activityToDelete?.title }}</strong></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn action" @click="closeDeleteModal">Cancel</button>
        <button type="button" class="btn action danger" @click="confirmDeleteActivity">Delete</button>
      </div>
    </div>
  </div>

  <!-- Strategy Delete Confirmation Modal -->
  <div v-if="showStrategyDeleteModal" class="modal-overlay" @click="closeStrategyDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Confirm Delete</h2>
        <button class="close-button" @click="closeStrategyDeleteModal">×</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this strategy?</p>
        <p><strong>{{ strategyToDelete?.title }}</strong></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn action" @click="closeStrategyDeleteModal">Cancel</button>
        <button type="button" class="btn action danger" @click="confirmDeleteStrategy">Delete</button>
      </div>
    </div>
  </div>

  <!-- User Modal -->
  <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>{{ isEditingUser ? 'Edit User' : 'Create User' }}</h2>
        <button class="close-button" @click="closeUserModal">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="submitUser">
          <div class="form-grid">
            <div class="form-group">
              <label for="user-username">Username *</label>
              <input
                id="user-username"
                v-model="userForm.username"
                type="text"
                required
                class="input"
                placeholder="Enter username"
              />
            </div>

            <div class="form-group">
              <label for="user-email">Email *</label>
              <input
                id="user-email"
                v-model="userForm.email"
                type="email"
                required
                class="input"
                placeholder="Enter email"
              />
            </div>

            <div class="form-group">
              <label for="user-role">Role *</label>
              <select
                id="user-role"
                v-model="userForm.role"
                required
                class="input"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="form-group">
              <label for="user-age">Age</label>
              <input
                id="user-age"
                v-model="userForm.age"
                type="number"
                class="input"
                placeholder="Enter age"
              />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn action" @click="closeUserModal">Cancel</button>
            <button type="submit" class="btn action primary" :disabled="isSavingUser">
              {{ isSavingUser ? 'Saving...' : (isEditingUser ? 'Update User' : 'Create User') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- User Delete Confirmation Modal -->
  <div v-if="showUserDeleteModal" class="modal-overlay" @click="closeUserDeleteModal">
    <div class="modal" @click.stop>
      <div class="modal-header">
        <h2>Confirm Delete</h2>
        <button class="close-button" @click="closeUserDeleteModal">×</button>
      </div>
      <div class="modal-body">
        <p>Are you sure you want to delete this user?</p>
        <p><strong>{{ userToDelete?.username || userToDelete?.email || 'Unknown' }}</strong></p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn action" @click="closeUserDeleteModal">Cancel</button>
        <button type="button" class="btn action danger" @click="confirmDeleteUser">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { setDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

// Props
const props = defineProps({
  strategies: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] },
  activities: { type: Array, default: () => [] }
})

// Emits
const emit = defineEmits(['update:strategies', 'update:activities'])

// Constants
const CATEGORIES = computed(() => {
  const fixedCategories = ['Anxiety Management', 'Depression Coping', 'Stress Relief', 'Sleep Improvement']
  const dynamicCategories = new Set()

  props.strategies.forEach(strategy => {
    if (strategy.category && !fixedCategories.includes(strategy.category)) {
      dynamicCategories.add(strategy.category)
    }
  })

  return [...fixedCategories, ...Array.from(dynamicCategories).sort()]
})

const pageSize = 10

// Table state - strategies
const strategyGlobalQuery = ref('')
const strategyFilters = ref({ title: '', category: '', id: '' })
const strategySort = ref({ key: 'title', dir: 'asc' })
const strategyPage = ref(1)

// Table state - users
const usersGlobalQuery = ref('')
const usersFilters = ref({ username: '', email: '', role: '', createdAt: '' })
const usersSort = ref({ key: 'createdAt', dir: 'desc' })
const usersPage = ref(1)

// Table state - activities
const activitiesGlobalQuery = ref('')
const activitiesFilters = ref({ title: '', type: '', date: '', participants: '', status: '' })
const activitiesSort = ref({ key: 'date', dir: 'asc' })
const activitiesPage = ref(1)

// Modal state
const showStrategyModal = ref(false)
const editingStrategy = ref(null)
const strategyForm = ref({ id: '', title: '', category: '', description: '', tags: '', tips: '' })
const adminStrategyModal = ref(null)
const adminModalCloseBtn = ref(null)
let lastFocusedBeforeAdminModal = null

// Activity modal state
const showActivityModal = ref(false)
const isEditingActivity = ref(false)
const isSavingActivity = ref(false)
const editingActivity = ref(null)
const activityForm = ref({
  id: '',
  title: '',
  type: '',
  date: '',
  time: '',
  duration: 60,
  maxParticipants: 20,
  location: '',
  instructor: '',
  price: 0,
  status: 'active',
  description: '',
  currentParticipants: 0
})

// Delete confirmation modal state
const showDeleteModal = ref(false)
const activityToDelete = ref(null)

// User Management modal state
const showUserModal = ref(false)
const isEditingUser = ref(false)
const isSavingUser = ref(false)
const editingUser = ref(null)
const userForm = ref({
  id: '',
  username: '',
  email: '',
  role: 'user',
  age: '',
  createdAt: ''
})

// User delete confirmation modal state
const showUserDeleteModal = ref(false)
const userToDelete = ref(null)

// Strategy delete confirmation modal state
const showStrategyDeleteModal = ref(false)
const strategyToDelete = ref(null)

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// User Management Methods
const openUserModal = (row) => {
  if (row) {
    // Edit mode
    isEditingUser.value = true
    editingUser.value = row
    userForm.value = {
      id: row.id || '',
      username: row.username || '',
      email: row.email || '',
      role: row.role || 'user',
      age: row.age || '',
      createdAt: row.createdAt || ''
    }
  } else {
    // Create mode - reset form
    isEditingUser.value = false
    editingUser.value = null
    userForm.value = {
      id: '',
      username: '',
      email: '',
      role: 'user',
      age: '',
      createdAt: ''
    }
  }
  showUserModal.value = true
}

const deleteUser = (row) => {
  userToDelete.value = row
  showUserDeleteModal.value = true
}

const toggleSort = (table, key) => {
  let state
  if (table === 'strategies') {
    state = strategySort
  } else if (table === 'users') {
    state = usersSort
  } else if (table === 'activities') {
    state = activitiesSort
  }
  if (state.value.key === key) {
    state.value.dir = state.value.dir === 'asc' ? 'desc' : 'asc'
  } else {
    state.value.key = key
    state.value.dir = 'asc'
  }
}

const sortIndicators = computed(() => ({
  strategies: {
    title: indicator('strategies','title'),
    category: indicator('strategies','category'),
    id: indicator('strategies','id')
  },
  users: {
    username: indicator('users','username'),
    email: indicator('users','email'),
    role: indicator('users','role'),
    createdAt: indicator('users','createdAt')
  },
  activities: {
    title: indicator('activities','title'),
    type: indicator('activities','type'),
    date: indicator('activities','date'),
    participants: indicator('activities','participants'),
    status: indicator('activities','status')
  }
}))

const sortStates = computed(() => ({
  strategies: {
    title: getSortState('strategies','title'),
    category: getSortState('strategies','category'),
    id: getSortState('strategies','id')
  },
  users: {
    username: getSortState('users','username'),
    email: getSortState('users','email'),
    role: getSortState('users','role'),
    createdAt: getSortState('users','createdAt')
  },
  activities: {
    title: getSortState('activities','title'),
    type: getSortState('activities','type'),
    date: getSortState('activities','date'),
    participants: getSortState('activities','participants'),
    status: getSortState('activities','status')
  }
}))

const getSortState = (table, key) => {
  let state
  if (table === 'strategies') {
    state = strategySort
  } else if (table === 'users') {
    state = usersSort
  } else if (table === 'activities') {
    state = activitiesSort
  }
  if (state.value.key !== key) return 'none'
  return state.value.dir === 'asc' ? 'ascending' : 'descending'
}

function indicator(table, key) {
  let state
  if (table === 'strategies') {
    state = strategySort.value
  } else if (table === 'users') {
    state = usersSort.value
  } else if (table === 'activities') {
    state = activitiesSort.value
  }
  if (state.key !== key) return ''
  return state.dir === 'asc' ? '▲' : '▼'
}

// Generic table processing function
const processTable = (data, globalQuery, filters, sort, page) => {
  // Filter
  const filtered = data.filter(item => {
    const q = globalQuery.trim().toLowerCase()
    const f = filters

    // Global search
    const globalMatch = !q || Object.values(item).some(v =>
      String(v || '').toLowerCase().includes(q)
    )

    // Column filters
    const columnMatch = Object.entries(f).every(([key, value]) =>
      !value || String(item[key] || '').toLowerCase().includes(String(value).toLowerCase())
    )

    return globalMatch && columnMatch
  })

  // Sort
  const sorted = [...filtered].sort((a, b) => {
    const va = a[sort.key]
    const vb = b[sort.key]

    if (sort.key === 'createdAt') {
      return (new Date(va) - new Date(vb)) * (sort.dir === 'asc' ? 1 : -1)
    }

    return String(va || '').localeCompare(String(vb || '')) * (sort.dir === 'asc' ? 1 : -1)
  })

  // Paginate
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize

  return {
    data: sorted.slice(start, start + pageSize),
    totalPages,
    currentPage
  }
}

// Computed properties
const strategiesProcessed = computed(() =>
  processTable(props.strategies, strategyGlobalQuery.value, strategyFilters.value, strategySort.value, strategyPage.value)
)

const usersProcessed = computed(() =>
  processTable(props.users, usersGlobalQuery.value, usersFilters.value, usersSort.value, usersPage.value)
)

const pagedStrategies = computed(() => strategiesProcessed.value.data)
const strategyTotalPages = computed(() => strategiesProcessed.value.totalPages)

const pagedUsers = computed(() => usersProcessed.value.data)
const usersTotalPages = computed(() => usersProcessed.value.totalPages)

const activitiesProcessed = computed(() =>
  processTable(props.activities, activitiesGlobalQuery.value, activitiesFilters.value, activitiesSort.value, activitiesPage.value)
)

const pagedActivities = computed(() => activitiesProcessed.value.data)
const activitiesTotalPages = computed(() => activitiesProcessed.value.totalPages)

// Modal methods
const openStrategyModal = (row) => {
  editingStrategy.value = row || null
  strategyForm.value = row
    ? {
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description || '',
        tags: row.tags?.join(', ') || '',
        tips: (row.tips||[]).map(t=>`${t.title}::${t.description}`).join('\n')
      }
    : {
        id: '',
        title: '',
        category: 'Anxiety Management',
        description: '',
        tags: '',
        tips: ''
      }
  showStrategyModal.value = true
  // 记录触发元素并将焦点移入模态
  lastFocusedBeforeAdminModal = document.activeElement
  nextTick(() => {
    if (adminModalCloseBtn.value && adminModalCloseBtn.value.focus) {
      adminModalCloseBtn.value.focus()
    }
  })
}

// CRUD Operations
const submitStrategy = async () => {
  const payload = {
    id: (strategyForm.value.id || '').trim() || (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
    title: strategyForm.value.title.trim(),
    category: strategyForm.value.category.trim(),
    description: (strategyForm.value.description || '').trim(),
    tags: strategyForm.value.tags.split(',').map(t => t.trim()).filter(Boolean),
    tips: (strategyForm.value.tips || '').split('\n').map(line => {
      const [title, description] = line.split('::')
      if (!title) return null
      return { title: title.trim(), description: (description || '').trim() }
    }).filter(Boolean)
  }

  try {
    await setDoc(doc(db, 'strategies', payload.id), payload, { merge: true })
    emit('update:strategies')
  } catch (error) {
    console.error('Failed to save strategy to Firestore:', error)
  }
  showStrategyModal.value = false
  // 关闭后还原焦点
  if (lastFocusedBeforeAdminModal && lastFocusedBeforeAdminModal.focus) {
    lastFocusedBeforeAdminModal.focus()
  }
}

const deleteStrategy = (row) => {
  strategyToDelete.value = row
  showStrategyDeleteModal.value = true
}

const closeStrategyDeleteModal = () => {
  showStrategyDeleteModal.value = false
  strategyToDelete.value = null
}

const confirmDeleteStrategy = async () => {
  if (!strategyToDelete.value) return

  try {
    await deleteDoc(doc(db, 'strategies', strategyToDelete.value.id))
    emit('update:strategies')
    closeStrategyDeleteModal()
  } catch (error) {
    console.error('Failed to delete strategy from Firestore:', error)
  }
}

// 焦点陷阱 & Esc 关闭
const handleAdminModalKeydown = (e) => {
  if (e.key === 'Escape') {
    showStrategyModal.value = false
    return
  }
  if (e.key !== 'Tab') return
  const modal = adminStrategyModal.value
  if (!modal) return
  const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  const active = document.activeElement
  if (e.shiftKey && active === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && active === last) {
    e.preventDefault();
    first.focus();
  }
}

// Activity management methods
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

const getStatusText = (activity) => {
  const now = new Date()
  const activityDate = new Date(activity.date)

  if (activity.status === 'cancelled') return 'Cancelled'
  if (activityDate < now) return 'Past'
  if (activity.currentParticipants >= activity.maxParticipants) return 'Full'
  return 'Active'
}

const formatTime = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const openActivityModal = (row) => {
  editingActivity.value = row || null
  isEditingActivity.value = !!row

  if (row) {
    // Edit mode - populate form with existing data
    activityForm.value = {
      id: row.id,
      title: row.title || '',
      type: row.type || '',
      date: row.date ? new Date(row.date).toISOString().split('T')[0] : '',
      time: row.date ? new Date(row.date).toTimeString().slice(0, 5) : '',
      duration: row.duration || 60,
      maxParticipants: row.maxParticipants || 20,
      location: row.location || '',
      instructor: row.instructor || '',
      price: row.price || 0,
      status: row.status || 'active',
      description: row.description || '',
      currentParticipants: row.currentParticipants || 0
    }
  } else {
    // Create mode - reset form
    activityForm.value = {
      id: '',
      title: '',
      type: '',
      date: '',
      time: '',
      duration: 60,
      maxParticipants: 20,
      location: '',
      instructor: '',
      price: 0,
      status: 'active',
      description: '',
      currentParticipants: 0
    }
  }

  showActivityModal.value = true
}

const deleteActivity = (row) => {
  activityToDelete.value = row
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  activityToDelete.value = null
}

// User Modal Methods
const closeUserModal = () => {
  showUserModal.value = false
  isEditingUser.value = false
  editingUser.value = null
  isSavingUser.value = false
}

const submitUser = async () => {
  isSavingUser.value = true

  try {
    // TODO: Implement user save/update logic
    closeUserModal()
  } catch (error) {
    console.error('Failed to save user:', error)
  } finally {
    isSavingUser.value = false
  }
}

const closeUserDeleteModal = () => {
  showUserDeleteModal.value = false
  userToDelete.value = null
}

const confirmDeleteUser = async () => {
  if (!userToDelete.value) return

  try {
    // TODO: Implement user deletion logic
    closeUserDeleteModal()
  } catch (error) {
    console.error('Failed to delete user:', error)
  }
}

const confirmDeleteActivity = async () => {
  if (!activityToDelete.value) return

  try {
    await deleteDoc(doc(db, 'activities', activityToDelete.value.id))
    emit('update:activities')
    closeDeleteModal()
  } catch (error) {
    console.error('Failed to delete activity from Firestore:', error)
  }
}

const closeActivityModal = () => {
  showActivityModal.value = false
  isEditingActivity.value = false
  editingActivity.value = null
  isSavingActivity.value = false
}

const submitActivity = async () => {
  isSavingActivity.value = true

  try {
    // Combine date and time
    const dateTime = new Date(`${activityForm.value.date}T${activityForm.value.time}`)

    const payload = {
      id: activityForm.value.id || (crypto?.randomUUID ? crypto.randomUUID() : String(Date.now())),
      title: activityForm.value.title.trim(),
      type: activityForm.value.type,
      date: dateTime.toISOString(),
      duration: parseInt(activityForm.value.duration),
      maxParticipants: parseInt(activityForm.value.maxParticipants),
      currentParticipants: isEditingActivity.value ? activityForm.value.currentParticipants : 0,
      location: activityForm.value.location.trim(),
      instructor: activityForm.value.instructor.trim(),
      price: parseFloat(activityForm.value.price) || 0,
      status: activityForm.value.status,
      description: activityForm.value.description.trim()
    }

    await setDoc(doc(db, 'activities', payload.id), payload, { merge: true })
    emit('update:activities')

    closeActivityModal()
  } catch (error) {
    console.error('Failed to save activity to Firestore:', error)
  } finally {
    isSavingActivity.value = false
  }
}
</script>

<style scoped>
/* Table styles now use global styles from base.css */

/* Activity-specific styles */
.activity-title {
  font-weight: 600;
  color: var(--forest-deep);
  margin-bottom: 0.25rem;
}

.date-time {
  font-size: 0.875rem;
}

.time {
  color: var(--text-secondary);
}
</style>
