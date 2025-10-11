<template>
  <div>
    <!-- Email Button -->
    <button class="btn primary" @click="showModal = true">
      Send Email
    </button>

    <!-- Email Modal -->
    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Send Email</h2>
          <button class="close-button" @click="showModal = false">×</button>
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
.file-info {
  margin-top: 5px;
  font-size: 12px;
  color: var(--text-secondary);
}

</style>
