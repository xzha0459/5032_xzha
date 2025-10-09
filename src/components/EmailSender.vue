<template>
  <div>
    <!-- Email Button -->
    <button class="btn-email" @click="showModal = true">
      Send Email
    </button>

    <!-- Email Modal -->
    <div v-if="showModal" class="email-modal-backdrop" @click="showModal = false">
      <div class="email-modal" @click.stop>
        <div class="email-section">
          <div class="email-header">
            <h2 class="section-title">Send Email</h2>
            <button class="btn-close" @click="showModal = false">×</button>
          </div>

          <div class="email-form-container">
            <form @submit.prevent="handleSubmit">
              <div class="form-group">
                <label>Recipient Email *</label>
                <input
                  type="email"
                  v-model="form.to"
                  placeholder="Enter recipient email"
                  required
                />
              </div>

              <div class="form-group">
                <label>Email Subject *</label>
                <input
                  type="text"
                  v-model="form.subject"
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div class="form-group">
                <label>Email Content *</label>
                <textarea
                  v-model="form.message"
                  placeholder="Enter email content"
                  rows="5"
                  required
                ></textarea>
              </div>

              <div class="form-group">
                <label>Attachment (Optional)</label>
                <input
                  type="file"
                  @change="handleFileUpload"
                  ref="fileInput"
                />
                <div v-if="form.attachmentName" class="file-info">
                  Selected: {{ form.attachmentName }}
                </div>
              </div>

              <button type="submit" :disabled="isLoading" class="btn-send">
                {{ isLoading ? 'Sending...' : 'Send Email' }}
              </button>

              <div v-if="success" class="success">Email sent successfully!</div>
              <div v-if="error" class="error">{{ error }}</div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref } from 'vue'

export default {
  name: 'EmailSender',
  setup() {
    const showModal = ref(false)
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

        const response = await fetch('https://sendemail-ha3ghdr32q-km.a.run.app', {
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
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]')
        if (fileInput) {
          fileInput.value = ''
        }
        // Close modal after successful send
        setTimeout(() => {
          showModal.value = false
        }, 1500) // Close after 1.5 seconds to show success message
      }
    }

    return {
      showModal,
      form,
      isLoading,
      error,
      success,
      handleFileUpload,
      handleSubmit
    }
  }
}
</script>

<style scoped>
/* Button */
.btn-email {
  background: var(--forest-medium);
  color: var(--text-light);
  border: none;
  border-radius: 6px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.btn-email:hover {
  background: var(--forest-deep);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px var(--shadow-medium);
}

/* Modal */
.email-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  z-index: 2000;
  padding: 2rem;
}

.email-modal {
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid var(--border-light);
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideInUp 0.3s ease-out;
}

@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Header */
.email-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--border-light);
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-close:hover {
  background: var(--forest-sage);
  color: var(--text-primary);
}

/* Form */
.email-form-container {
  padding: 0 1.5rem 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-secondary);
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-light);
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  background: white;
  color: var(--text-primary);
}

input:focus, textarea:focus {
  outline: none;
  border-color: var(--forest-medium);
  box-shadow: 0 0 0 3px var(--shadow-light);
}

textarea {
  resize: vertical;
}

.file-info {
  margin-top: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

.btn-send {
  background: var(--forest-deep);
  color: var(--text-light);
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  width: 100%;
  transition: background-color 0.2s;
  font-weight: 500;
}

.btn-send:hover:not(:disabled) {
  background: var(--forest-dark);
}

.btn-send:disabled {
  background: var(--forest-muted);
  cursor: not-allowed;
}

/* Messages */
.success, .error {
  margin-top: 15px;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  font-weight: 500;
}

.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive */
@media (max-width: 768px) {
  .email-modal-backdrop {
    padding: 1rem;
  }

  .email-modal {
    max-width: 100%;
    max-height: 90vh;
  }

  .btn-email {
    padding: 0.5rem 1rem;
    font-size: 12px;
  }

  .email-header {
    padding: 1rem 1rem 0;
  }

  .email-form-container {
    padding: 0 1rem 1rem;
  }

  .section-title {
    font-size: 1.25rem;
  }
}
</style>
