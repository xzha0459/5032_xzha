// Role-based authentication utilities

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin'
}

// Role hierarchy - higher index means higher privilege
const ROLE_HIERARCHY = [ROLES.USER, ROLES.ADMIN]

/**
 * Check if a user role has permission for a required role
 * @param {string} userRole - The user's current role
 * @param {string} requiredRole - The role required for access
 * @returns {boolean} - True if user has permission
 */
export const checkPermission = (userRole, requiredRole) => {
  if (!userRole || !requiredRole) return false

  const userRoleLevel = ROLE_HIERARCHY.indexOf(userRole)
  const requiredRoleLevel = ROLE_HIERARCHY.indexOf(requiredRole)

  // Return true if user role level is equal or higher than required
  return userRoleLevel >= requiredRoleLevel
}

/**
 * Check if user has admin permissions
 * @param {string} userRole - The user's current role
 * @returns {boolean} - True if user is admin
 */
export const isAdmin = (userRole) => {
  return userRole === ROLES.ADMIN
}

/**
 * Check if user has user permissions (basic access)
 * @param {string} userRole - The user's current role
 * @returns {boolean} - True if user has at least user role
 */
export const isUser = (userRole) => {
  return userRole === ROLES.USER || userRole === ROLES.ADMIN
}

/**
 * Get all roles that the user can access
 * @param {string} userRole - The user's current role
 * @returns {string[]} - Array of roles the user can access
 */
export const getAccessibleRoles = (userRole) => {
  if (!userRole) return []

  const userRoleLevel = ROLE_HIERARCHY.indexOf(userRole)
  return ROLE_HIERARCHY.slice(0, userRoleLevel + 1)
}

/**
 * Get role display name
 * @param {string} role - The role
 * @returns {string} - Display name for the role
 */
export const getRoleDisplayName = (role) => {
  const roleNames = {
    [ROLES.USER]: 'User',
    [ROLES.ADMIN]: 'Administrator'
  }
  return roleNames[role] || 'Unknown'
}
