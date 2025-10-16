<template>
  <div class="mood-history">
    <div class="section-header">
      <h3 class="section-title">Your Mood Journey</h3>
      <p class="section-subtitle">Track your emotional patterns and insights</p>
    </div>

    <div class="mood-history-content">
      <!-- Statistics Cards -->
      <div class="stats-section">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ totalEntries }}</div>
              <div class="stat-label">Total Entries</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ averageMoodScore }}</div>
              <div class="stat-label">Average Mood</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ streakDays }}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-content">
              <div class="stat-number">{{ mostCommonMood }}</div>
              <div class="stat-label">Most Common</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mood Chart -->
      <MoodTrendChart :moodEntries="moodEntries" />

      <!-- Mood Word Cloud -->
      <MoodWordCloud :moodEntries="moodEntries" />

      <!-- Recent Entries -->
      <div class="entries-section">
        <div class="section-header">
          <h3 class="section-title">Recent Entries</h3>
          <div class="header-actions">
            <div class="filter-controls">
              <select v-model="selectedFilter" class="filter">
                <option value="all">All Moods</option>
                <option value="happy">Happy</option>
                <option value="calm">Calm</option>
                <option value="excited">Excited</option>
                <option value="neutral">Neutral</option>
                <option value="tired">Tired</option>
                <option value="anxious">Anxious</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
              </select>
            </div>
            <div class="export-buttons">
              <button class="btn secondary" @click="exportToPDF">
                Export to PDF
              </button>
              <button class="btn secondary" @click="exportToCSV">
                Export to CSV
              </button>
            </div>
          </div>
        </div>

        <div class="entries-list">
          <div
            v-for="entry in paginatedEntries"
            :key="entry.id"
            class="entry-card"
          >
            <div class="entry-header">
              <div class="entry-mood">
                <span class="mood-emoji">{{ getMoodEmoji(entry.mood) }}</span>
                <span class="mood-label">{{ getMoodLabel(entry.mood) }}</span>
              </div>
              <div class="entry-date">
                {{ formatDate(entry.createdAt) }}
              </div>
            </div>

            <div class="entry-content" v-if="entry.text">
              <p>{{ entry.text }}</p>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="entriesTotalPages > 1">
          <button class="btn action" :disabled="entriesPage === 1" @click="entriesPage--">Prev</button>
          <span class="page-info">{{ entriesPage }} / {{ entriesTotalPages }}</span>
          <button class="btn action" :disabled="entriesPage === entriesTotalPages" @click="entriesPage++">Next</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/utils/useAuth.js'
import MoodWordCloud from '@/components/visualization/MoodWordCloud.vue'
import MoodTrendChart from '@/components/visualization/MoodTrendChart.vue'

const { user } = useAuth()

// State
const moodEntries = ref([])
const selectedFilter = ref('all')
const loading = ref(false)
const entriesPage = ref(1)
const entriesPerPage = 5

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

// Computed
const totalEntries = computed(() => moodEntries.value.length)

const averageMoodScore = computed(() => {
  if (moodEntries.value.length === 0) return 0
  const total = moodEntries.value.reduce((sum, entry) => sum + moodMap[entry.mood]?.score || 0, 0)
  return (total / moodEntries.value.length).toFixed(1)
})

const streakDays = computed(() => {
  // Simple streak calculation - consecutive days with entries
  let streak = 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)

    const hasEntry = moodEntries.value.some(entry => {
      const entryDate = new Date(entry.createdAt)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === checkDate.getTime()
    })

    if (hasEntry) {
      streak++
    } else if (i > 0) {
      break
    }
  }

  return streak
})

const mostCommonMood = computed(() => {
  if (moodEntries.value.length === 0) return 'N/A'

  const moodCounts = {}
  moodEntries.value.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1
  })

  const mostCommon = Object.entries(moodCounts).reduce((a, b) =>
    moodCounts[a[0]] > moodCounts[b[0]] ? a : b
  )

  return moodMap[mostCommon[0]]?.label || 'N/A'
})


