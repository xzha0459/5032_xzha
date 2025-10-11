<template>
  <!-- Emotion Strategies Table -->
  <div class="table-section">
      <h2 class="section-title">Emotion Strategies</h2>

      <!-- Global Search -->
      <div class="table-tools">
        <input v-model="strategyGlobalQuery" class="search" placeholder="Search all..." />
      </div>

      <div class="table-container">
        <div class="strategies-table">
        <!-- Column Headers with Sort -->
        <div class="table-header">
          <div class="table-cell sortable" @click="toggleSort('strategies','id')">ID <span>{{ sortIndicators.strategies.id }}</span></div>
          <div class="table-cell sortable" @click="toggleSort('strategies','title')">Title <span>{{ sortIndicators.strategies.title }}</span></div>
          <div class="table-cell sortable" @click="toggleSort('strategies','category')">Category <span>{{ sortIndicators.strategies.category }}</span></div>
          <div class="table-cell">Actions</div>
        </div>

        <!-- Column Filters -->
        <div class="table-header table-header--filters">
          <div class="table-cell"><input v-model="strategyFilters.id" class="search" placeholder="Filter by ID" /></div>
          <div class="table-cell"><input v-model="strategyFilters.title" class="search" placeholder="Filter by Title" /></div>
          <div class="table-cell">
            <select v-model="strategyFilters.category" class="filter">
              <option value="">All Categories</option>
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="table-cell">
            <button class="btn action primary" @click="openStrategyModal()">Add Strategy</button>
          </div>
        </div>

        <!-- Table Rows -->
        <div v-for="row in pagedStrategies" :key="row.id" class="table-row">
          <div class="table-cell">{{ row.id }}</div>
          <div class="table-cell">{{ row.title }}</div>
          <div class="table-cell">{{ row.category }}</div>
          <div class="table-cell">
            <button class="btn action" @click="openStrategyModal(row)">Edit</button>
            <button class="btn action danger" @click="deleteStrategy(row)">Delete</button>
          </div>
        </div>

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
      <h2 class="section-title">Users Management</h2>

      <!-- Global Search -->
      <div class="table-tools">
        <input v-model="usersGlobalQuery" class="search" placeholder="Search all..." />
      </div>

      <div class="table-container">
        <div class="users-table">
        <!-- Column Headers with Sort -->
        <div class="table-header">
          <div class="table-cell sortable" @click="toggleSort('users','username')">Username <span>{{ sortIndicators.users.username }}</span></div>
          <div class="table-cell sortable" @click="toggleSort('users','email')">Email <span>{{ sortIndicators.users.email }}</span></div>
          <div class="table-cell sortable" @click="toggleSort('users','role')">Role <span>{{ sortIndicators.users.role }}</span></div>
          <div class="table-cell sortable" @click="toggleSort('users','createdAt')">Created At <span>{{ sortIndicators.users.createdAt }}</span></div>
        </div>

        <!-- Column Filters -->
        <div class="table-header table-header--filters">
          <div class="table-cell"><input v-model="usersFilters.username" class="search" placeholder="Filter by Username" /></div>
          <div class="table-cell"><input v-model="usersFilters.email" class="search" placeholder="Filter by Email" /></div>
          <div class="table-cell">
            <select v-model="usersFilters.role" class="filter">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="table-cell"><input v-model="usersFilters.createdAt" class="search" placeholder="Filter by Date (YYYY-MM-DD)" /></div>
        </div>

        <!-- Table Rows -->
        <div v-for="row in pagedUsers" :key="row.id" class="table-row">
          <div class="table-cell">{{ row.username || 'Unknown' }}</div>
          <div class="table-cell">{{ row.email || 'N/A' }}</div>
          <div class="table-cell">{{ row.role || 'user' }}</div>
          <div class="table-cell">{{ formatDate(row.createdAt) }}</div>
        </div>

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
    <div v-if="showStrategyModal" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">{{ editingStrategy ? 'Edit Strategy' : 'Add Strategy' }}</h3>
          <button class="close-button" @click="showStrategyModal=false">×</button>
        </div>

        <div class="modal-body">
          <input v-model="strategyForm.id" class="input" placeholder="ID (auto if empty)" />
          <input v-model="strategyForm.title" class="input" placeholder="Title" />
          <select v-model="strategyForm.category" class="input">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <input v-model="strategyForm.tags" class="input" placeholder="Tags (comma separated)" />
          <input v-model="strategyForm.description" class="input" placeholder="Description" />
          <textarea v-model="strategyForm.tips" class="input" placeholder="Tips: one per line, format Title::Description"></textarea>
        </div>

        <div class="modal-footer">
          <button class="btn action" @click="showStrategyModal=false">Cancel</button>
          <button class="btn action primary" @click="submitStrategy">Save</button>
        </div>
      </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { setDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'

// Props
const props = defineProps({
  strategies: { type: Array, default: () => [] },
  users: { type: Array, default: () => [] }
})

// Emits
const emit = defineEmits(['update:strategies'])

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

// Modal state
const showStrategyModal = ref(false)
const editingStrategy = ref(null)
const strategyForm = ref({ id: '', title: '', category: '', description: '', tags: '', tips: '' })

// Helper functions
const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const toggleSort = (table, key) => {
  const state = table === 'strategies' ? strategySort : usersSort
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
  }
}))

function indicator(table, key) {
  const state = table === 'strategies' ? strategySort.value : usersSort.value
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
}

const deleteStrategy = async (row) => {
  try {
    await deleteDoc(doc(db, 'strategies', row.id))
    emit('update:strategies')
  } catch (error) {
    console.error('Failed to delete strategy from Firestore:', error)
  }
}
</script>

<style scoped>
.users-table, .strategies-table {
  display: grid;
}

.strategies-table {
  grid-template-columns: 1fr 2fr 2fr 1fr;
}

.users-table {
  grid-template-columns: 1.5fr 2fr 1fr 1.2fr;
}
</style>
