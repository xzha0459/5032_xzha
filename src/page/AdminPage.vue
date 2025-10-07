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

            <!-- Table 1: Emotion Strategies (from emotionStrategies.js) -->
            <div class="admin-section">
              <h2 class="section-title">Emotion Strategies</h2>

              <div class="table-tools">
                <input v-model="strategyGlobalQuery" class="input" placeholder="Search all..." />
              </div>

              <div class="strategies-table">
                <div class="table-header table-header--filters">
                  <div class="header-cell sortable" @click="toggleSort('strategies','id')">ID <span>{{ sortIndicators.strategies.id }}</span></div>
                  <div class="header-cell sortable" @click="toggleSort('strategies','title')">Title <span>{{ sortIndicators.strategies.title }}</span></div>
                  <div class="header-cell sortable" @click="toggleSort('strategies','category')">Category <span>{{ sortIndicators.strategies.category }}</span></div>
                  <div class="header-cell actions-cell">
                    <button class="btn-action primary" @click="openStrategyModal()">Add</button>
                  </div>
                </div>

                <div class="table-header table-header--filters">
                  <div class="header-cell"><input v-model="strategyFilters.id" class="input" placeholder="By ID" /></div>
                  <div class="header-cell"><input v-model="strategyFilters.title" class="input" placeholder="By title" /></div>
                  <div class="header-cell">
                    <select v-model="strategyFilters.category" class="input">
                      <option value="">All categories</option>
                      <option v-for="c in CATEGORIES" :key="c" :value="c">{{ c }}</option>
                    </select>
                  </div>
                  <div class="header-cell"></div>
                </div>

                <div v-for="row in pagedStrategies" :key="row.id" class="table-row">
                  <div class="table-cell">{{ row.id }}</div>
                  <div class="table-cell">{{ row.title }}</div>
                  <div class="table-cell">{{ row.category }}</div>
                  <div class="table-cell actions-cell">
                    <button class="btn-action" @click="openStrategyModal(row)">Edit</button>
                    <button class="btn-action danger" @click="deleteStrategy(row)">Delete</button>
                  </div>
                </div>

                <div class="table-footer">
                  <button class="btn-page" :disabled="strategyPage===1" @click="strategyPage--">Prev</button>
                  <span class="page-info">{{ strategyPage }} / {{ strategyTotalPages }}</span>
                  <button class="btn-page" :disabled="strategyPage===strategyTotalPages" @click="strategyPage++">Next</button>
                </div>
              </div>
            </div>

            <!-- Table 2: Users Management -->
            <div class="admin-section">
              <h2 class="section-title">Users Management</h2>

              <div class="table-tools">
                <input v-model="usersGlobalQuery" class="input" placeholder="Search all..." />
              </div>

              <div class="users-table">
                <div class="table-header table-header--filters">
                  <div class="header-cell sortable" @click="toggleSort('users','username')">Username <span>{{ sortIndicators.users.username }}</span></div>
                  <div class="header-cell sortable" @click="toggleSort('users','email')">Email <span>{{ sortIndicators.users.email }}</span></div>
                  <div class="header-cell sortable" @click="toggleSort('users','role')">Role <span>{{ sortIndicators.users.role }}</span></div>
                  <div class="header-cell sortable" @click="toggleSort('users','createdAt')">Created At <span>{{ sortIndicators.users.createdAt }}</span></div>
                  <div class="header-cell sortable" @click="toggleSort('users','age')">Age <span>{{ sortIndicators.users.age }}</span></div>
                  <div class="header-cell actions-cell">
                    <button class="btn-action primary" @click="openUserModal()">Add</button>
                  </div>
                </div>

                <div class="table-header table-header--filters">
                  <div class="header-cell"><input v-model="usersFilters.username" class="input" placeholder="By username" /></div>
                  <div class="header-cell"><input v-model="usersFilters.email" class="input" placeholder="By email" /></div>
                  <div class="header-cell">
                    <select v-model="usersFilters.role" class="input">
                      <option value="">All roles</option>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div class="header-cell"><input v-model="usersFilters.createdAt" class="input" placeholder="By date (YYYY-MM-DD)" /></div>
                  <div class="header-cell"><input v-model.number="usersFilters.age" class="input" placeholder="By age (number)" /></div>
                  <div class="header-cell"></div>
                </div>

                <div v-for="row in pagedUsers" :key="row.id" class="table-row">
                  <div class="table-cell">{{ row.username || 'Unknown' }}</div>
                  <div class="table-cell">{{ row.email || 'N/A' }}</div>
                  <div class="table-cell">{{ row.role || 'user' }}</div>
                  <div class="table-cell">{{ formatDate(row.createdAt) }}</div>
                  <div class="table-cell">{{ row.age ?? 'N/A' }}</div>
                  <div class="table-cell actions-cell">
                    <button class="btn-action" @click="openUserModal(row)">Edit</button>
                    <button class="btn-action danger" @click="deleteUserRow(row)">Delete</button>
                  </div>
                </div>

                <div class="table-footer">
                  <button class="btn-page" :disabled="usersPage===1" @click="usersPage--">Prev</button>
                  <span class="page-info">{{ usersPage }} / {{ usersTotalPages }}</span>
                  <button class="btn-page" :disabled="usersPage===usersTotalPages" @click="usersPage++">Next</button>
                </div>
              </div>
            </div>

            </div> <!-- End admin content -->
          </div>
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

    <!-- User Modal -->
    <div v-if="showUserModal" class="modal-backdrop">
      <div class="modal">
        <h3>{{ editingUser ? 'Edit User' : 'Add User' }}</h3>
        <div class="form-grid">
          <input v-model="userForm.uid" class="input" placeholder="UID (required)" />
          <input v-model="userForm.username" class="input" placeholder="Username" />
          <input v-model="userForm.email" class="input" placeholder="Email" />
          <select v-model="userForm.role" class="input">
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          <input v-model.number="userForm.age" class="input" placeholder="Age" />
          <input v-model="userForm.createdAt" class="input" placeholder="Created At (ISO)" />
        </div>
        <div class="modal-actions">
          <button class="btn-action" @click="showUserModal=false">Cancel</button>
          <button class="btn-action primary" @click="submitUser">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getDocs, collection, setDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/composables/useAuth.js'
