<template>
  <div class="auth-form">
    <h2 class="form-title">Create Account</h2>

    <form @submit.prevent="submitForm">
      <!-- Email Field -->
      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="form.email"
          @input="validateEmail"
          type="email"
          placeholder="Enter your email"
          class="input"
          :class="{ error: emailError, valid: form.email && !emailError }"
        />
        <span v-if="emailError" class="error-msg">{{ emailError }}</span>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password">Password *</label>
        <input
          id="password"
          v-model="form.password"
          @input="validatePassword"
          type="password"
          placeholder="Enter password"
          class="input"
          :class="{ error: passwordError, valid: form.password && !passwordError }"
        />
        <span v-if="passwordError" class="error-msg">{{ passwordError }}</span>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-group">
        <label for="confirmPassword">Confirm Password *</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          @input="validateConfirmPassword"
          type="password"
          placeholder="Confirm your password"
          class="input"
          :class="{ error: confirmPasswordError, valid: form.confirmPassword && !confirmPasswordError }"
        />
        <span v-if="confirmPasswordError" class="error-msg">{{ confirmPasswordError }}</span>
      </div>

      <!-- Age Field -->
      <div class="form-group">
        <label for="age">Age *</label>
        <input
          id="age"
          v-model.number="form.age"
          @input="validateAge"
          type="number"
          placeholder="Enter your age (13-24)"
          class="input"
          :class="{ error: ageError, valid: form.age && !ageError }"
        />
        <span v-if="ageError" class="error-msg">{{ ageError }}</span>
      </div>

      <!-- Username Field -->
      <div class="form-group">
        <label for="username">Username *</label>
        <input
          id="username"
          v-model="form.username"
          @input="validateUsername"
          type="text"
          placeholder="Choose a username"
          class="input"
          :class="{ error: usernameError, valid: form.username && !usernameError }"
        />
        <span v-if="usernameError" class="error-msg">{{ usernameError }}</span>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="!isFormValid" class="btn submit">
        {{ isSubmitting ? 'Creating...' : 'Create Account' }}
      </button>

      <!-- Form Errors -->
      <div v-if="formErrors.length" class="alert alert-danger">
        <h6 class="alert-heading">Please fix:</h6>
        <ul class="error-list">
          <li v-for="error in formErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Success Message -->
      <div v-if="success" class="alert alert-success success-message">
        ✅ Account created successfully!
      </div>
    </form>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/firebase.js'
import { useRouter } from 'vue-router'
import {
  sanitizeInput,
  isValidEmail,
  validatePassword,
  validateConfirmPassword,
  isValidUsername,
  isValidAge,
  containsXSS,
  logSecurityEvent,
  handleSecurityError,
  createSafeUserData
} from '@/utils/security.js'

