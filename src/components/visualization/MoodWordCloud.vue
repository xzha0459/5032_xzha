<template>
  <div class="wordcloud-section">
    <div class="section-header">
      <h3 class="section-title">Mood Word Cloud</h3>
      <p class="section-subtitle">Visual representation of your mood patterns</p>
    </div>

    <div class="wordcloud-container">
      <canvas
        ref="wordcloudCanvas"
        class="wordcloud-canvas"
        :width="canvasWidth"
        :height="canvasHeight"
      ></canvas>

      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Generating word cloud...</p>
      </div>

      <div v-if="!hasData && !loading" class="no-data">
        <div class="no-data-icon">☁️</div>
        <p>No mood data available for word cloud</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import WordCloud from 'wordcloud2/src/wordcloud2.js'

const props = defineProps({
  moodEntries: {
    type: Array,
    default: () => []
  }
})

const wordcloudCanvas = ref(null)
const loading = ref(false)
const canvasWidth = ref(600)
const canvasHeight = ref(400)
const resizeTimeout = ref(null)

// Computed properties
const hasData = computed(() => {
  return props.moodEntries && props.moodEntries.length > 0
})

const moodFrequency = computed(() => {
  if (!hasData.value) return []

  const frequency = {}

  // Count mood occurrences
  props.moodEntries.forEach(entry => {
    if (entry.mood) {
      frequency[entry.mood] = (frequency[entry.mood] || 0) + 1
    }
  })

  // Convert to wordcloud format
  return Object.entries(frequency).map(([word, count]) => [word, count])
})

// Methods
const generateWordCloud = async () => {
  if (!wordcloudCanvas.value || !hasData.value) return

  loading.value = true

  try {
    await nextTick()

    // Clear canvas
    const ctx = wordcloudCanvas.value.getContext('2d')
    ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

    // Sort words by frequency to ensure most frequent word is processed first
    const sortedWords = [...moodFrequency.value].sort((a, b) => b[1] - a[1])

    // Generate word cloud with center-focused configuration
    WordCloud(wordcloudCanvas.value, {
      list: sortedWords,
      weightFactor: 12,
      fontFamily: 'Arial, sans-serif',
      color: function() {
        // Simple color scheme
        const colors = ['#007bff', '#28a745', '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#6c757d']
        return colors[Math.floor(Math.random() * colors.length)]
      },
      backgroundColor: 'transparent',
      gridSize: 4,
      drawOutOfBound: false,
      shrinkToFit: true,
      minSize: 20,
      maxSize: 80,
      rotationAngles: [0, 90],
      rotationAnglesProbability: [0.8, 0.2],
      shape: 'circle',
      ellipticity: 0.6,
      minRotation: 0,
      maxRotation: 0,
      hover: function() {
        // Optional hover effect
      }
    })

  } catch (error) {
    console.error('Error generating word cloud:', error)
  } finally {
    loading.value = false
  }
}

const updateCanvasSize = () => {
  const container = wordcloudCanvas.value?.parentElement
  if (container) {
    const containerWidth = container.clientWidth
    const containerHeight = container.clientHeight

    // Calculate responsive dimensions
    const padding = 40
    const maxWidth = Math.min(containerWidth - padding, 600)
    const maxHeight = Math.min(containerHeight - padding, 280)

    // Maintain aspect ratio but adapt to container
    const aspectRatio = 1.0 // width/height ratio (square-ish, shorter)
    let newWidth = maxWidth
    let newHeight = newWidth / aspectRatio

    // If height exceeds container, adjust width
    if (newHeight > maxHeight) {
      newHeight = maxHeight
      newWidth = newHeight * aspectRatio
    }

    canvasWidth.value = Math.max(newWidth, 300) // Minimum width
    canvasHeight.value = Math.max(newHeight, 120) // Minimum height

    // Clear any existing timeout
    if (resizeTimeout.value) {
      clearTimeout(resizeTimeout.value)
    }

    // Debounce the word cloud regeneration
    resizeTimeout.value = setTimeout(() => {
      if (hasData.value) {
        generateWordCloud()
      }
    }, 300) // Wait 300ms after resize stops
  }
}

// Watch for mood entries changes
watch(() => props.moodEntries, () => {
  if (hasData.value) {
    generateWordCloud()
  }
}, { deep: true })

// Lifecycle
onMounted(() => {
  updateCanvasSize()
  if (hasData.value) {
    generateWordCloud()
  }

  // Handle window resize
  window.addEventListener('resize', updateCanvasSize)
})

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', updateCanvasSize)
  if (resizeTimeout.value) {
    clearTimeout(resizeTimeout.value)
  }
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.wordcloud-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  width: 100%;
  background: white;
  border-radius: 12px;
  border: 1px solid var(--border-light);
  overflow: hidden;
}

.wordcloud-canvas {
  max-width: 100%;
  height: auto;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(248, 249, 250, 0.9);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #e9ecef;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.no-data-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .wordcloud-section {
    padding: 1rem;
  }

  .wordcloud-container {
    min-height: 160px;
  }

  .section-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .wordcloud-container {
    min-height: 140px;
  }

  .wordcloud-canvas {
    max-width: 95%;
  }
}
</style>
