<template>
  <div>
    <!-- Email Button -->
    <button class="btn primary" @click="openEmailModal" ref="emailOpenBtn">
      Send Email
    </button>

    <!-- Email Modal -->
    <div v-if="showModal" class="modal-overlay" role="presentation" @click="closeEmailModal">
      <div class="modal" @click.stop ref="emailModal"
           role="dialog" aria-modal="true" aria-labelledby="email-modal-title"
           @keydown="handleEmailModalKeydown">
        <div class="modal-header">
          <h2 class="modal-title" id="email-modal-title">Send Email</h2>
          <button class="close-button" ref="emailCloseBtn" @click="closeEmailModal" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body" @click="closeUserDropdown">
          <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label class="form-label">Recipient *</label>
                <div class="user-selector" @click.stop>
                  <input
                    type="text"
                    v-model="userSearchQuery"
                    @focus="showUserDropdown = true"
                    @input="filterUsers"
                    placeholder="Search users..."
                    class="input"
                    ref="userSearchInput"
                  />
                  <div v-if="showUserDropdown && filteredUsers.length > 0" class="email-user-dropdown">
                    <div
                      v-for="user in filteredUsers"
                      :key="user.id"
                      @click="selectUser(user)"
                      class="user-option"
                    >
                      <div class="user-info">
                        <div class="user-name">{{ user.displayName || user.email }}</div>
                        <div class="small" style="color: var(--text-secondary);">{{ user.email }}</div>
                      </div>
                    </div>
                  </div>
                  <div v-if="selectedUser" class="selected-user">
                    <span class="selected-user-info">
                      {{ selectedUser.displayName || selectedUser.email }}
                    </span>
                    <button type="button" @click="clearSelectedUser" class="clear-user-btn">×</button>
                  </div>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Email Subject *</label>
                <input
                  type="text"
                  v-model="form.subject"
                  placeholder="Enter email subject"
                  required
                  class="input"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Email Content *</label>
                <textarea
                  v-model="form.message"
                  placeholder="Enter email content"
                  rows="5"
                  required
                  class="input"
                ></textarea>
              </div>

              <div class="form-group">
                <label class="form-label">Attachment (Optional)</label>
                <input
                  type="file"
                  @change="handleFileUpload"
                  ref="fileInput"
                  class="input"
                />
                <div v-if="form.attachmentName" class="small">
                  Selected: {{ form.attachmentName }}
                </div>
              </div>

              <button type="submit" :disabled="isLoading" class="btn submit">
                {{ isLoading ? 'Sending...' : 'Send Email' }}
              </button>

            <div v-if="success" class="alert alert-success">Email sent successfully!</div>
            <div v-if="error" class="alert alert-error">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, nextTick, onMounted } from 'vue'
import { getDocs, collection } from 'firebase/firestore'
import { db } from '@/firebase.js'

