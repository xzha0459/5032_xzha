<template>
  <div class="container">
    <div class="row justify-content-center">
      <div class="col-12 col-8">
        <div class="register-form">
          <h2 class="text-center mb-4">Create Account</h2>

          <form @submit.prevent="submitForm">
            <!-- Form Fields -->
            <div v-for="field in formFields" :key="field.name" class="form-group mb-3">
              <label>{{ field.label }}</label>

              <!-- Special handling for password field -->
              <div v-if="field.name === 'password'" class="password-field-container">
                <input
                  v-model="form[field.name]"
                  @input="validateField(field.name)"
                  :type="field.type"
                  :placeholder="field.placeholder"
                  class="form-control"
                  :class="{ error: getFieldError(field.name), valid: getFieldValid(field.name) }"
                />
              </div>

              <!-- Select field for role -->
              <select
                v-else-if="field.type === 'select'"
                v-model="form[field.name]"
                @change="validateField(field.name)"
                class="form-control"
                :class="{ error: getFieldError(field.name), valid: getFieldValid(field.name) }"
              >
                <option value="" disabled>{{ field.placeholder }}</option>
                <option v-for="option in field.options" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>

              <!-- Input field for other types -->
              <input
                v-else
                v-model="form[field.name]"
                @input="validateField(field.name)"
                :type="field.type"
                :placeholder="field.placeholder"
                class="form-control"
                :class="{ error: getFieldError(field.name), valid: getFieldValid(field.name) }"
              />

              <span v-if="getFieldError(field.name)" class="error-msg">
                {{ getFieldError(field.name) }}
              </span>
            </div>

            <!-- Submit Button -->
            <button type="submit" :disabled="!isFormValid" class="btn-submit mb-3">
              {{ isSubmitting ? 'Creating...' : 'Create Account' }}
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
              ✅ Account created successfully!
            </div>
          </form>


        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { auth, db } from '@/firebase.js'
import {
  sanitizeInput,
  isValidEmail,
  validatePassword,
  validateConfirmPassword,
  isValidUsername,
  isValidAge,
  isValidRole,
  containsXSS,
  logSecurityEvent,
  handleSecurityError,
  createSafeUserData
} from '@/utils/security.js'

