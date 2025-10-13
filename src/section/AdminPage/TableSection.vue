<template>
  <!-- Emotion Strategies Table -->
  <div class="table-section">
      <h2 class="section-title">Emotion Strategies</h2>

      <!-- Global Search -->
      <div class="table-tools">
        <input v-model="strategyGlobalQuery" class="search" placeholder="Search all..." />
      </div>

      <div class="table-container">
        <div class="strategies-table" role="table" aria-label="Emotion Strategies Table">
        <!-- Column Headers with Sort -->
        <div class="table-header" role="row">
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.strategies.id"
               @click="toggleSort('strategies','id')"
               @keydown.enter="toggleSort('strategies','id')"
               @keydown.space.prevent="toggleSort('strategies','id')">
            ID <span>{{ sortIndicators.strategies.id }}</span>
          </div>
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.strategies.title"
               @click="toggleSort('strategies','title')"
               @keydown.enter="toggleSort('strategies','title')"
               @keydown.space.prevent="toggleSort('strategies','title')">
            Title <span>{{ sortIndicators.strategies.title }}</span>
          </div>
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.strategies.category"
               @click="toggleSort('strategies','category')"
               @keydown.enter="toggleSort('strategies','category')"
               @keydown.space.prevent="toggleSort('strategies','category')">
            Category <span>{{ sortIndicators.strategies.category }}</span>
          </div>
          <div class="table-cell" role="columnheader">Actions</div>
        </div>

        <!-- Column Filters -->
        <div class="table-header table-header--filters" role="row">
          <div class="table-cell" role="gridcell"><input v-model="strategyFilters.id" class="search" placeholder="Filter by ID" /></div>
          <div class="table-cell" role="gridcell"><input v-model="strategyFilters.title" class="search" placeholder="Filter by Title" /></div>
          <div class="table-cell" role="gridcell">
            <select v-model="strategyFilters.category" class="filter">
              <option value="">All Categories</option>
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="table-cell" role="gridcell">
            <button class="btn action primary" @click="openStrategyModal()">Add Strategy</button>
          </div>
        </div>

        <!-- Table Rows -->
        <div v-for="row in pagedStrategies" :key="row.id" class="table-row" role="row">
          <div class="table-cell" role="gridcell">{{ row.id }}</div>
          <div class="table-cell" role="gridcell">{{ row.title }}</div>
          <div class="table-cell" role="gridcell">{{ row.category }}</div>
          <div class="table-cell" role="gridcell">
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
        <div class="users-table" role="table" aria-label="Users Management Table">
        <!-- Column Headers with Sort -->
        <div class="table-header" role="row">
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.users.username"
               @click="toggleSort('users','username')"
               @keydown.enter="toggleSort('users','username')"
               @keydown.space.prevent="toggleSort('users','username')">
            Username <span>{{ sortIndicators.users.username }}</span>
          </div>
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.users.email"
               @click="toggleSort('users','email')"
               @keydown.enter="toggleSort('users','email')"
               @keydown.space.prevent="toggleSort('users','email')">
            Email <span>{{ sortIndicators.users.email }}</span>
          </div>
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.users.role"
               @click="toggleSort('users','role')"
               @keydown.enter="toggleSort('users','role')"
               @keydown.space.prevent="toggleSort('users','role')">
            Role <span>{{ sortIndicators.users.role }}</span>
          </div>
          <div class="table-cell sortable" role="columnheader" tabindex="0"
               :aria-sort="sortStates.users.createdAt"
               @click="toggleSort('users','createdAt')"
               @keydown.enter="toggleSort('users','createdAt')"
               @keydown.space.prevent="toggleSort('users','createdAt')">
            Created At <span>{{ sortIndicators.users.createdAt }}</span>
          </div>
        </div>

        <!-- Column Filters -->
        <div class="table-header table-header--filters" role="row">
          <div class="table-cell" role="gridcell"><input v-model="usersFilters.username" class="search" placeholder="Filter by Username" /></div>
          <div class="table-cell" role="gridcell"><input v-model="usersFilters.email" class="search" placeholder="Filter by Email" /></div>
          <div class="table-cell" role="gridcell">
            <select v-model="usersFilters.role" class="filter">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="table-cell" role="gridcell"><input v-model="usersFilters.createdAt" class="search" placeholder="Filter by Date (YYYY-MM-DD)" /></div>
        </div>

        <!-- Table Rows -->
        <div v-for="row in pagedUsers" :key="row.id" class="table-row" role="row">
          <div class="table-cell" role="gridcell">{{ row.username || 'Unknown' }}</div>
          <div class="table-cell" role="gridcell">{{ row.email || 'N/A' }}</div>
          <div class="table-cell" role="gridcell">{{ row.role || 'user' }}</div>
          <div class="table-cell" role="gridcell">{{ formatDate(row.createdAt) }}</div>
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
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
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
const adminStrategyModal = ref(null)
const adminModalCloseBtn = ref(null)
let lastFocusedBeforeAdminModal = null

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
  }
}))

const getSortState = (table, key) => {
  const state = table === 'strategies' ? strategySort : usersSort
  if (state.value.key !== key) return 'none'
  return state.value.dir === 'asc' ? 'ascending' : 'descending'
}

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

const deleteStrategy = async (row) => {
  try {
    await deleteDoc(doc(db, 'strategies', row.id))
    emit('update:strategies')
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
