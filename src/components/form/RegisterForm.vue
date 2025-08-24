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
              <input
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
              <div class="user-card" v-for="(user, index) in registeredUsers" :key="index">
                <div class="user-info">
                  <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
                  <div class="user-details">
                    <h4 class="username">{{ user.username }}</h4>
                    <p class="email">{{ user.email }}</p>
                    <p class="age">Age: {{ user.age }}</p>
                  </div>
                </div>
                <button @click="removeUser(index)" class="remove-btn" title="Remove user">×</button>
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
export default {
  name: 'RegisterForm',
  data() {
    return {
      form: {
        email: '',
        password: '',
        age: null,
        username: '',
      },
      // Validation states
      fieldErrors: {},
      fieldValids: {},
      // Form states
      formErrors: [],
      isSubmitting: false,
      success: false,
      // Dynamic data
      registeredUsers: [],
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
            if (this.registeredUsers.some(user => user.email === value)) {
              return 'Email already registered'
            }
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
            if (this.registeredUsers.some(user => user.username === value)) {
              return 'Username already taken'
            }
            if (value === 'admin') return 'Username "admin" is reserved'
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
    this.loadUsersFromStorage()
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

    // Local Storage methods
    loadUsersFromStorage() {
      try {
        const storedUsers = localStorage.getItem('registeredUsers')
        if (storedUsers) {
          this.registeredUsers = JSON.parse(storedUsers)
        }
      } catch (error) {
        console.error('Error loading users from storage:', error)
        this.registeredUsers = []
      }
    },

    saveUsersToStorage() {
      try {
        localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers))
      } catch (error) {
        console.error('Error saving users to storage:', error)
      }
    },

    // User management
    removeUser(index) {
      this.registeredUsers.splice(index, 1)
      this.saveUsersToStorage()
    },

    clearAllUsers() {
      if (confirm('Are you sure you want to clear all users?')) {
        this.registeredUsers = []
        this.saveUsersToStorage()
      }
    },

    // Form submission
    submitForm() {
      this.formErrors = []
      this.isSubmitting = true

      // Validate all fields
      this.formFields.forEach(field => this.validateField(field.name))

      if (!this.isFormValid) {
        this.isSubmitting = false
        return
      }

      // Simulate API call
      setTimeout(() => {
        const newUser = {
          username: this.form.username,
          email: this.form.email,
          age: this.form.age,
          password: this.form.password,
          createdAt: new Date().toISOString()
        }
        
        this.registeredUsers.unshift(newUser)
        this.saveUsersToStorage()
        
        this.success = true
        this.isSubmitting = false
        
        // Reset form and validation states
        this.resetForm()
        
        console.log('Form submitted:', newUser)
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.success = false
        }, 3000)
      }, 1000)
    },

    resetForm() {
      this.form = {
        email: '',
        password: '',
        age: null,
        username: '',
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
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin: 2rem 0;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
}

.form-control.valid {
  border-color: #28a745;
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
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #0056b3;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
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
  margin: 0;
  font-size: 0.875rem;
  color: #888;
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
