<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Skip Link for keyboard navigation -->
      <a href="#main-content" class="skip-link" tabindex="1">Skip to main content</a>

      <!-- Logo/Brand -->
      <div class="nav-brand" @click="goToHome">MindU</div>

      <!-- Mobile Menu Button -->
      <button
        class="mobile-menu-btn"
        @click="toggleMobileMenu"
        :class="{ 'active': isMobileMenuOpen }"
        :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
        aria-controls="primary-mobile-nav"
        aria-label="Toggle mobile menu"
      >
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
        <span class="hamburger-line"></span>
      </button>

      <!-- Desktop Navigation Items -->
      <div class="nav-items desktop-nav">
        <button @click="goToHome" class="nav-link">Home</button>
        <button @click="goToWellbeing" class="nav-link">Wellbeing</button>
        <button @click="goToMap" class="nav-link">Find Support</button>
      </div>

      <!-- Desktop Right side content -->
      <div class="nav-items desktop-nav">
        <!-- Not logged in - show Login/Register buttons -->
        <template v-if="!user">
          <button @click="goToLogin" class="nav-btn btn-login">Login</button>
          <button @click="goToRegister" class="nav-btn btn-register">Register</button>
        </template>

        <!-- Logged in - show user dropdown -->
        <template v-else>
          <div class="user-dropdown" ref="dropdownRef">
            <button @click="toggleDropdown" class="nav-link btn-user"
                    :aria-expanded="isDropdownOpen ? 'true' : 'false'"
                    aria-controls="user-menu">
              <span class="user-avatar">{{ userInitial }}</span>
              <span class="user-name" v-text="userDisplayName"></span>
              <span class="dropdown-arrow" :class="{ 'open': isDropdownOpen }"></span>
            </button>

            <div v-if="isDropdownOpen" id="user-menu" class="dropdown-menu" role="menu">
              <button v-if="isAdminUser" @click="goToAdmin" class="dropdown-item" role="menuitem" ref="firstMenuItem">
                Admin Panel
              </button>
              <button @click="logout" class="dropdown-item logout-item" role="menuitem" ref="lastMenuItem">
                Logout
              </button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Mobile Menu Backdrop -->
    <div v-if="isMobileMenuOpen" class="mobile-menu-backdrop" @click="closeMobileMenu"></div>

    <!-- Mobile Navigation Menu -->
    <div id="primary-mobile-nav" class="mobile-nav" :class="{ 'open': isMobileMenuOpen }" role="navigation">
      <div class="mobile-nav-content">
        <!-- Navigation Links -->
        <div class="mobile-nav-section">
          <button @click="() => { goToHome(); closeMobileMenu(); }"
                  class="mobile-nav-link"
                  :class="{ 'active': isCurrentRoute('Home') }">
            Home
          </button>
          <button @click="() => { goToWellbeing(); closeMobileMenu(); }"
                  class="mobile-nav-link"
                  :class="{ 'active': isCurrentRoute('Wellbeing') }">
            Wellbeing
          </button>
          <button @click="() => { goToMap(); closeMobileMenu(); }"
                  class="mobile-nav-link"
                  :class="{ 'active': isCurrentRoute('Map') }">
            Find Support
          </button>
        </div>

        <!-- User Section -->
        <div class="mobile-nav-section">
          <!-- Not logged in -->
          <template v-if="!user">
            <button @click="() => { goToLogin(); closeMobileMenu(); }" class="mobile-nav-btn btn-login">
              Login
            </button>
            <button @click="() => { goToRegister(); closeMobileMenu(); }" class="mobile-nav-btn btn-register">
              Register
            </button>
          </template>

          <!-- Logged in -->
          <template v-else>
            <div class="mobile-user-info">
              <div class="mobile-user-avatar">{{ userInitial }}</div>
              <div class="mobile-user-details">
                <div class="mobile-user-name">{{ userDisplayName }}</div>
                <div class="mobile-user-email">{{ user?.email }}</div>
              </div>
            </div>

            <button v-if="isAdminUser" @click="() => { goToAdmin(); closeMobileMenu(); }"
                    class="mobile-nav-link"
                    :class="{ 'active': isCurrentRoute('Admin') }">
              Admin Panel
            </button>

            <button @click="() => { logout(); closeMobileMenu(); }" class="mobile-nav-link logout-item">
              Logout
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/utils/useAuth.js'
import { safeText, sanitizeInput, logSecurityEvent } from '@/utils/security.js'

const router = useRouter()
const route = useRoute()

// Use the auth composable
const { user, userProfile, userRole, isAdminUser, logout: authLogout } = useAuth()

// Local state for dropdown
const isDropdownOpen = ref(false)
const dropdownRef = ref(null)
const firstMenuItem = ref(null)
const lastMenuItem = ref(null)

// Mobile menu state
const isMobileMenuOpen = ref(false)

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

// Route detection for active states
const isCurrentRoute = (routeName) => {
  return route.name === routeName
}

// Navigation methods
const goToHome = () => {
  console.log('goToHome clicked')
  router.push('/')
}

const goToLogin = () => {
  console.log('goToLogin clicked')
  router.push('/login')
}

const goToRegister = () => {
  console.log('goToRegister clicked')
  router.push('/register')
}

const goToWellbeing = () => {
  console.log('goToWellbeing clicked')
  router.push('/wellbeing')
}

const goToMap = () => {
  console.log('goToMap clicked')
  router.push('/map')
}

const goToAdmin = () => {
  console.log('goToAdmin clicked')
  router.push('/admin')
  closeDropdown()
}

