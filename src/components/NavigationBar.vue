<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <div class="nav-brand" @click="goToHome">MindU</div>

      <!-- Navigation Links -->
      <div class="nav-links">
        <button @click="goToHome" class="nav-link">Home</button>
        <button @click="goToEmotionManagement" class="nav-link">Wellbeing</button>
      </div>

      <!-- Right side content -->
      <div class="nav-buttons">
        <!-- Not logged in - show Login/Register buttons -->
        <template v-if="!user">
          <button @click="goToLogin" class="btn btn-login">Login</button>
          <button @click="goToRegister" class="btn btn-register">Register</button>
        </template>

        <!-- Logged in - show user dropdown -->
        <template v-else>
          <div class="user-dropdown" ref="dropdownRef">
            <button @click="toggleDropdown" class="btn btn-user">
              <span class="user-avatar">{{ userInitial }}</span>
              <span class="user-name" v-text="userDisplayName"></span>
              <span class="dropdown-arrow" :class="{ 'open': isDropdownOpen }">▼</span>
            </button>

            <div v-if="isDropdownOpen" class="dropdown-menu">
              <div class="dropdown-header">
                <div class="user-info-dropdown">
                  <div class="user-avatar-small">{{ userInitial }}</div>
                  <div class="user-details-dropdown">
                    <div class="user-name-dropdown" v-text="userDisplayName"></div>
                    <div class="user-role-dropdown" v-text="userRoleDisplay"></div>
                  </div>
                </div>
              </div>
              <button v-if="isAdminUser" @click="goToAdmin" class="dropdown-item admin-item">
                Admin Panel
              </button>
              <button @click="logout" class="dropdown-item logout-item">
                Logout
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth.js'
import { getRoleDisplayName } from '@/utils/permissions.js'
import { safeText, sanitizeInput, logSecurityEvent } from '@/utils/security.js'

const router = useRouter()

// Use the auth composable
const { user, userProfile, userRole, isAdminUser, logout: authLogout } = useAuth()

// Local state for dropdown
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

// Computed properties
const userDisplayName = computed(() => {
  if (!user.value) return ''
  // 优先使用 Firestore 中的 username，并进行安全处理
  const rawName = userProfile.value?.username || user.value.email?.split('@')[0] || 'User'
  return safeText(sanitizeInput(rawName))
})

const userInitial = computed(() => {
  if (!user.value) return 'U'
  // 优先使用 Firestore 中的 username，并进行安全处理
  const rawName = userProfile.value?.username || user.value.email?.split('@')[0] || 'User'
  const safeName = sanitizeInput(rawName)
  return safeName.charAt(0).toUpperCase()
})

const userRoleDisplay = computed(() => {
  return getRoleDisplayName(userRole.value)
})

// Navigation methods
const goToHome = () => {
  router.push('/')
}

const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
}

const goToEmotionManagement = () => {
  router.push('/emotion-management')
}

const goToAdmin = () => {
  router.push('/admin')
  closeDropdown()
}

// Dropdown methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Logout method
const logout = async () => {
  try {
    // 记录安全事件
    logSecurityEvent('user_logout', 'User logged out successfully', {
      uid: user.value?.uid,
      email: user.value?.email,
      role: userRole.value
    })

    await authLogout()
    closeDropdown()
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)

    // 记录安全错误
    logSecurityEvent('logout_error', 'Error during logout', {
      uid: user.value?.uid,
      email: user.value?.email,
      role: userRole.value,
      error: error.message
    })
  }
}

// Click outside to close dropdown
const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// Lifecycle
onMounted(() => {
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)

  // Cleanup function
  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
  })
})
</script>

<style scoped>
.navbar {
  background: var(--forest-light);
  box-shadow: 0 2px 8px var(--shadow-light);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0.8rem 8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--forest-dark);
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}

.nav-brand:hover {
  color: var(--forest-deep);
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  background: none;
  border: none;
  color: var(--forest-dark);
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.nav-link:hover {
  background: var(--forest-sage);
  color: var(--forest-deep);
}

.nav-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.4rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
}

.btn-login {
  background: transparent;
  color: var(--forest-dark);
  border: 2px solid var(--forest-medium);
}

.btn-login:hover {
  background: var(--forest-medium);
  color: var(--text-light);
  transform: translateY(-1px);
}

.btn-register {
  background: var(--forest-dark);
  color: var(--text-light);
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.btn-register:hover {
  background: var(--forest-deep);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-dark);
}

/* User dropdown styles */
.user-dropdown {
  position: relative;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: var(--forest-dark);
  padding: 0.6rem 1rem;
}

.btn-user:hover {
  background: var(--forest-sage);
  color: var(--forest-deep);
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--forest-sage);
  color: var(--forest-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.dropdown-arrow {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.dropdown-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: var(--forest-light);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--shadow-medium);
  min-width: 200px;
  z-index: 1000;
  margin-top: 0.5rem;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.dropdown-item:hover {
  background: var(--forest-sage);
}

.logout-item {
  color: #dc3545;
  font-weight: 600;
  font-size: 0.95rem;
}

.logout-item:hover {
  background: #f8d7da;
  color: #721c24;
}

/* Dropdown header styles */
.dropdown-header {
  padding: 1rem;
  background: var(--forest-sage);
  border-bottom: 1px solid var(--border-light);
}

.user-info-dropdown {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--forest-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-details-dropdown {
  flex: 1;
}

.user-name-dropdown {
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--forest-dark);
  margin-bottom: 0.25rem;
}

.user-role-dropdown {
  font-size: 0.8rem;
  color: var(--forest-medium);
  text-transform: capitalize;
}


.admin-item {
  color: var(--forest-dark);
  font-weight: 600;
}

.admin-item:hover {
  background: var(--forest-sage);
  color: var(--forest-deep);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    padding: 0.6rem;
  }

  .btn {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }

  .nav-brand {
    font-size: 1.5rem;
  }

  .btn-user {
    padding: 0.5rem 0.75rem;
  }

  .user-name {
    display: none;
  }

  .dropdown-menu {
    min-width: 160px;
  }
}
</style>