const filteredEntries = computed(() => {
  if (selectedFilter.value === 'all') {
    return moodEntries.value
  }
  return moodEntries.value.filter(entry => entry.mood === selectedFilter.value)
})

// Pagination computed properties
const entriesTotalPages = computed(() => {
  return Math.max(1, Math.ceil(filteredEntries.value.length / entriesPerPage))
})

const paginatedEntries = computed(() => {
  const start = (entriesPage.value - 1) * entriesPerPage
  const end = start + entriesPerPage
  return filteredEntries.value.slice(start, end)
})

// Watch for filter changes to reset pagination
watch(selectedFilter, () => {
  entriesPage.value = 1
})

// Methods
const loadMoodEntries = async () => {
  if (!user.value) return

  loading.value = true

  try {
    // Load all entries for pagination
    const q = query(
      collection(db, 'moodEntries'),
      where('userId', '==', user.value.uid),
      orderBy('createdAt', 'desc')
    )

    const snapshot = await getDocs(q)
    moodEntries.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

  } catch (error) {
    console.error('Error loading mood entries:', error)
    moodEntries.value = []
  } finally {
    loading.value = false
  }
}

const getMoodEmoji = (mood) => {
  return moodMap[mood]?.emoji || '😐'
}

const getMoodLabel = (mood) => {
  return moodMap[mood]?.label || 'Unknown'
}

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

const formatDate = (dateInput) => {
  const date = parseToDate(dateInput)
  if (!date) return 'Invalid date'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}


const exportToPDF = () => {
  // Simple PDF generation using browser print
  const printWindow = window.open('', '_blank')
  const content = `
    <html>
      <head>
        <title>Mood Diary Export</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .entry { margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; }
          .mood { font-size: 18px; font-weight: bold; }
          .date { color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>My Mood Diary</h1>
          <p>Generated on ${new Date().toLocaleDateString()}</p>
        </div>
        ${moodEntries.value.map(entry => `
          <div class="entry">
            <div class="mood">${getMoodEmoji(entry.mood)} ${getMoodLabel(entry.mood)}</div>
            <div class="date">${formatDate(entry.createdAt)}</div>
            ${entry.text ? `<p>${entry.text}</p>` : ''}
          </div>
        `).join('')}
      </body>
    </html>
  `

  printWindow.document.write(content)
  printWindow.document.close()
  printWindow.print()
}

const exportToCSV = () => {
  const headers = ['Date', 'Mood', 'Text', 'Has Audio']
  const csvContent = [
    headers.join(','),
    ...moodEntries.value.map(entry => [
      formatDate(entry.createdAt),
      getMoodLabel(entry.mood),
      `"${(entry.text || '').replace(/"/g, '""')}"`,
      entry.audioBlob ? 'Yes' : 'No'
    ].join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `mood-diary-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Lifecycle
onMounted(() => {
  loadMoodEntries()
})
</script>

<style scoped>
.mood-history {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0;
}

.mood-history-header {
  display: none;
}

.mood-history-title {
  font-size: 2rem;
  color: var(--forest-deep);
  margin-bottom: 0.5rem;
}

.mood-history-subtitle {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

.mood-history-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Statistics */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}


.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 600;
  color: var(--forest-deep);
}

.stat-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
}



/* Entries */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.filter-controls {
  display: flex;
  align-items: center;
}

.export-buttons {
  display: flex;
  gap: 0.5rem;
}

.entries-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.entry-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.entry-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.entry-mood {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mood-emoji {
  font-size: 1.5rem;
}

.mood-label {
  font-weight: 600;
  color: var(--forest-deep);
}

.entry-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.entry-content {
  margin-bottom: 1rem;
}

.entry-content p {
  line-height: 1.6;
  color: var(--text-primary);
}



/* Export */
.export-options {
  display: flex;
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .mood-history {
    padding: 1rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
  }

  .export-buttons {
    justify-content: center;
  }

}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