export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
        age: null,
        username: '',
        role: 'user', // Default role
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
          placeholder: 'Enter password',
          validator: (value) => {
            if (!value) return 'Password is required'

            // 检查是否包含XSS攻击
            if (containsXSS(value)) {
              logSecurityEvent('xss_attempt', 'XSS attempt detected in password field')
              return 'Password contains invalid characters'
            }

            // 验证密码强度（强制要求）
            const passwordValidation = validatePassword(value)
            if (!passwordValidation.isValid) {
              return passwordValidation.message
            }

            return ''
          }
        },
        {
          name: 'confirmPassword',
          label: 'Confirm Password *',
          type: 'password',
          placeholder: 'Confirm your password',
          validator: (value) => {
            if (!value) return 'Please confirm your password'

            // 验证确认密码
            const confirmValidation = validateConfirmPassword(this.form.password, value)
            if (!confirmValidation.isValid) {
              return confirmValidation.message
            }

            return ''
          }
        },
        {
          name: 'age',
          label: 'Age *',
          type: 'number',
          placeholder: 'Enter your age (13-24)',
          validator: (value) => {
            if (!value) return 'Age is required'

            const age = parseInt(value)
            if (isNaN(age)) return 'Age must be a valid number'

            if (!isValidAge(age)) {
              return 'Age must be between 13-24'
            }

            return ''
          }
        },
        {
          name: 'username',
          label: 'Username *',
          type: 'text',
          placeholder: 'Choose a username',
          validator: (value) => {
            if (!value) return 'Username is required'

            // 检查是否包含XSS攻击
            if (containsXSS(value)) {
              logSecurityEvent('xss_attempt', 'XSS attempt detected in username field', { username: value })
              return 'Username contains invalid characters'
            }

            // 清理输入
            const cleanedValue = sanitizeInput(value)

            // 验证用户名格式
            if (!isValidUsername(cleanedValue)) {
              if (cleanedValue.length < 3) return 'Username must be at least 3 characters'
              if (!/^[a-zA-Z0-9_]+$/.test(cleanedValue)) {
                return 'Username can only contain letters, numbers, underscore'
              }
              if (cleanedValue === 'admin') return 'Username "admin" is reserved'
              return 'Username contains invalid characters'
            }

            return ''
          }
        },
        {
          name: 'role',
          label: 'Role *',
          type: 'select',
          placeholder: 'Select your role',
          options: [
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Administrator' }
          ],
          validator: (value) => {
            if (!value) return 'Role is required'

            if (!isValidRole(value)) {
              return 'Invalid role selected'
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

    // Validate fields with default values
    this.formFields.forEach(field => {
      if (this.form[field.name]) {
        this.validateField(field.name)
      }
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
        const cleanedUsername = sanitizeInput(this.form.username)

        // 记录注册尝试
        logSecurityEvent('register_attempt', 'User attempting to register', {
          email: cleanedEmail,
          username: cleanedUsername,
          role: this.form.role
        })

        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          cleanedEmail,
          cleanedPassword
        )

        // 创建安全的用户数据
        const safeUserData = createSafeUserData({
          uid: userCredential.user.uid,
          email: cleanedEmail,
          username: cleanedUsername,
          age: parseInt(this.form.age),
          role: this.form.role || 'user'
        })

        // Store additional user info in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), safeUserData)

        this.success = true
        this.isSubmitting = false

        // 记录成功注册
        logSecurityEvent('register_success', 'User registered successfully', {
          uid: userCredential.user.uid,
          email: cleanedEmail,
          username: cleanedUsername,
          role: this.form.role
        })

        // Reset form and validation states
        this.resetForm()

        console.log('User created successfully:', userCredential.user.uid)

        // Hide success message after 3 seconds
        setTimeout(() => {
          this.success = false
        }, 3000)

      } catch (error) {
        console.error('Error creating user:', error)
        this.isSubmitting = false

        // 记录注册失败
        logSecurityEvent('register_failed', 'Registration attempt failed', {
          email: this.form.email,
          username: this.form.username,
          error: error.code
        })

        // 使用安全错误处理
        const securityError = handleSecurityError(error, 'register_attempt', {
          email: this.form.email,
          username: this.form.username
        })

        // Handle specific Firebase errors
        if (error.code === 'auth/email-already-in-use') {
          this.formErrors.push('Email is already registered')
        } else if (error.code === 'auth/weak-password') {
          this.formErrors.push('Password is too weak')
        } else if (error.code === 'auth/invalid-email') {
          this.formErrors.push('Invalid email address')
        } else if (error.code === 'auth/network-request-failed') {
          this.formErrors.push('Network error. Please check your connection.')
        } else {
          this.formErrors.push(securityError.message)
        }
      }
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
        confirmPassword: '',
        age: null,
        username: '',
        role: 'user', // Reset to default role
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
.register-form {
  background: var(--forest-light);
  border-radius: 10px;
  box-shadow: 0 4px 6px var(--shadow-light);
  padding: 2rem;
  margin: 2rem 0;
  border: 1px solid var(--border-light);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid var(--border-medium);
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
  background: var(--forest-light);
  color: var(--text-primary);
}

.form-control:focus {
  outline: none;
  border-color: var(--forest-deep);
}

.form-control select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.7rem center;
  background-size: 1em;
  padding-right: 2.5rem;
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
  padding: 0.75rem;
  background: var(--forest-dark);
  color: var(--text-light);
  border: none;
  border-radius: 5px;
  font-size: 1rem;
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
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
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


/* Password Security Styles */
.password-field-container {
  position: relative;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .password-strength-container {
    flex-direction: column;
    align-items: stretch;
    gap: 0.25rem;
  }

  .password-strength-text {
    text-align: center;
  }
}

</style>
