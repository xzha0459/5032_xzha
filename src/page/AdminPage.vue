<template>
  <div class="admin-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-10">
          <div class="admin-panel">
            <h1 class="admin-title">Admin Panel</h1>
            <p class="admin-subtitle">Manage users and system settings</p>

            <!-- User Management Section -->
            <div class="admin-section">
              <h2 class="section-title">User Management</h2>

              <div v-if="isLoading" class="loading-state">
                <div class="spinner"></div>
                <p>Loading users...</p>
              </div>

              <div v-else-if="users.length > 0" class="users-table">
                <div class="table-header">
                  <div class="header-cell">User</div>
                  <div class="header-cell">Email</div>
                  <div class="header-cell">Role</div>
                  <div class="header-cell">Age</div>
                  <div class="header-cell">Joined</div>
                  <div class="header-cell">Actions</div>
                </div>

                <div v-for="user in users" :key="user.uid" class="table-row">
                  <div class="table-cell user-cell">
                    <div class="user-avatar">{{ getSafeUserInitial(user.username) }}</div>
                    <div class="user-info">
                      <div class="username" v-text="getSafeUsername(user.username)"></div>
                    </div>
                  </div>
                  <div class="table-cell" v-text="getSafeEmail(user.email)"></div>
                  <div class="table-cell">
                    <span class="role-badge" :class="user.role || 'user'">
                      {{ getRoleDisplayName(user.role || 'user') }}
                    </span>
                  </div>
                  <div class="table-cell">{{ user.age || 'N/A' }}</div>
                  <div class="table-cell">{{ formatDate(user.createdAt) }}</div>
                  <div class="table-cell">
                    <button
                      @click="deleteUser(user.uid)"
                      class="btn-delete"
                      :disabled="user.uid === currentUser?.uid"
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>

              <div v-else class="empty-state">
                <p>No users found.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/composables/useAuth.js'
import { getRoleDisplayName } from '@/utils/permissions.js'
import { sanitizeInput, logSecurityEvent, handleSecurityError } from '@/utils/security.js'

// Use auth composable
const { user: currentUser } = useAuth()

// State
const users = ref([])
const isLoading = ref(true)
const unsubscribe = ref(null)


// Methods
const loadUsers = () => {
  const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
  unsubscribe.value = onSnapshot(q, (snapshot) => {
    users.value = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
    isLoading.value = false
  }, (error) => {
    console.error('Error loading users:', error)
    isLoading.value = false
  })
}

const deleteUser = async (uid) => {
  if (uid === currentUser.value?.uid) {
    alert('You cannot delete your own account!')
    return
  }

  if (confirm('Are you sure you want to delete this user?')) {
    try {
      // 记录删除用户操作
      logSecurityEvent('admin_user_delete', 'Admin deleted user', {
        adminUid: currentUser.value?.uid,
        deletedUserId: uid
      })

      await deleteDoc(doc(db, 'users', uid))
    } catch (error) {
      console.error('Error deleting user:', error)

      // 记录删除失败
      logSecurityEvent('admin_user_delete_failed', 'Admin failed to delete user', {
        adminUid: currentUser.value?.uid,
        deletedUserId: uid,
        error: error.message
      })

      // 使用安全错误处理
      const securityError = handleSecurityError(error, 'admin_user_delete', {
        adminUid: currentUser.value?.uid,
        deletedUserId: uid
      })

      alert(securityError.message)
    }
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

// 安全显示方法
const getSafeUsername = (username) => {
  if (!username) return 'Unknown'
  return sanitizeInput(username)
}

const getSafeEmail = (email) => {
  if (!email) return 'N/A'
  return sanitizeInput(email)
}

const getSafeUserInitial = (username) => {
  if (!username) return 'U'
  const safeUsername = sanitizeInput(username)
  return safeUsername.charAt(0).toUpperCase()
}

// Lifecycle
onMounted(() => {
  loadUsers()
})

onUnmounted(() => {
  if (unsubscribe.value) {
    unsubscribe.value()
  }
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

/* States */
.loading-state, .empty-state {
  text-align: center;
  padding: 3rem;
  color: var(--forest-medium);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--forest-sage);
  border-top: 4px solid var(--forest-dark);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Table */
.users-table {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.table-header, .table-row {
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 1fr 1fr 1fr;
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

/* User info */
.user-cell {
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--forest-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.username {
  font-weight: 600;
  color: var(--forest-dark);
}

/* Role badges */
.role-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.role-badge.user {
  background: #e3f2fd;
  color: #1976d2;
}

.role-badge.admin {
  background: #f3e5f5;
  color: #7b1fa2;
}

/* Buttons */
.btn-delete {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-delete:hover:not(:disabled) {
  background: #c82333;
}

.btn-delete:disabled {
  background: #6c757d;
  cursor: not-allowed;
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