export default {
  name: 'EmailSender',
  setup() {
    const showModal = ref(false)
    const emailModal = ref(null)
    const emailCloseBtn = ref(null)
    const emailOpenBtn = ref(null)
    const userSearchInput = ref(null)
    let lastFocusedBeforeEmailModal = null

    // User selection related
    const users = ref([])
    const filteredUsers = ref([])
    const selectedUser = ref(null)
    const userSearchQuery = ref('')
    const showUserDropdown = ref(false)

    const openEmailModal = () => {
      lastFocusedBeforeEmailModal = document.activeElement
      showModal.value = true
      nextTick(() => {
        if (emailCloseBtn.value && emailCloseBtn.value.focus) emailCloseBtn.value.focus()
      })
    }

    const closeEmailModal = () => {
      showModal.value = false
      showUserDropdown.value = false
      userSearchQuery.value = ''
      selectedUser.value = null
      if (lastFocusedBeforeEmailModal && lastFocusedBeforeEmailModal.focus) {
        lastFocusedBeforeEmailModal.focus()
      } else if (emailOpenBtn.value && emailOpenBtn.value.focus) {
        emailOpenBtn.value.focus()
      }
    }

    const handleEmailModalKeydown = (e) => {
      if (e.key === 'Escape') {
        closeEmailModal()
        return
      }
      if (e.key !== 'Tab') return
      const modal = emailModal.value
      if (!modal) return
      const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    const isLoading = ref(false)
    const error = ref(null)
    const success = ref(false)

    const form = reactive({
      to: '',
      subject: '',
      message: '',
      attachmentBase64: null,
      attachmentName: null
    })

    // Load users from Firestore
    const loadUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'))
        const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        // Filter out admin users
        users.value = docs.filter(user => user.role !== 'admin')
        filteredUsers.value = users.value
      } catch (error) {
        console.error('Failed to load users:', error)
        users.value = []
        filteredUsers.value = []
      }
    }

    // Filter users based on search query
    const filterUsers = () => {
      if (!userSearchQuery.value.trim()) {
        filteredUsers.value = users.value
      } else {
        const query = userSearchQuery.value.toLowerCase()
        filteredUsers.value = users.value.filter(user =>
          user.email.toLowerCase().includes(query) ||
          (user.displayName && user.displayName.toLowerCase().includes(query))
        )
      }
    }

    // Select a user
    const selectUser = (user) => {
      selectedUser.value = user
      form.to = user.email
      userSearchQuery.value = ''
      showUserDropdown.value = false
    }

    // Clear selected user
    const clearSelectedUser = () => {
      selectedUser.value = null
      form.to = ''
      userSearchQuery.value = ''
      showUserDropdown.value = false
      nextTick(() => {
        if (userSearchInput.value) {
          userSearchInput.value.focus()
        }
      })
    }

    // Close user dropdown when clicking outside
    const closeUserDropdown = () => {
      showUserDropdown.value = false
    }

    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          form.attachmentBase64 = e.target.result.split(',')[1]
          form.attachmentName = file.name
        }
        reader.readAsDataURL(file)
      } else {
        form.attachmentBase64 = null
        form.attachmentName = null
      }
    }

    const sendEmail = async (emailData) => {
      isLoading.value = true
      error.value = null
      success.value = false

      try {
        if (!emailData.to || !emailData.subject || !emailData.message) {
          throw new Error('Recipient, subject and content are required')
        }

        const response = await fetch('https://emailsender-ha3ghdr32q-uc.a.run.app', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailData)
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Email sending failed')
        }

        if (result.success) {
          success.value = true
          console.log('Email sent successfully:', result.message)
        } else {
          throw new Error(result.error || 'Email sending failed')
        }
      } catch (err) {
        console.error('Email sending error:', err)
        error.value = err.message || 'Email sending failed, please try again later'
      } finally {
        isLoading.value = false
      }
    }

    const handleSubmit = async () => {
      if (!selectedUser.value) {
        error.value = 'Please select a recipient'
        return
      }

      const emailData = {
        to: form.to,
        subject: form.subject,
        message: form.message,
        attachmentBase64: form.attachmentBase64,
        attachmentName: form.attachmentName
      }

      await sendEmail(emailData)

      if (success.value) {
        // Reset form
        form.to = ''
        form.subject = ''
        form.message = ''
        form.attachmentBase64 = null
        form.attachmentName = null
        selectedUser.value = null
        userSearchQuery.value = ''
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) {
          fileInput.value = ''
        }
      }
    }

    // Load users when component mounts
    onMounted(() => {
      loadUsers()
    })

    return {
      showModal,
      emailModal,
      emailCloseBtn,
      emailOpenBtn,
      userSearchInput,
      form,
      isLoading,
      error,
      success,
      users,
      filteredUsers,
      selectedUser,
      userSearchQuery,
      showUserDropdown,
      openEmailModal,
      closeEmailModal,
      handleEmailModalKeydown,
      handleFileUpload,
      handleSubmit,
      loadUsers,
      filterUsers,
      selectUser,
      clearSelectedUser,
      closeUserDropdown
    }
  }
}
</script>

<style>
.user-selector {
  position: relative;
}

.email-user-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid var(--border-light);
  border-top: none;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 2px 8px var(--shadow-medium);
}

.user-option {
  padding: 12px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background-color var(--transition);
}

.user-option:hover {
  background-color: var(--forest-light);
}

.user-option:last-child {
  border-bottom: none;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--forest-dark);
  margin-bottom: 2px;
}

.selected-user {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #e8f5e8;
  border: 1px solid #c3e6c3;
  border-radius: var(--border-radius);
  margin-top: 8px;
}

.selected-user-info {
  font-weight: 500;
  color: var(--forest-dark);
}

.clear-user-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color var(--transition);
}

.clear-user-btn:hover {
  background-color: var(--forest-light);
  color: var(--text-primary);
}
</style>
