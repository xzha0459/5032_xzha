<template>
  <div class="mood-diary">
    <div class="section-header">
      <h1 class="section-title">How are you feeling today?</h1>
      <h2 class="section-subtitle">Take a moment to check in with yourself</h2>
    </div>

    <div class="mood-diary-content">
      <!-- Success State -->
      <div v-if="showSuccess" class="success-state">
        <div class="ai-tips-section">
          <h2 class="section-title">AI Tips for You</h2>
          <div class="tips-list">
            <div v-for="(tip, index) in aiTips" :key="index" class="tip-item">
              <div class="tip-number">{{ index + 1 }}</div>
              <div class="tip-text">{{ tip }}</div>
            </div>
          </div>
        </div>

        <div class="action-section">
          <button class="btn primary" @click="startNewEntry">
            Save Another Mood Entry
          </button>
          <button class="btn secondary" @click="goToWellbeing">
            Find Emotional Management Strategies
          </button>
        </div>
      </div>

      <!-- Form State -->
      <div v-else>
        <!-- Mood Selection -->
        <div class="mood-section">
          <h2 class="section-title">Select your mood</h2>
          <div class="mood-options">
            <button
              v-for="mood in moodOptions"
              :key="mood.value"
              :class="['mood-option', { active: selectedMood === mood.value }]"
              @click="selectMood(mood.value)"
            >
              <div class="mood-emoji">{{ mood.emoji }}</div>
              <div class="mood-label">{{ mood.label }}</div>
              <div class="mood-description">{{ mood.description }}</div>
            </button>
          </div>
        </div>

        <!-- Text Input -->
        <div class="text-section">
          <h2 class="section-title">Share your thoughts (optional)</h2>
          <textarea
            v-model="textInput"
            class="mood-textarea"
            placeholder="What's on your mind? How was your day? What made you feel this way?"
            rows="4"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="submit-section">
          <button
            class="btn primary"
            @click="submitMoodEntry"
            :disabled="!selectedMood || isSubmitting"
          >
            <span v-if="isSubmitting">Saving...</span>
            <span v-else>Save Mood Entry</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/utils/useAuth.js'
import { useRouter } from 'vue-router'

const { user } = useAuth()
const router = useRouter()

// State
const selectedMood = ref('')
const textInput = ref('')
const isSubmitting = ref(false)
const showSuccess = ref(false)
const aiTips = ref([])

// Mood options
const moodOptions = [
  {
    value: 'happy',
    emoji: '😊',
    label: 'Happy',
    description: 'Feeling joyful and positive'
  },
  {
    value: 'calm',
    emoji: '😌',
    label: 'Calm',
    description: 'Peaceful and relaxed'
  },
  {
    value: 'excited',
    emoji: '🤩',
    label: 'Excited',
    description: 'Enthusiastic and energetic'
  },
  {
    value: 'neutral',
    emoji: '😐',
    label: 'Neutral',
    description: 'Feeling okay, nothing special'
  },
  {
    value: 'tired',
    emoji: '😴',
    label: 'Tired',
    description: 'Feeling exhausted or drained'
  },
  {
    value: 'anxious',
    emoji: '😰',
    label: 'Anxious',
    description: 'Feeling worried or nervous'
  },
  {
    value: 'sad',
    emoji: '😢',
    label: 'Sad',
    description: 'Feeling down or blue'
  },
  {
    value: 'angry',
    emoji: '😠',
    label: 'Angry',
    description: 'Feeling frustrated or mad'
  }
]


// Methods
const selectMood = (mood) => {
  selectedMood.value = mood
}

const submitMoodEntry = async () => {
  if (!selectedMood.value || !user.value) return

  isSubmitting.value = true

  try {
    // Prepare mood entry data
    const moodEntry = {
      userId: user.value.uid,
      mood: selectedMood.value,
      text: textInput.value.trim(),
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    }

    // Save to Firestore
    await addDoc(collection(db, 'moodEntries'), moodEntry)

    // Generate AI tips
    await generateAITips(selectedMood.value, textInput.value)

    // Show success state
    showSuccess.value = true

  } catch (error) {
    console.error('Error saving mood entry:', error)
    alert('Failed to save mood entry. Please try again.')
  } finally {
    isSubmitting.value = false
  }
}

const generateAITips = async (mood, text) => {
  try {
    const response = await fetch('https://mooddiaryai-ha3ghdr32q-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'tips',
        mood: mood,
        text: text,
        userId: user.value?.uid
      })
    })

    const result = await response.json()
    if (result.success) {
      // Parse tips from AI response - split by lines and clean up
      const tips = result.reply
        .split('\n')
        .map(tip => tip.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
        .filter(tip => tip.length > 0) // Remove empty lines
      aiTips.value = tips.slice(0, 3)
    }
  } catch (error) {
    console.error('Error generating AI tips:', error)
  }
}

const startNewEntry = () => {
  showSuccess.value = false
  aiTips.value = []
  selectedMood.value = ''
  textInput.value = ''
}

const goToWellbeing = () => {
  router.push('/wellbeing')
}

// Lifecycle
onMounted(() => {
  // Component mounted
})
</script>

<style scoped>
.mood-diary-header {
  text-align: center;
  margin-bottom: 2rem;
}

.mood-diary-title {
  font-size: 2rem;
  color: var(--forest-deep);
  margin-bottom: 0.5rem;
}

.mood-diary-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.mood-diary-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}



/* Mood Selection */
.mood-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.mood-option {
  padding: 1.5rem;
  border: 2px solid var(--border-light);
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
}

.mood-option:hover {
  border-color: var(--forest-light);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.mood-option.active {
  border-color: var(--forest-deep);
  background: var(--forest-light);
}

.mood-emoji {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.mood-label {
  font-weight: 600;
  color: var(--forest-deep);
  margin-bottom: 0.25rem;
}

.mood-description {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

/* Text Input */
.mood-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid var(--border-light);
  border-radius: 8px;
  font-family: inherit;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
}

.mood-textarea:focus {
  outline: none;
  border-color: var(--forest-deep);
}


/* Submit Section */
.submit-section {
  text-align: center;
  padding: 1rem;
}


/* Success State */
.success-state {
  text-align: center;
  padding: 1rem;
}

.ai-tips-section {
  margin-bottom: 2rem;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
  align-items: center;
}

.tip-item {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 800px;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tip-number {
  width: 24px;
  height: 24px;
  background: var(--forest-deep);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  flex-shrink: 0;
}

.tip-text {
  flex: 1;
  color: var(--text-primary);
  line-height: 1.5;
}

.action-section {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Success Message */
.success-message {
  text-align: center;
  padding: 2rem;
  background: var(--success-light);
  border: 2px solid var(--success);
  border-radius: 12px;
  color: var(--success-dark);
}

.success-icon {
  font-size: 3rem;
  color: var(--success);
  margin-bottom: 1rem;
}

.success-tips {
  margin-top: 1rem;
  font-style: italic;
}

/* Responsive Design */
@media (max-width: 768px) {

  .mood-options {
    grid-template-columns: repeat(2, 1fr);
  }

  .mood-option {
    padding: 1rem;
  }

  .mood-emoji {
    font-size: 2rem;
  }
}
</style>
