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
              <!-- Select field for role -->
              <select
                v-if="field.type === 'select'"
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

          <!-- Users List -->
          <div class="dynamic-data-section mt-5">
            <h3 class="text-center mb-4">Registered Users</h3>

            <div v-if="registeredUsers.length > 0" class="users-list">
              <div class="user-card" v-for="user in registeredUsers" :key="user.uid">
                <div class="user-info">
                  <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
                  <div class="user-details">
                    <h4 class="username">{{ user.username }}</h4>
                    <p class="email">{{ user.email }}</p>
                    <p class="age">Age: {{ user.age }}</p>
                    <p class="role">Role: {{ user.role || 'user' }}</p>
                  </div>
                </div>
                <button @click="removeUser(user.uid)" class="remove-btn" title="Remove user">×</button>
              </div>
            </div>

            <div v-else class="empty-state">
              <p class="text-center text-muted">No users registered yet. Be the first one!</p>
            </div>

            <div v-if="registeredUsers.length > 0" class="text-center mt-4">
              <button @click="clearAllUsers" class="btn-clear-all">Clear All Users</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { collection, onSnapshot, deleteDoc, doc, query, orderBy, setDoc } from 'firebase/firestore'
import { auth, db } from '@/firebase.js'

export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
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
      // Firebase related states
      registeredUsers: [],
      unsubscribe: null,
      // Form field configuration
      formFields: [
        {
          name: 'email',
          label: 'Email *',
          type: 'email',
          placeholder: 'Enter your email',
          validator: (value) => {
            if (!value) return 'Email is required'
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) return 'Invalid email format'
            return ''
          }
        },
        {
          name: 'password',
          label: 'Password *',
          type: 'password',
          placeholder: 'Enter password (min 6 characters)',
          validator: (value) => {
            if (!value) return 'Password is required'
            if (value.length < 6) return 'Password must be at least 6 characters'
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
            if (value < 13 || value > 24) return 'Age must be between 13-24'
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
            if (value.length < 3) return 'Username must be at least 3 characters'
            if (!/^[a-zA-Z0-9_]+$/.test(value)) {
              return 'Username can only contain letters, numbers, underscore'
            }
            if (value === 'admin') return 'Username "admin" is reserved'
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
            if (!['user', 'admin'].includes(value)) return 'Invalid role selected'
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

    // Load users from Firestore
    this.loadUsersFromFirestore()
  },

  beforeUnmount() {
    // Clean up Firestore listener
    if (this.unsubscribe) {
      this.unsubscribe()
    }
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

    // Firestore methods
    loadUsersFromFirestore() {
      const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'))
      this.unsubscribe = onSnapshot(q, (snapshot) => {
        this.registeredUsers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }, (error) => {
        console.error('Error loading users from Firestore:', error)
        this.formErrors.push('Failed to load users list')
      })
    },

    // User management
    async removeUser(userUid) {
      try {
        await deleteDoc(doc(db, 'users', userUid))
      } catch (error) {
        console.error('Error removing user:', error)
        this.formErrors.push('Failed to remove user')
      }
    },

    async clearAllUsers() {
      if (confirm('Are you sure you want to clear all users?')) {
        try {
          const deletePromises = this.registeredUsers.map(user =>
            deleteDoc(doc(db, 'users', user.uid))  // 使用 uid 而不是 id
          )
          await Promise.all(deletePromises)
        } catch (error) {
          console.error('Error clearing all users:', error)
          this.formErrors.push('Failed to clear all users')
        }
      }
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
        // Create user with Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.form.email,
          this.form.password
        )

        // Store additional user info in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: this.form.email,
          username: this.form.username,
          age: this.form.age,
          role: this.form.role || 'user', // Default role assignment
          createdAt: new Date().toISOString()
        })

        this.success = true
        this.isSubmitting = false

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
          this.formErrors.push('Failed to create account. Please try again.')
        }
      }
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
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

/* Dynamic Data Section Styles */
.dynamic-data-section {
  border-top: 2px solid #eee;
  padding-top: 2rem;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.user-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  transition: all 0.3s ease;
}

.user-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--forest-dark);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.username {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--forest-dark);
}

.email {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  color: #666;
}

.age {
  margin: 0 0 0.25rem 0;
  font-size: 0.875rem;
  color: #888;
}

.role {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  font-weight: 600;
  text-transform: capitalize;
}

.remove-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.remove-btn:hover {
  background: #c82333;
  transform: scale(1.1);
}

.empty-state {
  padding: 2rem;
  text-align: center;
}

.text-muted {
  color: #6c757d;
}

.btn-clear-all {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-clear-all:hover {
  background: #5a6268;
}

/* Responsive adjustments */
@media (max-width: 767px) {
  .user-card {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .user-info {
    flex-direction: column;
    text-align: center;
  }

  .remove-btn {
    align-self: center;
  }
}

</style>
