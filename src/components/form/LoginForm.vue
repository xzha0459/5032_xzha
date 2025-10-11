<template>
  <div class="auth-form">
    <h2 class="form-title">Sign In</h2>

    <form @submit.prevent="submitForm">
      <!-- Email Field -->
      <div class="form-group">
        <label for="email">Email *</label>
        <input
          id="email"
          v-model="form.email"
          @input="validateEmail"
          type="email"
          placeholder="Enter your email address"
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
          placeholder="Enter your password"
          class="input"
          :class="{ error: passwordError, valid: form.password && !passwordError }"
        />
        <span v-if="passwordError" class="error-msg">{{ passwordError }}</span>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="!isFormValid || isSubmitting" class="btn submit">
        {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
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
        ✅ Successfully signed in!
      </div>
    </form>

    <!-- Register Link -->
    <p class="form-text">
      Don't have an account?
      <router-link to="/register" class="register-link">Create one here</router-link>
    </p>
  </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/firebase.js'
import {
  sanitizeInput,
  isValidEmail,
  containsXSS,
  logSecurityEvent
} from '@/utils/security.js'

export default {
  name: 'LoginForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
      },
      emailError: '',
      passwordError: '',
      formErrors: [],
      isSubmitting: false,
      success: false,
    }
  },
  computed: {
    isFormValid() {
      return this.form.email && this.form.password && !this.emailError && !this.passwordError
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

      this.passwordError = ''
    },

    async submitForm() {
      this.formErrors = []
      this.validateEmail()
      this.validatePassword()

      if (!this.isFormValid) {
        return
      }

      this.isSubmitting = true

      try {
        const cleanedEmail = sanitizeInput(this.form.email)
        const cleanedPassword = sanitizeInput(this.form.password)

        logSecurityEvent('login_attempt', 'User attempting to login', { email: cleanedEmail })

        const userCredential = await signInWithEmailAndPassword(
          auth,
          cleanedEmail,
          cleanedPassword
        )

        this.success = true
        this.isSubmitting = false

        logSecurityEvent('login_success', 'User logged in successfully', {
          uid: userCredential.user.uid,
          email: cleanedEmail
        })

        console.log('User signed in successfully:', userCredential.user.uid)

        this.resetForm()

        setTimeout(() => {
          this.success = false
          this.$router.push('/')
        }, 2000)

      } catch (error) {
        console.error('Error signing in:', error)
        this.isSubmitting = false

        logSecurityEvent('login_failed', 'Login attempt failed', {
          email: this.form.email,
          error: error.code
        })

        // Handle specific Firebase errors
        const errorMessages = {
          'auth/user-not-found': 'No account found with this email address.',
          'auth/wrong-password': 'Incorrect password',
          'auth/invalid-email': 'Invalid email address',
          'auth/user-disabled': 'This account has been disabled',
          'auth/too-many-requests': 'Too many failed attempts. Please try again later',
          'auth/network-request-failed': 'Network error. Please check your connection.'
        }

        this.formErrors.push(errorMessages[error.code] || 'Login failed. Please try again.')
      }
    },

    resetForm() {
      this.form = { email: '', password: '' }
      this.emailError = ''
      this.passwordError = ''
    }
  }
}
</script>

<style scoped>
.register-link {
  color: var(--forest-dark);
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: var(--forest-deep);
  text-decoration: underline;
}
</style>
