<template>
  <div class="table-section">
    <!-- Emotion Strategies Table -->
    <div class="admin-section">
      <h2 class="section-title">Emotion Strategies</h2>

      <!-- Global Search -->
      <div class="table-tools">
        <input v-model="strategyGlobalQuery" class="input" placeholder="Search all..." />
      </div>

      <div class="strategies-table">
        <!-- Column Headers with Sort -->
        <div class="table-header">
          <div class="header-cell sortable" @click="toggleSort('strategies','id')">ID <span>{{ sortIndicators.strategies.id }}</span></div>
          <div class="header-cell sortable" @click="toggleSort('strategies','title')">Title <span>{{ sortIndicators.strategies.title }}</span></div>
          <div class="header-cell sortable" @click="toggleSort('strategies','category')">Category <span>{{ sortIndicators.strategies.category }}</span></div>
          <div class="header-cell">Actions</div>
        </div>

        <!-- Column Filters -->
        <div class="table-header table-header--filters">
          <div class="header-cell"><input v-model="strategyFilters.id" class="input" placeholder="Filter by ID" /></div>
          <div class="header-cell"><input v-model="strategyFilters.title" class="input" placeholder="Filter by Title" /></div>
          <div class="header-cell">
            <select v-model="strategyFilters.category" class="input">
              <option value="">All Categories</option>
              <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
            </select>
          </div>
          <div class="header-cell">
            <button class="btn-action primary" @click="openStrategyModal()">Add Strategy</button>
          </div>
        </div>

        <!-- Table Rows -->
        <div v-for="row in pagedStrategies" :key="row.id" class="table-row">
          <div class="table-cell">{{ row.id }}</div>
          <div class="table-cell">{{ row.title }}</div>
          <div class="table-cell">{{ row.category }}</div>
          <div class="table-cell actions-cell">
            <button class="btn-action" @click="openStrategyModal(row)">Edit</button>
            <button class="btn-action danger" @click="deleteStrategy(row)">Delete</button>
          </div>
        </div>

        <!-- Pagination -->
        <div class="table-footer">
          <button class="btn-page" :disabled="strategyPage===1" @click="strategyPage--">Prev</button>
          <span class="page-info">{{ strategyPage }} / {{ strategyTotalPages }}</span>
          <button class="btn-page" :disabled="strategyPage===strategyTotalPages" @click="strategyPage++">Next</button>
        </div>
      </div>
    </div>

    <!-- Users Management Table -->
    <div class="admin-section">
      <h2 class="section-title">Users Management</h2>

      <!-- Global Search -->
      <div class="table-tools">
        <input v-model="usersGlobalQuery" class="input" placeholder="Search all..." />
      </div>

      <div class="users-table">
        <!-- Column Headers with Sort -->
        <div class="table-header">
          <div class="header-cell sortable" @click="toggleSort('users','username')">Username <span>{{ sortIndicators.users.username }}</span></div>
          <div class="header-cell sortable" @click="toggleSort('users','email')">Email <span>{{ sortIndicators.users.email }}</span></div>
          <div class="header-cell sortable" @click="toggleSort('users','role')">Role <span>{{ sortIndicators.users.role }}</span></div>
          <div class="header-cell sortable" @click="toggleSort('users','createdAt')">Created At <span>{{ sortIndicators.users.createdAt }}</span></div>
        </div>

        <!-- Column Filters -->
        <div class="table-header table-header--filters">
          <div class="header-cell"><input v-model="usersFilters.username" class="input" placeholder="Filter by Username" /></div>
          <div class="header-cell"><input v-model="usersFilters.email" class="input" placeholder="Filter by Email" /></div>
          <div class="header-cell">
            <select v-model="usersFilters.role" class="input">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="header-cell"><input v-model="usersFilters.createdAt" class="input" placeholder="Filter by Date (YYYY-MM-DD)" /></div>
        </div>

        <!-- Table Rows -->
        <div v-for="row in pagedUsers" :key="row.id" class="table-row">
          <div class="table-cell">{{ row.username || 'Unknown' }}</div>
          <div class="table-cell">{{ row.email || 'N/A' }}</div>
          <div class="table-cell">{{ row.role || 'user' }}</div>
          <div class="table-cell">{{ formatDate(row.createdAt) }}</div>
        </div>

        <!-- Pagination -->
        <div class="table-footer">
          <button class="btn-page" :disabled="usersPage===1" @click="usersPage--">Prev</button>
          <span class="page-info">{{ usersPage }} / {{ usersTotalPages }}</span>
          <button class="btn-page" :disabled="usersPage===usersTotalPages" @click="usersPage++">Next</button>
        </div>
      </div>
    </div>

    <!-- Strategy Modal -->
    <div v-if="showStrategyModal" class="modal-backdrop">
      <div class="modal">
        <h3>{{ editingStrategy ? 'Edit Strategy' : 'Add Strategy' }}</h3>
        <div class="form-grid">
          <input v-model="strategyForm.id" class="input" placeholder="ID (auto if empty)" />
          <input v-model="strategyForm.title" class="input" placeholder="Title" />
          <select v-model="strategyForm.category" class="input">
            <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
          </select>
          <input v-model="strategyForm.tags" class="input" placeholder="Tags (comma separated)" />
          <input v-model="strategyForm.description" class="input" placeholder="Description" />
          <textarea v-model="strategyForm.tips" class="input" placeholder="Tips: one per line, format Title::Description"></textarea>
        </div>
        <div class="modal-actions">
          <button class="btn-action" @click="showStrategyModal=false">Cancel</button>
          <button class="btn-action primary" @click="submitStrategy">Save</button>
        </div>
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
/* Layout */
.table-section {
  margin-bottom: 2rem;
}

