import { ref, computed, onMounted, onUnmounted, readonly } from 'vue'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase.js'
import { checkPermission, isAdmin, isUser, ROLES } from '@/utils/permissions.js'

// Global state
const user = ref(null)
const userProfile = ref(null)
const isLoading = ref(true)

// Computed properties
const userRole = computed(() => {
  return userProfile.value?.role || ROLES.USER
})

const isAuthenticated = computed(() => {
  return !!user.value
})

const isAdminUser = computed(() => {
  return isAdmin(userRole.value)
})

const isRegularUser = computed(() => {
  return isUser(userRole.value)
})

// Permission checking function
const hasPermission = (requiredRole) => {
  return checkPermission(userRole.value, requiredRole)
}

// Fetch user profile from Firestore
const fetchUserProfile = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid))
    if (userDoc.exists()) {
      userProfile.value = userDoc.data()
    } else {
      userProfile.value = null
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    userProfile.value = null
  }
}

// Logout function
const logout = async () => {
  try {
    await signOut(auth)
    user.value = null
    userProfile.value = null
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

// Initialize auth state listener
let isInitialized = false

const initializeAuth = () => {
  if (isInitialized) return

  isLoading.value = true
  isInitialized = true

  onAuthStateChanged(auth, async (userData) => {
    try {
      user.value = userData
      if (userData) {
        await fetchUserProfile(userData.uid)
      } else {
        userProfile.value = null
      }
    } catch (error) {
      console.error('Error in auth state change:', error)
      userProfile.value = null
    } finally {
      isLoading.value = false
    }
  })
}

// Initialize immediately
initializeAuth()

// Composable function
export function useAuth() {
  onMounted(() => {
    // Auth is already initialized globally
  })

  onUnmounted(() => {
    // Don't unsubscribe here as other components might still need it
  })

  return {
    // State
    user: readonly(user),
    userProfile: readonly(userProfile),
    isLoading: readonly(isLoading),

    // Computed
    userRole,
    isAuthenticated,
    isAdminUser,
    isRegularUser,

    // Methods
    hasPermission,
    logout,
    fetchUserProfile
  }
}

// Export individual functions for use outside of components
export {
  user,
  userProfile,
  userRole,
  isAuthenticated,
  isAdminUser,
  isRegularUser,
  hasPermission,
  logout,
  fetchUserProfile
}