import { sanitizeInput } from '@/utils/security.js'
import { mainCategories } from '@/data/emotionStrategies.js'

// Use auth composable
const { user: currentUser, isAdminUser, isLoading: authLoading } = useAuth()

// Router for redirects
import { useRouter } from 'vue-router'
const router = useRouter()

// State
const isLoading = ref(false)
// dataset
const strategies = ref([])

// table state - strategies (rich format)
const strategyGlobalQuery = ref('')
const strategyFilters = ref({ title: '', category: '', tag: '', id: '', description: '' })
const strategySort = ref({ key: 'title', dir: 'asc' })
const strategyPage = ref(1)
const pageSize = 10

// table state - users
const users = ref([])
const usersGlobalQuery = ref('')
const usersFilters = ref({ username: '', email: '', role: '', age: undefined, createdAt: '' })
const usersSort = ref({ key: 'createdAt', dir: 'desc' })
const usersPage = ref(1)


// Methods
const CATEGORY_NAME_BY_ID = Object.fromEntries(mainCategories.map(c => [c.id, c.name]))
const CATEGORIES = mainCategories.map(c => c.name)

// no local seed/cache, Firestore is source of truth now

const loadStrategiesFromFirestore = async () => {
  try {
    const snap = await getDocs(collection(db, 'strategies'))
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    if (docs.length > 0) {
      strategies.value = docs
    }
  } catch (e) {
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// 安全显示方法
const getSafeUsername = (username) => (username ? sanitizeInput(username) : 'Unknown')
const getSafeEmail = (email) => (email ? sanitizeInput(email) : 'N/A')

// Watch for auth changes and redirect if not admin
watch([authLoading, isAdminUser], ([loading, isAdmin]) => {
  if (!loading && !isAdmin) {
    // User is not admin, redirect to home
    router.push('/')
  }
}, { immediate: true })

// sorting helpers
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
    age: indicator('users','age'),
    createdAt: indicator('users','createdAt')
  }
}))

function indicator(table, key) {
  const state = table === 'strategies' ? strategySort.value : usersSort.value
  if (state.key !== key) return ''
  return state.dir === 'asc' ? '▲' : '▼'
}