.admin-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
  border-bottom: 2px solid var(--border-light);
}

/* Tables */
.users-table, .strategies-table {
  background: white;
  border: 1px solid var(--border-light);
  border-radius: 4px;
  overflow: hidden;
  display: grid;
}

.strategies-table {
  grid-template-columns: 1fr 2fr 2fr 1fr;
}

.users-table {
  grid-template-columns: 1.5fr 2fr 1fr 1.2fr;
}

.table-header, .table-row {
  display: contents;
}

.table-header {
  background: #f8f9fa;
  font-weight: 600;
  color: var(--text-primary);
}

.table-header--filters .header-cell {
  background: #f8f9fa;
}

.table-row {
  border-bottom: 1px solid var(--border-light);
}

.table-row:hover {
  background: #f8f9fa;
}

.table-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid #e5e5e5;
  background: #f8f9fa;
}

.table-tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

/* Form Elements */
.input {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ced4da;
  border-radius: 3px;
  background: white;
  color: #495057;
  font-size: 13px;
}

.input:focus {
  outline: none;
  border-color: var(--forest-medium);
  box-shadow: 0 0 0 2px var(--shadow-light);
}

.header-cell, .table-cell {
  padding: 0.5rem;
  border-right: 1px solid var(--border-light);
  display: flex;
  align-items: center;
}

.header-cell:last-child, .table-cell:last-child {
  border-right: none;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: #e9ecef;
}

/* Buttons */
.actions-cell {
  gap: 0.5rem;
}

.btn-action, .btn-page {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 3px;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  font-size: 11px;
}

.btn-action:hover, .btn-page:hover:not(:disabled) {
  background: #5a6268;
}

.btn-action.primary {
  background: var(--forest-medium);
}

.btn-action.primary:hover {
  background: var(--forest-deep);
}

.btn-action.danger {
  background: #dc3545;
}

.btn-action.danger:hover {
  background: #c82333;
}

.btn-page:disabled {
  background: #adb5bd;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 12px;
}

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: white;
  padding: 1rem;
  border-radius: 4px;
  width: min(450px, 90vw);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e5e5;
}

.modal h3 {
  color: #495057;
  margin-bottom: 0.75rem;
  font-size: 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin: 0.5rem 0 0.75rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .header-cell, .table-cell {
    border-right: none;
    border-bottom: 1px solid #e5e5e5;
    padding: 0.75rem;
  }

  .header-cell:last-child, .table-cell:last-child {
    border-bottom: none;
  }
}
</style>
