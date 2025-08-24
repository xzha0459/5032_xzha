<template>
  <div class="register-form">
    <h2>Create Account</h2>

    <form @submit.prevent="submitForm">
      <!-- Email Validation (Real-time Type 1) -->
      <div class="form-group">
        <label>Email *</label>
        <input
          v-model="form.email"
          @input="validateEmail"
          type="email"
          class="form-control"
          :class="{ error: emailError, valid: emailValid }"
          placeholder="Enter your email"
        />
        <span v-if="emailError" class="error-msg">{{ emailError }}</span>
      </div>

      <!-- Password Validation (Real-time Type 1) -->
      <div class="form-group">
        <label>Password *</label>
        <input
          v-model="form.password"
          @input="validatePassword"
          type="password"
          class="form-control"
          :class="{ error: passwordError, valid: passwordValid }"
          placeholder="Enter password (min 6 characters)"
        />
        <span v-if="passwordError" class="error-msg">{{ passwordError }}</span>
      </div>

      <!-- Age Validation (Numeric Type 2) -->
      <div class="form-group">
        <label>Age *</label>
        <input
          v-model.number="form.age"
          @input="validateAge"
          type="number"
          class="form-control"
          :class="{ error: ageError, valid: ageValid }"
          placeholder="Enter your age (13-24)"
        />
        <span v-if="ageError" class="error-msg">{{ ageError }}</span>
      </div>

      <!-- Username Validation (Custom Type 2) -->
      <div class="form-group">
        <label>Username *</label>
        <input
          v-model="form.username"
          @input="validateUsername"
          type="text"
          class="form-control"
          :class="{ error: usernameError, valid: usernameValid }"
          placeholder="Choose a username"
        />
        <span v-if="usernameError" class="error-msg">{{ usernameError }}</span>
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="!isFormValid" class="btn-submit">
        {{ isSubmitting ? 'Creating...' : 'Create Account' }}
      </button>

      <!-- Form-level errors (Submission Validation) -->
      <div v-if="formErrors.length" class="form-errors">
        <h4>Please fix:</h4>
        <ul>
          <li v-for="error in formErrors" :key="error">{{ error }}</li>
        </ul>
      </div>

      <!-- Success message -->
      <div v-if="success" class="success-msg">✅ Account created successfully!</div>
    </form>
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
      emailError: '',
      emailValid: false,
      passwordError: '',
      passwordValid: false,
      ageError: '',
      ageValid: false,
      usernameError: '',
      usernameValid: false,
      // Form states
      formErrors: [],
      isSubmitting: false,
      success: false,
    }
  },
  computed: {
    isFormValid() {
      return this.emailValid && this.passwordValid && this.ageValid && this.usernameValid
    },
  },
  methods: {
    // TYPE 1: REAL-TIME VALIDATION
    validateEmail() {
      const email = this.form.email
      if (!email) {
        this.emailError = 'Email is required'
        this.emailValid = false
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        this.emailError = 'Invalid email format'
        this.emailValid = false
        return
      }

      this.emailError = ''
      this.emailValid = true
    },

    validatePassword() {
      const password = this.form.password
      if (!password) {
        this.passwordError = 'Password is required'
        this.passwordValid = false
        return
      }

      if (password.length < 6) {
        this.passwordError = 'Password must be at least 6 characters'
        this.passwordValid = false
        return
      }

      this.passwordError = ''
      this.passwordValid = true
    },

    // TYPE 2: NUMERIC & CUSTOM VALIDATION
    validateAge() {
      const age = this.form.age
      if (!age) {
        this.ageError = 'Age is required'
        this.ageValid = false
        return
      }

      if (age < 13 || age > 24) {
        this.ageError = 'Age must be between 13-24'
        this.ageValid = false
        return
      }

      this.ageError = ''
      this.ageValid = true
    },

    validateUsername() {
      const username = this.form.username
      if (!username) {
        this.usernameError = 'Username is required'
        this.usernameValid = false
        return
      }

      if (username.length < 3) {
        this.usernameError = 'Username must be at least 3 characters'
        this.usernameValid = false
        return
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        this.usernameError = 'Username can only contain letters, numbers, underscore'
        this.usernameValid = false
        return
      }

      this.usernameError = ''
      this.usernameValid = true
    },

    // FORM SUBMISSION VALIDATION
    submitForm() {
      this.formErrors = []
      this.isSubmitting = true

      // Run all validations again
      this.validateEmail()
      this.validatePassword()
      this.validateAge()
      this.validateUsername()

      // Additional submission checks
      if (!this.form.email) this.formErrors.push('Email is required')
      if (!this.form.password) this.formErrors.push('Password is required')
      if (!this.form.age) this.formErrors.push('Age is required')
      if (!this.form.username) this.formErrors.push('Username is required')

      // Business rule validation
      if (this.form.username === 'admin') {
        this.formErrors.push('Username "admin" is reserved')
      }

      if (this.formErrors.length || !this.isFormValid) {
        this.isSubmitting = false
        return
      }

      // Simulate API call
      setTimeout(() => {
        this.success = true
        this.isSubmitting = false
        console.log('Form submitted:', this.form)
      }, 1000)
    },
  },
}
</script>

<style scoped>
.register-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 1.5rem;
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

.form-errors {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 5px;
  color: #721c24;
}

.form-errors h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
}

.form-errors ul {
  margin: 0;
  padding-left: 1.2rem;
}

.success-msg {
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 5px;
  color: #155724;
  text-align: center;
}
</style>
