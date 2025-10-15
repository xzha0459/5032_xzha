<template>
  <div class="chatbot-container">
    <!-- 聊天按钮 -->
    <div v-if="!isOpen" class="chat-toggle" @click="toggleChatbot">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>

    <!-- 聊天窗口 -->
    <div v-if="isOpen" class="chat-window">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="chat-title">
          <div class="bot-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="title-text">
            <h3>Mental Health Assistant</h3>
          </div>
        </div>
        <button class="close-btn" @click="toggleChatbot">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- 聊天消息区域 -->
      <div class="chat-messages" ref="messagesContainer">
        <div class="message bot-message">
          <div class="message-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="message-content">
            <p>Hello! I'm your mental health support assistant. I'm here to listen to your thoughts, provide emotional support, and help you find appropriate resources. Please feel free to share your feelings with me anytime.</p>
            <span class="message-time">{{ getCurrentTime() }}</span>
          </div>
        </div>

        <div v-for="message in messages" :key="message.id" class="message" :class="message.role + '-message'">
          <div class="message-avatar" v-if="message.role === 'assistant'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="message-avatar" v-if="message.role === 'user'">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
          </div>
          <div class="message-content">
            <p v-if="message.role === 'error'" class="error-text">{{ message.content }}</p>
            <p v-else>{{ message.content }}</p>
            <span class="message-time">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>

        <!-- 打字指示器 -->
        <div v-if="isTyping" class="message bot-message typing">
          <div class="message-avatar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div class="message-content">
            <div class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="chat-input">
        <div class="input-container">
          <input
            v-model="inputMessage"
            @keypress.enter="sendMessage"
            placeholder="Type your message..."
            class="message-input"
            :disabled="isTyping"
            ref="messageInput"
          />
          <button @click="sendMessage" class="send-btn" :disabled="!inputMessage.trim() || isTyping">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
        <div class="retry-container" v-if="showRetry">
          <button @click="retryLastMessage" class="retry-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 4v6h6M23 20v-6h-6"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
            </svg>
            Retry
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, nextTick, onMounted } from 'vue'

export default {
  name: 'MentalHealthChatbot',
  setup() {
    const isOpen = ref(false)
    const messages = ref([])
    const inputMessage = ref('')
    const isTyping = ref(false)
    const messagesContainer = ref(null)
    const messageInput = ref(null)
    const showRetry = ref(false)
    const lastFailedMessage = ref('')

    const toggleChatbot = () => {
      isOpen.value = !isOpen.value
      if (isOpen.value) {
        nextTick(() => {
          scrollToBottom()
          messageInput.value?.focus()
        })
      }
    }

    const sendMessage = async () => {
      if (!inputMessage.value.trim() || isTyping.value) return

      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputMessage.value.trim(),
        timestamp: new Date()
      }

      messages.value.push(userMessage)
      const messageToSend = inputMessage.value.trim()
      inputMessage.value = ''
      showRetry.value = false
      isTyping.value = true

      nextTick(() => {
        scrollToBottom()
      })

      try {
        // 获取Firebase Function URL
        const functionUrl = 'https://chatbot-ha3ghdr32q-uc.a.run.app'

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: messageToSend,
            conversationHistory: messages.value.slice(0, -1).map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          })
        })

        const data = await response.json()

        if (data.success) {
          const assistantMessage = {
            id: Date.now() + 1,
            role: 'assistant',
            content: data.reply,
            timestamp: new Date(data.timestamp)
          }
          messages.value.push(assistantMessage)
        } else {
          throw new Error(data.error || 'Failed to get response')
        }
      } catch (error) {
        console.error('Chatbot error:', error)
        lastFailedMessage.value = messageToSend
        showRetry.value = true

        const errorMessage = {
          id: Date.now() + 1,
          role: 'error',
          content: 'Sorry, I cannot respond to your message right now. Please try again later or contact our support team.',
          timestamp: new Date()
        }
        messages.value.push(errorMessage)
      } finally {
        isTyping.value = false
        nextTick(() => {
          scrollToBottom()
        })
      }
    }

    // 重试上次失败的消息
    const retryLastMessage = () => {
      if (lastFailedMessage.value) {
        inputMessage.value = lastFailedMessage.value
        sendMessage()
      }
    }

    const scrollToBottom = () => {
      if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
      }
    }

    const formatTime = (timestamp) => {
      return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const getCurrentTime = () => {
      const now = new Date()
      return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    onMounted(() => {
      // 初始化逻辑
    })

    return {
      isOpen,
      messages,
      inputMessage,
      isTyping,
      messagesContainer,
      messageInput,
      showRetry,
      lastFailedMessage,
      toggleChatbot,
      sendMessage,
      retryLastMessage,
      formatTime,
      getCurrentTime,
      scrollToBottom
    }
  }
}
</script>

<style scoped>
/* 容器和布局 */
.chatbot-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 10000;
}

.chat-toggle {
  width: 60px;
  height: 60px;
  background: var(--forest-dark);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 20px var(--shadow-medium);
  transition: all 0.3s ease;
  color: white;
}

.chat-toggle:hover {
  transform: scale(1.1);
  background: var(--forest-deep);
}

.chat-window {
  width: 350px;
  height: 450px;
  background: white;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 头部 */
.chat-header {
  background: var(--forest-dark);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.bot-avatar {
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 消息区域 */
.chat-messages {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 85%;
}

.bot-message,
.assistant-message {
  align-self: flex-start;
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.message-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.bot-message .message-avatar,
.assistant-message .message-avatar {
  background: var(--forest-sage);
  color: var(--forest-dark);
}

.user-message .message-avatar {
  background: var(--forest-dark);
  color: white;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 12px;
}

.bot-message .message-content,
.assistant-message .message-content {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.user-message .message-content {
  background: var(--forest-dark);
  color: white;
}

.message-content p {
  margin: 0 0 0.25rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

.error-text {
  color: #e53e3e !important;
  font-weight: 500;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background: var(--forest-medium);
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-10px); opacity: 1; }
}

/* 输入区域 */
.chat-input {
  padding: 1rem;
  border-top: 1px solid var(--border-light);
  background: white;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.message-input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-light);
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.message-input:focus {
  border-color: var(--forest-deep);
}

.message-input:disabled {
  background: var(--bg-secondary);
  cursor: not-allowed;
}

.send-btn {
  width: 40px;
  height: 40px;
  background: var(--forest-dark);
  border: none;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.send-btn:hover:not(:disabled) {
  background: var(--forest-deep);
  transform: scale(1.05);
}

.send-btn:disabled {
  background: var(--forest-muted);
  cursor: not-allowed;
}

.retry-container {
  display: flex;
  justify-content: center;
  margin-top: 0.5rem;
}

.retry-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--forest-medium);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: var(--forest-deep);
  transform: translateY(-1px);
}

/* 滚动条 */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: var(--forest-medium);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: var(--forest-deep);
}

/* 响应式 */
@media (max-width: 480px) {
  .chatbot-container {
    bottom: 10px;
    right: 10px;
  }

  .chat-window {
    width: calc(100vw - 20px);
    height: calc(100vh - 20px);
    max-height: 550px;
  }

  .chat-toggle {
    width: 50px;
    height: 50px;
  }
}
</style>
