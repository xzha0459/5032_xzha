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

        <div class="modal-body">
          <form @submit.prevent="handleSubmit">
              <div class="modal-group">
                <label class="modal-description">Recipient Email *</label>
                <input
                  type="email"
                  v-model="form.to"
                  placeholder="Enter recipient email"
                  required
                  class="input"
                />
              </div>

              <div class="modal-group">
                <label class="modal-description">Email Subject *</label>
                <input
                  type="text"
                  v-model="form.subject"
                  placeholder="Enter email subject"
                  required
                  class="input"
                />
              </div>

              <div class="modal-group">
                <label class="modal-description">Email Content *</label>
                <textarea
                  v-model="form.message"
                  placeholder="Enter email content"
                  rows="5"
                  required
                  class="input"
                ></textarea>
              </div>

              <div class="modal-group">
                <label class="modal-description">Attachment (Optional)</label>
                <input
                  type="file"
                  @change="handleFileUpload"
                  ref="fileInput"
                  class="input"
                />
                <div v-if="form.attachmentName" class="file-info">
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
import { reactive, ref, nextTick } from 'vue'

export default {
  name: 'EmailSender',
  setup() {
    const showModal = ref(false)
    const emailModal = ref(null)
    const emailCloseBtn = ref(null)
    const emailOpenBtn = ref(null)
    let lastFocusedBeforeEmailModal = null
    const openEmailModal = () => {
      lastFocusedBeforeEmailModal = document.activeElement
      showModal.value = true
      nextTick(() => {
        if (emailCloseBtn.value && emailCloseBtn.value.focus) emailCloseBtn.value.focus()
      })
    }

    const closeEmailModal = () => {
      showModal.value = false
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
      }
    }

    return {
      showModal,
      emailModal,
      emailCloseBtn,
      emailOpenBtn,
      form,
      isLoading,
      error,
      success,
      openEmailModal,
      closeEmailModal,
      handleEmailModalKeydown,
      handleFileUpload,
      handleSubmit
    }
  }
}
</script>

<style scoped>
.file-info {
  margin-top: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

</style>