export default {
  name: 'RegisterForm',
  setup() {
    const router = useRouter()
    return { router }
  },
  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        age: null,
        username: '',
      },
      emailError: '',
      passwordError: '',
      confirmPasswordError: '',
      ageError: '',
      usernameError: '',
      formErrors: [],
      isSubmitting: false,
      success: false,
    }
  },
  computed: {
    isFormValid() {
      return this.form.email && this.form.password && this.form.confirmPassword &&
             this.form.age && this.form.username &&
             !this.emailError && !this.passwordError && !this.confirmPasswordError &&
             !this.ageError && !this.usernameError
    }
  },
  methods: {
    validateEmail() {
      if (!this.form.email) {
        this.emailError = 'Email is required'
        return
      }

      if (containsXSS(this.form.email)) {
        logSecurityEvent('xss_attempt', 'XSS attempt detected in email field', { email: this.form.email })
        this.emailError = 'Invalid email format'
        return
      }

      const cleanedEmail = sanitizeInput(this.form.email)
      if (!isValidEmail(cleanedEmail)) {
        this.emailError = 'Invalid email format'
        return
      }

      this.emailError = ''
    },

    validatePassword() {
      if (!this.form.password) {
        this.passwordError = 'Password is required'
        return
      }

      if (containsXSS(this.form.password)) {
        logSecurityEvent('xss_attempt', 'XSS attempt detected in password field')
        this.passwordError = 'Password contains invalid characters'
        return
      }

      const passwordValidation = validatePassword(this.form.password)
      if (!passwordValidation.isValid) {
        this.passwordError = passwordValidation.message
        return
      }

      this.passwordError = ''
      // Re-validate confirm password if it exists
      if (this.form.confirmPassword) {
        this.validateConfirmPassword()
      }
    },

    validateConfirmPassword() {
      if (!this.form.confirmPassword) {
        this.confirmPasswordError = 'Please confirm your password'
        return
      }

      const confirmValidation = validateConfirmPassword(this.form.password, this.form.confirmPassword)
      if (!confirmValidation.isValid) {
        this.confirmPasswordError = confirmValidation.message
        return
      }

      this.confirmPasswordError = ''
    },

    validateAge() {
      if (!this.form.age) {
        this.ageError = 'Age is required'
        return
      }

      const age = parseInt(this.form.age)
      if (isNaN(age)) {
        this.ageError = 'Age must be a valid number'
        return
      }

      if (!isValidAge(age)) {
        this.ageError = 'Age must be between 13-24'
        return
      }

      this.ageError = ''
    },

    validateUsername() {
      if (!this.form.username) {
        this.usernameError = 'Username is required'
        return
      }

      if (containsXSS(this.form.username)) {
        logSecurityEvent('xss_attempt', 'XSS attempt detected in username field', { username: this.form.username })
        this.usernameError = 'Username contains invalid characters'
        return
      }

      const cleanedUsername = sanitizeInput(this.form.username)
      if (!isValidUsername(cleanedUsername)) {
        if (cleanedUsername.length < 3) {
          this.usernameError = 'Username must be at least 3 characters'
        } else if (!/^[a-zA-Z0-9_]+$/.test(cleanedUsername)) {
          this.usernameError = 'Username can only contain letters, numbers, underscore'
        } else if (cleanedUsername === 'admin') {
          this.usernameError = 'Username "admin" is reserved'
        } else {
          this.usernameError = 'Username contains invalid characters'
        }
        return
      }

      this.usernameError = ''
    },

    async submitForm() {
      this.formErrors = []
      this.validateEmail()
      this.validatePassword()
      this.validateConfirmPassword()
      this.validateAge()
      this.validateUsername()

      if (!this.isFormValid) {
        return
      }

      this.isSubmitting = true

      try {
        const cleanedEmail = sanitizeInput(this.form.email)
        const cleanedPassword = sanitizeInput(this.form.password)
        const cleanedUsername = sanitizeInput(this.form.username)

        logSecurityEvent('register_attempt', 'User attempting to register', {
          email: cleanedEmail,
          username: cleanedUsername,
          role: 'user'
        })

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanedEmail,
          cleanedPassword
        )

        const safeUserData = createSafeUserData({
          uid: userCredential.user.uid,
          email: cleanedEmail,
          username: cleanedUsername,
          age: parseInt(this.form.age),
          role: 'user'
        })

        await setDoc(doc(db, 'users', userCredential.user.uid), safeUserData)

        this.success = true
        this.isSubmitting = false

        logSecurityEvent('register_success', 'User registered successfully', {
          uid: userCredential.user.uid,
          email: cleanedEmail,
          username: cleanedUsername,
          role: 'user'
        })

        console.log('User created successfully:', userCredential.user.uid)

        this.resetForm()

        setTimeout(() => {
          this.success = false
          this.router.push('/login')
        }, 2000)

      } catch (error) {
        console.error('Error creating user:', error)
        this.isSubmitting = false

        logSecurityEvent('register_failed', 'Registration attempt failed', {
          email: this.form.email,
          username: this.form.username,
          error: error.code
        })

        const securityError = handleSecurityError(error, 'register_attempt', {
          email: this.form.email,
          username: this.form.username
        })

        const errorMessages = {
          'auth/email-already-in-use': 'Email is already registered',
          'auth/weak-password': 'Password is too weak',
          'auth/invalid-email': 'Invalid email address',
          'auth/network-request-failed': 'Network error. Please check your connection.'
        }

        this.formErrors.push(errorMessages[error.code] || securityError.message)
      }
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
        confirmPassword: '',
        age: null,
        username: '',
      }
      this.emailError = ''
      this.passwordError = ''
      this.confirmPasswordError = ''
      this.ageError = ''
      this.usernameError = ''
    }
  }
}
</script>

<style scoped>

</style>
