import { ref } from 'vue'

export function useEmailSender() {
  const isLoading = ref(false)
  const error = ref(null)
  const success = ref(false)

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
        return true
      } else {
        throw new Error(result.error || 'Email sending failed')
      }
    } catch (err) {
      console.error('Email sending error:', err)
      error.value = err.message || 'Email sending failed, please try again later'
      return false
    } finally {
      isLoading.value = false
    }
  }

  const sendBookingConfirmationEmail = async (userEmail, activity) => {
    const subject = 'Activity Booking Confirmation'

    // 安全地处理日期
    let formattedDate = 'TBA'
    let formattedTime = 'TBA'

    if (activity.date) {
      try {
        const activityDate = new Date(activity.date)
        if (!isNaN(activityDate.getTime())) {
          formattedDate = activityDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
          formattedTime = activityDate.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })
        }
      } catch {
        // 日期格式错误时使用默认值
      }
    }

    const message = `You have successfully booked the "${activity.title || 'Activity'}" activity.

Activity Details:
- Title: ${activity.title || 'N/A'}
- Date: ${formattedDate}
- Time: ${formattedTime}
- Duration: ${activity.duration || 'N/A'} minutes
- Location: ${activity.location || 'TBA'}
- Price: ${activity.price > 0 ? '$' + activity.price : 'Free'}
- Description: ${activity.description || 'No description available'}

Thank you for participating in our community activities!`

    return await sendEmail({
      to: userEmail,
      subject: subject,
      message: message
    })
  }

  const resetState = () => {
    isLoading.value = false
    error.value = null
    success.value = false
  }

  return {
    isLoading,
    error,
    success,
    sendEmail,
    sendBookingConfirmationEmail,
    resetState
  }
}