// Dropdown methods
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
  if (isDropdownOpen.value) {
    // 将焦点移入第一个菜单项
    setTimeout(() => firstMenuItem.value && firstMenuItem.value.focus(), 0)
  }
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Mobile menu methods
const toggleMobileMenu = () => {
  console.log('toggleMobileMenu clicked, current state:', isMobileMenuOpen.value)
  isMobileMenuOpen.value = !isMobileMenuOpen.value
  // Prevent body scroll when menu is open
  if (isMobileMenuOpen.value) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
  // Close desktop dropdown when opening mobile menu
  if (isMobileMenuOpen.value) {
    closeDropdown()
  }
}

const closeMobileMenu = () => {
  console.log('closeMobileMenu called')
  isMobileMenuOpen.value = false
  document.body.style.overflow = ''
}

// Global key handling for Esc and dropdown arrow navigation
const onKeydown = (e) => {
  if (e.key === 'Escape') {
    closeDropdown()
    closeMobileMenu()
  }
  if (isDropdownOpen.value && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    const first = firstMenuItem.value
    const last = lastMenuItem.value
    if (!first || !last) return
    const active = document.activeElement
    if (e.key === 'ArrowDown') {
      if (active === last) {
        first.focus()
      } else {
        last.focus()
      }
    } else if (e.key === 'ArrowUp') {
      if (active === first) {
        last.focus()
      } else {
        first.focus()
      }
    }
    e.preventDefault()
  }
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

// Close mobile menu when clicking outside
const handleMobileMenuClickOutside = (event) => {
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn')
  const mobileNav = document.querySelector('.mobile-nav')

  if (mobileMenuBtn && !mobileMenuBtn.contains(event.target) &&
      mobileNav && !mobileNav.contains(event.target)) {
    closeMobileMenu()
  }
}

// Lifecycle
onMounted(() => {
  // Add click outside listener
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('click', handleMobileMenuClickOutside)
  document.addEventListener('keydown', onKeydown)

  // Cleanup function
  onUnmounted(() => {
    // Restore body scroll when component is unmounted
    document.body.style.overflow = ''

    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('click', handleMobileMenuClickOutside)
    document.removeEventListener('keydown', onKeydown)
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

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
  position: relative;
}

.hamburger-line {
  width: 100%;
  height: 2px;
  background: var(--forest-dark);
  transition: all 0.3s ease;
  position: absolute;
}

.hamburger-line:nth-child(1) {
  top: 6px;
}

.hamburger-line:nth-child(2) {
  top: 50%;
  transform: translateY(-50%);
}

.hamburger-line:nth-child(3) {
  bottom: 6px;
}

/* Active state - forms X */
.mobile-menu-btn.active .hamburger-line:nth-child(1) {
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
}

.mobile-menu-btn.active .hamburger-line:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.active .hamburger-line:nth-child(3) {
  bottom: 50%;
  transform: translateY(50%) rotate(-45deg);
}

/* Mobile Menu Backdrop */
.mobile-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 999;
}

/* Mobile Navigation */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: var(--forest-light);
  transform: translateY(-100%);
  transition: transform 0.2s ease;
  z-index: 1000;
  max-height: 100vh;
  overflow-y: auto;
  padding-top: 70px;
}

.mobile-nav.open {
  transform: translateY(0);
}

.mobile-nav-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-nav-section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: var(--forest-dark);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease;
  text-decoration: none;
  border-radius: 4px;
}

.mobile-nav-link.active {
  background: var(--forest-medium);
  color: var(--text-light);
  font-weight: 600;
}

.mobile-nav-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 0.9rem;
}

.mobile-nav-btn.btn-login {
  background: transparent;
  color: var(--forest-dark);
  border: 1px solid var(--forest-medium);
}

.mobile-nav-btn.btn-login:hover,
.mobile-nav-btn.btn-login:active {
  background: var(--forest-sage);
}

.mobile-nav-btn.btn-register {
  background: var(--forest-dark);
  color: var(--text-light);
}

.mobile-nav-btn.btn-register:hover,
.mobile-nav-btn.btn-register:active {
  background: var(--forest-deep);
}

/* Mobile User Info */
.mobile-user-info {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--forest-sage);
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.mobile-user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--forest-dark);
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: bold;
  margin-right: 0.75rem;
}

.mobile-user-details {
  flex: 1;
}

.mobile-user-name {
  font-weight: 600;
  color: var(--forest-dark);
  font-size: 0.95rem;
}

.mobile-user-email {
  font-size: 0.75rem;
  color: var(--forest-deep);
  margin-top: 0.1rem;
}

.logout-item {
  color: #dc3545;
}

.logout-item:hover {
  background: #f8d7da;
}

/* Responsive Design */
@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-menu-btn {
    display: flex;
  }

  .nav-container {
    padding: 0.6rem 1rem;
  }

  .nav-brand {
    font-size: 1.2rem;
  }

  .mobile-nav {
    padding-top: 60px;
  }
}

@media (min-width: 769px) {
  .mobile-menu-btn {
    display: none;
  }

  .mobile-nav {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0.5rem;
  }

  .nav-brand {
    font-size: 1.1rem;
  }

  .mobile-nav-content {
    padding: 0.75rem;
  }

  .mobile-nav-link {
    padding: 0.6rem 0.75rem;
    font-size: 0.9rem;
  }

  .mobile-nav-btn {
    padding: 0.6rem 0.75rem;
    font-size: 0.85rem;
  }

  .mobile-nav {
    padding-top: 50px;
  }

  .mobile-user-info {
    padding: 0.5rem;
  }

  .mobile-user-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.8rem;
  }

  .mobile-user-name {
    font-size: 0.9rem;
  }

  .mobile-user-email {
    font-size: 0.7rem;
  }
}
</style>
