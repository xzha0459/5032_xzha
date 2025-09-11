export function escapeHtml(text) {
  if (typeof text !== 'string') return ''

  const map = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;',
    '"': '&quot;', "'": '&#x27;', '/': '&#x2F;'
  }

  return text.replace(/[&<>"'/]/g, s => map[s])
}

// Alias for escapeHtml for backward compatibility
export function safeText(text) {
  return escapeHtml(text)
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return ''

  return input
    .replace(/<[^>]*>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

export function containsXSS(text) {
  if (typeof text !== 'string') return false

  const dangerous = [
    /<script/i, /javascript:/i, /on\w+\s*=/i,
    /<iframe/i, /<object/i, /<embed/i
  ]

  return dangerous.some(pattern => pattern.test(text))
}

export function isValidEmail(email) {
  if (typeof email !== 'string') return false
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email) && email.length <= 100
}

export function isValidUsername(username) {
  if (typeof username !== 'string') return false
  const regex = /^[a-zA-Z0-9_]{3,20}$/
  return regex.test(username) && username !== 'admin'
}

export function validatePassword(password) {
  if (typeof password !== 'string') {
    return { isValid: false, message: 'Password must be a string' }
  }

  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Must contain lowercase letter' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Must contain uppercase letter' }
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Must contain number' }
  }

  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { isValid: false, message: 'Must contain special character' }
  }

  return { isValid: true, message: 'Password is valid' }
}

export function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' }
  }

  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' }
  }

  return { isValid: true, message: 'Passwords match' }
}

export function isValidAge(age) {
  return typeof age === 'number' && age >= 13 && age <= 24
}

export function isValidRole(role) {
  return typeof role === 'string' && ['user', 'admin'].includes(role)
}

export function createSafeUserData(userData) {
  if (!userData || typeof userData !== 'object') return null

  const safeData = {
    createdAt: new Date().toISOString()
  }

  // 只处理允许的字段
  if (userData.email && isValidEmail(userData.email)) {
    safeData.email = sanitizeInput(userData.email)
  }

  if (userData.username && isValidUsername(userData.username)) {
    safeData.username = sanitizeInput(userData.username)
  }

  if (userData.age && isValidAge(userData.age)) {
    safeData.age = userData.age
  }

  if (userData.role && isValidRole(userData.role)) {
    safeData.role = userData.role
  }

  if (userData.uid) {
    safeData.uid = userData.uid
  }

  return safeData
}

export function logSecurityEvent(event, details, userData = null) {
  if (import.meta.env.DEV) {
    console.warn(`🔒 Security Event: ${event}`, { details, userData, timestamp: new Date().toISOString() })
  }
}

export function handleSecurityError(error, context) {
  logSecurityEvent('security_error', { context, error: error.message })

  return {
    message: 'An error occurred. Please try again.',
    code: 'SECURITY_ERROR'
  }
}
