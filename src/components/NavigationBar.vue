<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <div class="nav-brand" @click="goToHome">MindU</div>

      <!-- Navigation Items -->
      <div class="nav-items">
        <button @click="goToHome" class="nav-link">Home</button>
        <button @click="goToWellbeing" class="nav-link">Wellbeing</button>
        <button @click="goToMap" class="nav-link">Find Support</button>
      </div>

      <!-- Right side content -->
      <div class="nav-items">
        <!-- Not logged in - show Login/Register buttons -->
        <template v-if="!user">
          <button @click="goToLogin" class="nav-btn btn-login">Login</button>
          <button @click="goToRegister" class="nav-btn btn-register">Register</button>
        </template>

        <!-- Logged in - show user dropdown -->
        <template v-else>
          <div class="user-dropdown" ref="dropdownRef">
            <button @click="toggleDropdown" class="nav-link btn-user">
              <span class="user-avatar">{{ userInitial }}</span>
              <span class="user-name" v-text="userDisplayName"></span>
              <span class="dropdown-arrow" :class="{ 'open': isDropdownOpen }"></span>
            </button>

            <div v-if="isDropdownOpen" class="dropdown-menu">
              <button v-if="isAdminUser" @click="goToAdmin" class="dropdown-item">
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
import { useAuth } from '@/utils/useAuth.js'
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

const goToWellbeing = () => {
  router.push('/wellbeing')
}

const goToMap = () => {
  router.push('/map')
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
  padding: 0.6rem 8rem;
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

.nav-items {
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

.nav-btn {
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
}

.btn-register {
  background: var(--forest-dark);
  color: var(--text-light);
  border: 2px solid var(--forest-dark);
}

.btn-register:hover {
  background: var(--forest-deep);
}

/* User dropdown styles */
.user-dropdown {
  position: relative;
}

.btn-user {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* Responsive */
</style>
