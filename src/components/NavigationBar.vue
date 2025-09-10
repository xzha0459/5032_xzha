<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo/Brand -->
      <div class="nav-brand">MindU</div>

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
              <span class="user-name">{{ userDisplayName }}</span>
              <span class="dropdown-arrow" :class="{ 'open': isDropdownOpen }">▼</span>
            </button>

            <div v-if="isDropdownOpen" class="dropdown-menu">
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
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase.js'

const router = useRouter()

// User state
const user = ref(null)
const userProfile = ref(null)
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)

// Computed properties
const userDisplayName = computed(() => {
  if (!user.value) return ''
  // 优先使用 Firestore 中的 username
  return userProfile.value?.username || user.value.email?.split('@')[0] || 'User'
})

const userInitial = computed(() => {
  if (!user.value) return 'U'
  // 优先使用 Firestore 中的 username
  const name = userProfile.value?.username || user.value.email?.split('@')[0] || 'User'
  return name.charAt(0).toUpperCase()
})

// Fetch user profile from Firestore
const fetchUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      userProfile.value = userDoc.data()
    } else {
      console.log('No user profile found in Firestore')
      userProfile.value = null
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    userProfile.value = null
  }
}

// Navigation methods
const goToLogin = () => {
  router.push('/login')
}

const goToRegister = () => {
  router.push('/register')
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
    await signOut(auth)
    closeDropdown()
    router.push('/')
  } catch (error) {
    console.error('Error signing out:', error)
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
  // Listen for auth state changes
  const unsubscribe = onAuthStateChanged(auth, async (userData) => {
    user.value = userData
    if (userData) {
      // User is logged in, fetch profile from Firestore
      await fetchUserProfile(userData.uid)
    } else {
      // User is logged out, clear profile
      userProfile.value = null
    }
  })

  // Add click outside listener
  document.addEventListener('click', handleClickOutside)

  // Cleanup function
  onUnmounted(() => {
    unsubscribe()
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
  border-bottom: 1px solid var(--border-light);
}

.nav-container {
  max-width: 100%;
  margin: 0 auto;
  padding: 1rem 8rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-brand {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--forest-dark);
  letter-spacing: 2px;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
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
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--forest-sage);
  color: var(--forest-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
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
  min-width: 120px;
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

/* Responsive */
@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
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