// computed: filtered/sorted/paged strategies
const filteredStrategies = computed(() => {
  const q = strategyGlobalQuery.value.trim().toLowerCase()
  const f = strategyFilters.value
  return strategies.value.filter(s => {
    const passGlobal = !q || [s.title, s.category, s.tags.join(','), s.description || '', s.id].some(v => String(v).toLowerCase().includes(q))
    const passTitle = !f.title || s.title.toLowerCase().includes(f.title.toLowerCase())
    const passCat = !f.category || s.category.toLowerCase().includes(f.category.toLowerCase())
    const passTag = !f.tag || s.tags.some(t => t.toLowerCase().includes(f.tag.toLowerCase()))
    const passDesc = !f.description || (s.description || '').toLowerCase().includes(f.description.toLowerCase())
    const passId = !f.id || s.id.toLowerCase().includes(f.id.toLowerCase())
    return passGlobal && passTitle && passCat && passTag && passDesc && passId
  })
})

const sortedStrategies = computed(() => {
  const { key, dir } = strategySort.value
  return [...filteredStrategies.value].sort((a,b) => {
    const va = a[key]
    const vb = b[key]
    return String(va || '').localeCompare(String(vb || '')) * (dir==='asc'?1:-1)
  })
})

const strategyTotalPages = computed(() => Math.max(1, Math.ceil(sortedStrategies.value.length / pageSize)))
const pagedStrategies = computed(() => {
  if (strategyPage.value > strategyTotalPages.value) strategyPage.value = strategyTotalPages.value
  const start = (strategyPage.value - 1) * pageSize
  return sortedStrategies.value.slice(start, start + pageSize)
})

// computed: filtered/sorted/paged users
const filteredUsers = computed(() => {
  const q = usersGlobalQuery.value.trim().toLowerCase()
  const f = usersFilters.value
  return users.value.filter(u => {
    const passGlobal = !q || [u.username, u.email, u.role, String(u.age), u.createdAt].some(v => String(v || '').toLowerCase().includes(q))
    const passUsername = !f.username || String(u.username || '').toLowerCase().includes(f.username.toLowerCase())
    const passEmail = !f.email || String(u.email || '').toLowerCase().includes(f.email.toLowerCase())
    const passRole = !f.role || String(u.role || '').toLowerCase().includes(f.role.toLowerCase())
    const passAge = f.age === undefined || Number(u.age) === Number(f.age)
    const passDate = !f.createdAt || String(u.createdAt || '').slice(0,10) === f.createdAt
    return passGlobal && passUsername && passEmail && passRole && passAge && passDate
  })
})

const sortedUsers = computed(() => {
  const { key, dir } = usersSort.value
  return [...filteredUsers.value].sort((a,b) => {
    const va = a[key]
    const vb = b[key]
    if (key === 'createdAt') return (new Date(va) - new Date(vb)) * (dir==='asc'?1:-1)
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * (dir==='asc'?1:-1)
    return String(va || '').localeCompare(String(vb || '')) * (dir==='asc'?1:-1)
  })
})

const usersTotalPages = computed(() => Math.max(1, Math.ceil(sortedUsers.value.length / pageSize)))
const pagedUsers = computed(() => {
  if (usersPage.value > usersTotalPages.value) usersPage.value = usersTotalPages.value
  const start = (usersPage.value - 1) * pageSize
  return sortedUsers.value.slice(start, start + pageSize)
})

// Lifecycle
onMounted(() => {
  loadStrategiesFromFirestore()
  loadUsersFromFirestore()
})

// Modals state
const showStrategyModal = ref(false)
const editingStrategy = ref(null)
const strategyForm = ref({ id: '', title: '', category: 'Anxiety Management', description: '', tags: '', tips: '' })

const showUserModal = ref(false)
const editingUser = ref(null)
const userForm = ref({ id: '', uid: '', username: '', email: '', role: 'user', age: undefined, createdAt: '' })

const openStrategyModal = (row) => {
  editingStrategy.value = row || null
  strategyForm.value = row
    ? { id: row.id, title: row.title, category: row.category, description: row.description || '', tags: row.tags.join(', '), tips: (row.tips||[]).map(t=>`${t.title}::${t.description}`).join('\n') }
    : { id: '', title: '', category: 'Anxiety Management', description: '', tags: '', tips: '' }
  showStrategyModal.value = true
}

