<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-12 col-md-6 col-lg-4">
        <div class="login-form">
          <h2 class="text-center mb-4">Sign In</h2>

          <form @submit.prevent="submitForm">
            <!-- Email Field -->
            <div class="form-group mb-3">
              <label for="email">Email *</label>
              <input
                id="email"
                v-model="form.email"
                @input="validateField('email')"
                type="email"
                placeholder="Enter your email address"
                class="form-control"
                :class="{ error: getFieldError('email'), valid: getFieldValid('email') }"
              />
              <span v-if="getFieldError('email')" class="error-msg">
                {{ getFieldError('email') }}
              </span>
            </div>

            <!-- Password Field -->
            <div class="form-group mb-3">
              <label for="password">Password *</label>
              <input
                id="password"
                v-model="form.password"
                @input="validateField('password')"
                type="password"
                placeholder="Enter your password"
                class="form-control"
                :class="{ error: getFieldError('password'), valid: getFieldValid('password') }"
              />
              <span v-if="getFieldError('password')" class="error-msg">
                {{ getFieldError('password') }}
              </span>
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="!isFormValid || isSubmitting" class="btn-submit mb-3">
              {{ isSubmitting ? 'Signing in...' : 'Sign In' }}
            </button>

            <!-- Form Errors -->
            <div v-if="formErrors.length" class="alert alert-danger">
              <h6 class="alert-heading">Please fix:</h6>
              <ul class="mb-0">
                <li v-for="error in formErrors" :key="error">{{ error }}</li>
              </ul>
            </div>

            <!-- Success Message -->
            <div v-if="success" class="alert alert-success text-center">
              ✅ Successfully signed in!
            </div>
          </form>

          <!-- Register Link -->
          <div class="text-center mt-4">
            <p class="mb-0">
              Don't have an account?
              <router-link to="/register" class="register-link">Create one here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
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
      // Validation states
      fieldErrors: {},
      fieldValids: {},
      // Form states
      formErrors: [],
      isSubmitting: false,
      success: false,
      // Form field configuration
      formFields: [
        {
          name: 'email',
          label: 'Email *',
          type: 'email',
          placeholder: 'Enter your email',
          validator: (value) => {
            if (!value) return 'Email is required'

            // 检查是否包含XSS攻击
            if (containsXSS(value)) {
              logSecurityEvent('xss_attempt', 'XSS attempt detected in email field', { email: value })
              return 'Invalid email format'
            }

            // 清理输入
            const cleanedValue = sanitizeInput(value)

            // 验证邮箱格式
            if (!isValidEmail(cleanedValue)) {
              return 'Invalid email format'
            }

            return ''
          }
        },
        {
          name: 'password',
          label: 'Password *',
          type: 'password',
          placeholder: 'Enter your password',
          validator: (value) => {
            if (!value) return 'Password is required'

            // 检查是否包含XSS攻击
            if (containsXSS(value)) {
              logSecurityEvent('xss_attempt', 'XSS attempt detected in password field')
              return 'Password contains invalid characters'
            }

            return ''
          }
        }
      ]
    }
  },
  computed: {
    isFormValid() {
      return this.formFields.every(field => this.fieldValids[field.name])
    }
  },
  mounted() {
    // Initialize validation states
    this.formFields.forEach(field => {
      this.fieldErrors[field.name] = ''
      this.fieldValids[field.name] = false
    })
  },
  methods: {
    // Validation helpers
    validateField(fieldName) {
      const field = this.formFields.find(f => f.name === fieldName)
      if (!field) return

      const value = this.form[fieldName]
      const error = field.validator(value)

      this.fieldErrors[fieldName] = error
      this.fieldValids[fieldName] = !error
    },

    getFieldError(fieldName) {
      return this.fieldErrors[fieldName] || ''
    },

    getFieldValid(fieldName) {
      return this.fieldValids[fieldName] || false
    },

    // Form submission
    async submitForm() {
      this.formErrors = []
      this.isSubmitting = true

      // Validate all fields
      this.formFields.forEach(field => this.validateField(field.name))

      if (!this.isFormValid) {
        this.isSubmitting = false
        return
      }

      try {
        // 清理输入数据
        const cleanedEmail = sanitizeInput(this.form.email)
        const cleanedPassword = sanitizeInput(this.form.password)

        // 记录登录尝试
        logSecurityEvent('login_attempt', 'User attempting to login', { email: cleanedEmail })

        // Sign in with Firebase Authentication
        const userCredential = await signInWithEmailAndPassword(
          auth,
          cleanedEmail,
          cleanedPassword
        )

        this.success = true
        this.isSubmitting = false

        // 记录成功登录
        logSecurityEvent('login_success', 'User logged in successfully', {
          uid: userCredential.user.uid,
          email: cleanedEmail
        })

        console.log('User signed in successfully:', userCredential.user.uid)

        // Reset form
        this.resetForm()

        // Hide success message and redirect after 2 seconds
        setTimeout(() => {
          this.success = false
          // Redirect to home page or dashboard
          this.$router.push('/')
        }, 2000)

      } catch (error) {
        console.error('Error signing in:', error)
        this.isSubmitting = false

        // 记录登录失败
        logSecurityEvent('login_failed', 'Login attempt failed', {
          email: this.form.email,
          error: error.code
        })

        // Handle specific Firebase errors
        if (error.code === 'auth/user-not-found') {
          this.formErrors.push('No account found with this email address.')
        } else if (error.code === 'auth/wrong-password') {
          this.formErrors.push('Incorrect password')
        } else if (error.code === 'auth/invalid-email') {
          this.formErrors.push('Invalid email address')
        } else if (error.code === 'auth/user-disabled') {
          this.formErrors.push('This account has been disabled')
        } else if (error.code === 'auth/too-many-requests') {
          this.formErrors.push('Too many failed attempts. Please try again later')
        } else if (error.code === 'auth/network-request-failed') {
          this.formErrors.push('Network error. Please check your connection.')
        } else {
          this.formErrors.push('Login failed. Please try again.')
        }
      }
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
      }

      this.formFields.forEach(field => {
        this.fieldErrors[field.name] = ''
        this.fieldValids[field.name] = false
      })
    }
  }
}
</script>

<style scoped>
.login-form {
  background: var(--forest-light);
  border-radius: 8px;
  box-shadow: 0 4px 6px var(--shadow-light);
  padding: 1.5rem;
  margin: 1.5rem 0;
  border: 1px solid var(--border-light);
}

.form-group {
  margin-bottom: 0.75rem;
}

label {
  display: block;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.6rem;
  border: 2px solid var(--border-medium);
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.3s;
  background: var(--forest-light);
  color: var(--text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--forest-deep);
}

.form-control.valid {
  border-color: var(--forest-deep);
}

.form-control.error {
  border-color: #dc3545;
}

.error-msg {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}


.btn-submit {
  width: 100%;
  padding: 0.6rem;
  background: var(--forest-dark);
  color: var(--text-light);
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.btn-submit:hover:not(:disabled) {
  background: var(--forest-deep);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-dark);
}

.btn-submit:disabled {
  background: var(--forest-muted);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Alert styles */
.alert {
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 0.75rem;
}

.alert-danger {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert-success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.alert-heading {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.alert ul {
  margin: 0;
  padding-left: 1.2rem;
}

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

/* Responsive adjustments */
@media (max-width: 767px) {
  .login-form {
    padding: 1.5rem;
    margin: 1rem 0;
  }
}
</style>
