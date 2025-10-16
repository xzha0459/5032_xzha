<template>
  <div class="chart-section">
    <div class="section-header">
      <h3 class="section-title">Mood Trend (Last 7 Days)</h3>
        <p class="section-subtitle">Record your weekly mood changes</p>
    </div>
    <div class="mood-chart">
      <div class="chart-container">
        <div
          v-for="(day, index) in weeklyMoodData"
          :key="index"
          class="chart-bar"
          :style="{ height: `${(day.score / 10) * 100}%` }"
        >
          <div class="bar-value">{{ day.score }}</div>
          <div class="bar-label">{{ day.label }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  moodEntries: {
    type: Array,
    default: () => []
  }
})

// Mood mapping
const moodMap = {
  happy: { emoji: '😊', label: 'Happy', score: 9 },
  calm: { emoji: '😌', label: 'Calm', score: 8 },
  excited: { emoji: '🤩', label: 'Excited', score: 8 },
  neutral: { emoji: '😐', label: 'Neutral', score: 5 },
  tired: { emoji: '😴', label: 'Tired', score: 4 },
  anxious: { emoji: '😰', label: 'Anxious', score: 3 },
  sad: { emoji: '😢', label: 'Sad', score: 2 },
  angry: { emoji: '😠', label: 'Angry', score: 2 }
}

// Normalize various timestamp formats (ISO string, Date, Firestore Timestamp, human readable)
function parseToDate(value) {
  if (!value) return null
  if (value instanceof Date) return value

  if (typeof value === 'string') {
    // Handle human readable format like "13 October 2025 at 22:36:23 UTC+8"
    if (value.includes(' at ') && value.includes(' UTC')) {
      // Extract date and time parts
      const parts = value.split(' at ')
      if (parts.length === 2) {
        const datePart = parts[0] // "13 October 2025"
        const timePart = parts[1].split(' UTC')[0] // "22:36:23"
        const timezonePart = parts[1].split(' UTC')[1] // "+8"

        // Parse the date
        const parsedDate = new Date(`${datePart} ${timePart}`)
        if (!isNaN(parsedDate)) {
          // Adjust for timezone offset
          const offset = parseInt(timezonePart.replace('+', ''))
          parsedDate.setHours(parsedDate.getHours() - offset)
          return parsedDate
        }
      }
    }

    // Handle ISO format and other standard formats
    const d = new Date(value)
    return isNaN(d) ? null : d
  }

  if (typeof value === 'number') {
    const d = new Date(value)
    return isNaN(d) ? null : d
  }

  if (typeof value === 'object') {
    // Handle Firestore Timestamp
    if (typeof value.toDate === 'function') {
      return value.toDate()
    }
    if ('seconds' in value && 'nanoseconds' in value) {
      return new Date(value.seconds * 1000 + Math.floor(value.nanoseconds / 1e6))
    }
    // Handle Firestore Timestamp with _Timestamp property
    if (value._Timestamp) {
      if (value._Timestamp.seconds) {
        return new Date(value._Timestamp.seconds * 1000)
      }
    }
  }
  return null
}

const weeklyMoodData = computed(() => {
  const last7Days = []
  const today = new Date()

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)

    const dayEntries = props.moodEntries.filter(entry => {
      const entryDate = parseToDate(entry.createdAt) || parseToDate(entry.timestamp)
      if (!entryDate) return false
      return entryDate.toDateString() === date.toDateString()
    })

    const avgScore = dayEntries.length > 0
      ? dayEntries.reduce((sum, entry) => sum + moodMap[entry.mood]?.score || 0, 0) / dayEntries.length
      : 0

    last7Days.push({
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
      score: Math.round(avgScore),
      date: date.toISOString()
    })
  }

  return last7Days
})
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.mood-chart {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-container {
  display: flex;
  align-items: end;
  justify-content: space-between;
  height: 200px;
  padding: 2rem 1rem 2rem 1rem;
  position: relative;
}

.chart-bar {
  flex: 1;
  margin: 0 0.25rem;
  background: linear-gradient(to top, var(--forest-deep), var(--forest-light));
  border-radius: 4px 4px 0 0;
  position: relative;
  min-height: 20px;
  display: flex;
  flex-direction: column;
  justify-content: end;
}

.bar-value {
  position: absolute;
  top: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--forest-deep);
}

.bar-label {
  position: absolute;
  bottom: -1.5rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .chart-section {
    padding: 1rem;
  }

  .chart-container {
    height: 180px;
    padding: 1.5rem 0.5rem 1.5rem 0.5rem;
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 160px;
    padding: 1rem 0.25rem 1rem 0.25rem;
  }

  .bar-value {
    font-size: 0.7rem;
  }

  .bar-label {
    font-size: 0.7rem;
  }
}
</style>