const openUserModal = (row) => {
  editingUser.value = row || null
  userForm.value = row
    ? { id: row.id, uid: row.uid || row.id, username: row.username || '', email: row.email || '', role: row.role || 'user', age: row.age, createdAt: row.createdAt || new Date().toISOString() }
    : { id: '', uid: '', username: '', email: '', role: 'user', age: undefined, createdAt: new Date().toISOString() }
  showUserModal.value = true
}

// Strategy CRUD (local persistence)
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
  if (editingStrategy.value) {
    const idx = strategies.value.findIndex(s => s.id === editingStrategy.value.id)
    if (idx !== -1) strategies.value[idx] = payload
  } else {
    strategies.value.unshift(payload)
  }
  try {
    await setDoc(doc(db, 'strategies', payload.id), payload, { merge: true })
  } catch (e) {
    console.error('Failed to save strategy to Firestore:', e)
  }
  await loadStrategiesFromFirestore()
  showStrategyModal.value = false
}

const deleteStrategy = async (row) => {
  strategies.value = strategies.value.filter(s => s.id !== row.id)
  try {
    await deleteDoc(doc(db, 'strategies', row.id))
  } catch (e) {
    console.error('Failed to delete strategy from Firestore:', e)
  }
  await loadStrategiesFromFirestore()
}

const submitUser = async () => {
  const id = (userForm.value.id || userForm.value.uid).trim()
  if (!id) return alert('UID is required')
  const payload = {
    uid: id,
    username: (userForm.value.username || '').trim(),
    email: (userForm.value.email || '').trim(),
    role: userForm.value.role || 'user',
    age: userForm.value.age ?? null,
    createdAt: userForm.value.createdAt || new Date().toISOString()
  }
  await setDoc(doc(db, 'users', id), payload, { merge: true })
  await loadUsersFromFirestore()
  showUserModal.value = false
}

const deleteUserRow = async (row) => {
  try {
    await deleteDoc(doc(db, 'users', row.id))
    await loadUsersFromFirestore()
  } catch (e) {
    alert('Failed to delete user')
  }
}
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

/* Table */
.users-table, .strategies-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-light);
  display: grid;
}

.strategies-table {
  grid-template-columns: 1fr 2fr 2fr 1fr; /* ID | Title | Category | Actions */
}

.users-table {
  grid-template-columns: 1.5fr 2fr 1fr 1.2fr 0.8fr 1fr; /* Username | Email | Role | Created | Age | Actions */
}

.table-header, .table-row {
  display: contents; /* let children align to parent grid columns */
}

.table-header {
  background: var(--forest-sage);
  font-weight: 600;
  color: var(--forest-dark);
}

.table-row {
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.2s;
}

.table-row:hover {
  background: var(--forest-light);
}
.table-footer {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-light);
}

.btn-page {
  background: var(--forest-dark);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  padding: 0.4rem 0.8rem;
  cursor: pointer;
}

.btn-page:disabled {
  background: var(--forest-muted);
  cursor: not-allowed;
}

.page-info {
  color: var(--forest-deep);
}

.table-tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 0.5rem;
}

.input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--border-light);
  border-radius: 6px;
  background: var(--forest-light);
}

.table-header--filters .header-cell {
  background: #f9faf8;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.table-row:last-child {
  border-bottom: none;
}

.header-cell, .table-cell {
  padding: 1rem;
  border-right: 1px solid var(--border-light);
  display: flex;
  align-items: center;
}

.header-cell:last-child, .table-cell:last-child {
  border-right: none;
}



/* Actions */
.actions-cell {
  gap: 0.5rem;
}

.btn-action {
  background: var(--forest-medium);
  color: #fff;
  border: none;
  border-radius: 4px;
  padding: 0.35rem 0.75rem;
  cursor: pointer;
}

.btn-action.primary { background: var(--forest-dark); }
.btn-action.danger { background: #dc3545; }

/* Modal */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal {
  background: #fff;
  padding: 1rem;
  border-radius: 8px;
  width: min(600px, 92vw);
  box-shadow: 0 6px 24px rgba(0,0,0,0.2);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0.75rem 0 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
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

  .table-header, .table-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .header-cell, .table-cell {
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    padding: 0.75rem;
  }

  .header-cell:last-child, .table-cell:last-child {
    border-bottom: none;
  }
}
</style>
