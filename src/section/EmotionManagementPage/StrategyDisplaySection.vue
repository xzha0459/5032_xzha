<template>
  <div class="strategy-display-section">
      <div class="page-header">
        <h1 class="page-title">Emotion Management Strategies</h1>
      </div>

      <div class="search-section">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search strategies, keywords..."
            class="search-input"
          />
          <div class="search-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="16" x2="21" y2="21" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label for="categoryFilter" class="filter-label">Sort by Category:</label>
          <select
            id="categoryFilter"
            v-model="selectedMainCategory"
            class="category-select"
          >
            <option value="all">All Strategies</option>
            <option
              v-for="category in mainCategories"
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label for="ratingFilter" class="filter-label">Sort by Rating:</label>
          <select
            id="ratingFilter"
            v-model="ratingSortOrder"
            class="rating-select"
          >
            <option value="none">No Sorting</option>
            <option value="high-to-low">High to Low</option>
            <option value="low-to-high">Low to High</option>
          </select>
        </div>
      </div>

      <div class="strategies-section">
        <h3 class="section-title">
          {{ getCurrentCategoryTitle() }}
          <span class="strategy-count">({{ filteredStrategies.length }} strategies)</span>
        </h3>

        <div class="strategies-grid" v-if="filteredStrategies.length > 0">
          <div
            v-for="strategy in filteredStrategies"
            :key="strategy.id"
            class="strategy-card"
            @click="selectStrategy(strategy)"
          >

            <div class="card-header">
              <h2 class="card-title">{{ strategy.title }}</h2>
              <div class="card-tags">
                <span
                  v-for="tag in strategy.tags"
                  :key="tag"
                  class="strategy-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>

            <div class="card-footer">
              <p class="card-description">{{ strategy.description }}</p>
              <div class="card-rating" v-if="getTotalRatings(strategy.id) > 0">
                {{ getAverageRating(strategy.id).toFixed(1) }}⭐
                ({{ getTotalRatings(strategy.id) }} ratings)
              </div>
              <div class="card-rating" v-else>
                No ratings yet
              </div>
            </div>
          </div>
        </div>

        <div class="modal-overlay" v-if="hasSelectedStrategy()" @click="closeModal">
          <div class="floating-card" @click.stop>
            <div class="floating-card-header">
              <h2 class="floating-card-title">{{ selectedStrategy.title }}</h2>
              <button class="close-button" @click="closeModal">×</button>
            </div>

            <div class="floating-card-content">
              <div class="floating-card-tags">
                <span
                  v-for="tag in selectedStrategy.tags"
                  :key="tag"
                  class="strategy-tag"
                >
                  {{ tag }}
                </span>
              </div>

              <p class="floating-strategy-description">{{ selectedStrategy.description }}</p>

              <ul class="floating-strategy-list">
                <li v-for="tip in selectedStrategy.tips" :key="tip.title">
                  <strong>{{ tip.title }}：</strong>
                  {{ tip.description }}
                </li>
              </ul>

              <div class="floating-rating-section">
                <div class="floating-average-rating" v-if="getTotalRatings(selectedStrategy.id) > 0">
                  <div class="floating-average-text">
                    Average: {{ getAverageRating(selectedStrategy.id).toFixed(1) }}⭐
                    ({{ getTotalRatings(selectedStrategy.id) }} ratings)
                  </div>
                </div>
                <div class="floating-average-rating" v-else>
                  <div class="floating-average-text">
                    No ratings yet
                  </div>
                </div>

                <div class="floating-user-rating" v-if="isAuthenticated && !isAdminUser">
                  <div class="floating-rating-label">Your rating:</div>
                  <div class="floating-star-rating">
                    <span
                      v-for="star in renderStars(selectedStrategy.id)"
                      :key="star.value"
                      @click="setStrategyRating(selectedStrategy.id, star.value)"
                      :class="['floating-star', {
                        'filled': star.filled
                      }]"
                      :title="`Rate ${star.value} star${star.value > 1 ? 's' : ''}`"
                    >
                      ★
                    </span>
                  </div>
                  <div class="floating-rating-text" v-if="getStrategyRating(selectedStrategy.id) > 0">
                    {{ getStrategyRating(selectedStrategy.id) === 5 ? 'Highly Recommended!' : `${getStrategyRating(selectedStrategy.id)} star${getStrategyRating(selectedStrategy.id) > 1 ? 's' : ''}` }}
                    <div class="rating-hint">Click a star to change your rating</div>
                  </div>
                </div>

                <div class="floating-readonly-rating" v-if="!isAuthenticated">
                  <div class="floating-rating-label">Overall Rating:</div>
                  <div class="floating-star-display">
                    <span
                      v-for="star in renderStars(selectedStrategy.id)"
                      :key="star.value"
                      :class="['floating-star', 'readonly', {
                        'filled': star.filled
                      }]"
                      :title="`${star.value} star${star.value > 1 ? 's' : ''}`"
                    >
                      ★
                    </span>
                  </div>
                  <div class="floating-rating-text" v-if="getTotalRatings(selectedStrategy.id) > 0">
                    {{ getAverageRating(selectedStrategy.id).toFixed(1) }} stars ({{ getTotalRatings(selectedStrategy.id) }} ratings)
                    <div class="login-note">Please login to rate this strategy</div>
                  </div>
                  <div class="floating-rating-text" v-else>
                    No ratings yet
                    <div class="login-note">Please login to be the first to rate this strategy</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
  </div>
</template>

<script>
import { mainCategories } from '@/data/emotionStrategies.js'
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase.js'
import { useAuth } from '@/composables/useAuth.js'
import { isAdmin } from '@/utils/permissions.js'

export default {
  name: 'StrategyDisplaySection',
  setup() {
    const { user, isAuthenticated, userRole } = useAuth()
    return { user, isAuthenticated, userRole }
  },
  data() {
    return {
      searchQuery: '',
      selectedMainCategory: 'all',
      ratingSortOrder: 'none',
      mainCategories,
      strategies: [],
      userRatings: {},
      aggregateRatings: {},
      selectedStrategy: null
    }
  },


  mounted() {
    // Load strategies and aggregate ratings immediately, regardless of authentication status
    this.loadStrategies()
    this.loadAggregateRatings()
  },

  watch: {
    isAuthenticated: {
      handler: async function(newVal) {
        if (newVal) {
          // User logged in - load all data including user-specific ratings
          await this.loadDataIfAuthenticated()
        } else {
          // User logged out - clear personal rating data, keep strategies and aggregate ratings
          this.userRatings = {}
          // Don't clear strategies or aggregateRatings, let unauthenticated users see them
        }
      },
      immediate: true
    }
  },

  computed: {
    // Check if user is admin
    isAdminUser() {
      return isAdmin(this.userRole)
    },

    filteredStrategies() {
      let filtered = this.strategies
      if (this.selectedMainCategory !== 'all') {
        filtered = filtered.filter(strategy =>
          strategy.category === this.selectedMainCategory
        )
      }

      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(strategy =>
          strategy.title.toLowerCase().includes(query) ||
          strategy.description.toLowerCase().includes(query) ||
          strategy.tags.some(tag => tag.toLowerCase().includes(query)) ||
          strategy.tips.some(tip =>
            tip.title.toLowerCase().includes(query) ||
            tip.description.toLowerCase().includes(query)
          )
        )
      }

      if (this.ratingSortOrder !== 'none') {
        filtered = filtered.sort((a, b) => {
          const ratingA = this.getAverageRating(a.id)
          const ratingB = this.getAverageRating(b.id)

          if (this.ratingSortOrder === 'high-to-low') {
            return ratingB - ratingA
          } else if (this.ratingSortOrder === 'low-to-high') {
            return ratingA - ratingB
          }
          return 0
        })
      }

      return filtered
    }
  },

  methods: {
    async loadStrategies() {
      try {
        const snapshot = await getDocs(collection(db, 'strategies'))
        const nameToId = Object.fromEntries(mainCategories.map(c => [c.name, c.id]))
        const docs = snapshot.docs.map(d => {
          const data = d.data()
          const categoryNameOrId = data.category
          const categoryId = nameToId[categoryNameOrId] || categoryNameOrId
          return {
            id: data.id || d.id,
            title: data.title,
            description: data.description || '',
            tags: data.tags || [],
            tips: data.tips || [],
            category: categoryId
          }
        })
        this.strategies = docs
      } catch (e) {
        console.error('Error loading strategies from Firestore:', e)
      }
    },
    async loadDataIfAuthenticated() {
      await this.loadAggregateRatings()
      await this.loadStrategies()
      if (this.isAuthenticated && this.user?.uid) {
        await this.loadUserRatings()
      }
    },

    getCurrentCategoryTitle() {
      if (this.selectedMainCategory === 'all') {
        return 'All Emotion Management Strategies'
      }
      const category = this.mainCategories.find(cat => cat.id === this.selectedMainCategory)
      return category ? category.name : 'Emotion Management Strategies'
    },

    async loadUserRatings() {
      try {
        const q = query(
          collection(db, 'ratings'),
          where('userId', '==', this.user.uid),
          where('itemType', '==', 'strategy')
        )
        const snapshot = await getDocs(q)
        snapshot.forEach(doc => {
          const data = doc.data()
          this.userRatings[data.itemId] = data.rating
        })
      } catch (error) {
        console.error('Error loading user ratings:', error)
      }
    },

    async loadAggregateRatings() {
      try {
        const q = query(collection(db, 'rating_aggregates'))
        const snapshot = await getDocs(q)
        snapshot.forEach(doc => {
          const data = doc.data()
          this.aggregateRatings[data.itemId] = data
        })
      } catch (error) {
        console.error('Error loading aggregate ratings:', error)
      }
    },

    getStrategyRating(strategyId) {
      return this.userRatings[strategyId] || 0
    },

    getAverageRating(strategyId) {
      return this.aggregateRatings[strategyId]?.averageRating || 0
    },

    getTotalRatings(strategyId) {
      return this.aggregateRatings[strategyId]?.totalRatings || 0
    },

    async setStrategyRating(strategyId, rating) {
      if (!this.isAuthenticated) {
        alert('Please login to rate strategies')
        return
      }

      try {
        const existingRatingId = `${this.user.uid}_${strategyId}`
        const isExistingRating = this.userRatings[strategyId] > 0

        let existingData = null
        if (isExistingRating) {
          try {
            const ratingDoc = await getDoc(doc(db, 'ratings', existingRatingId))
            existingData = ratingDoc.exists() ? ratingDoc.data() : null
          } catch (error) {
            console.warn('Could not fetch existing rating data:', error)
          }
        }

        await setDoc(doc(db, 'ratings', existingRatingId), {
          userId: this.user.uid,
          itemId: strategyId,
          itemType: 'strategy',
          rating: rating,
          createdAt: existingData?.createdAt || new Date(),
          updatedAt: new Date()
        })

        this.userRatings[strategyId] = rating

        await this.updateAggregateRating(strategyId)

        if (isExistingRating) {
          console.log(`Rating updated to ${rating} stars`)
        } else {
          console.log(`Rating saved: ${rating} stars`)
        }
      } catch (error) {
        console.error('Error saving rating:', error)
        alert('Failed to save rating. Please try again.')
      }
    },

    async updateAggregateRating(strategyId) {
      const q = query(
        collection(db, 'ratings'),
        where('itemId', '==', strategyId),
        where('itemType', '==', 'strategy')
      )
      const snapshot = await getDocs(q)

      let totalRating = 0
      let count = 0

      snapshot.forEach(doc => {
        totalRating += doc.data().rating
        count++
      })

      const averageRating = count > 0 ? totalRating / count : 0

      await setDoc(doc(db, 'rating_aggregates', strategyId), {
        itemId: strategyId,
        itemType: 'strategy',
        totalRatings: count,
        averageRating: averageRating,
        lastUpdated: new Date()
      })
    },

    renderStars(strategyId) {
      const rating = this.getStrategyRating(strategyId)
      const stars = []
      for (let i = 1; i <= 5; i++) {
        stars.push({
          value: i,
          filled: i <= rating,
          isRecommended: false
        })
      }
      return stars
    },

    selectStrategy(strategy) {
      this.selectedStrategy = strategy
    },

    closeModal() {
      this.selectedStrategy = null
    },

    hasSelectedStrategy() {
      return this.selectedStrategy !== null
    }
  }
}
</script>

<style scoped>
.strategy-display-section {
  width: 100%;
}

/* Page Title Styles */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.4rem;
  font-weight: 600;
  color: var(--color-heading);
  margin: 0;
}

/* Search Bar Styles */
.search-section {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 400px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 2.5rem 0.75rem 1.2rem;
  border: 2px solid var(--border-light);
  border-radius: 25px;
  font-size: 0.9rem;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--forest-accent);
  box-shadow: 0 0 0 3px rgba(122, 139, 122, 0.1);
}

.search-icon {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--forest-medium);
  pointer-events: none;
}

.search-icon svg { width: 1.2rem; height: 1.2rem; display: block; }

/* Filter Styles */
.filters-section {
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.category-select,
.rating-select {
  padding: 0.6rem 1.2rem;
  border: 2px solid var(--border-light);
  border-radius: 20px;
  background: #f8f9fa;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1rem;
  padding-right: 3rem;
}

.category-select:focus,
.rating-select:focus {
  outline: none;
  border-color: var(--forest-accent);
  box-shadow: 0 0 0 3px rgba(122, 139, 122, 0.1);
}

/* Strategy Area Styles */
.strategies-section {
  margin-bottom: 3rem;
}

.section-title {
  color: var(--color-heading);
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.strategy-count {
  color: var(--forest-medium);
  font-size: 1rem;
  font-weight: 400;
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 3rem;
}

.strategy-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


/* Card Header Area */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  line-height: 1.2;
  flex: 1;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
  margin-left: 1rem;
}

.strategy-tag {
  background: var(--forest-sage);
  color: var(--forest-deep);
  padding: 0.25rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Card Footer Area */
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.card-description {
  color: #333;
  font-size: 0.8rem;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.card-rating {
  color: #666;
  font-size: 0.75rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
}




/* Floating Card Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.floating-card {
  background: white;
  border: 1px solid #ddd;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  width: 1000px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.floating-card-header {
  padding: 1.5rem;
  text-align: left;
  color: #333;
  position: relative;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.floating-card-title {
  font-size: 1.4rem;
  font-weight: bold;
  margin: 0;
  flex: 1;
}

.close-button {
  background: #f5f5f5;
  border: 1px solid #ddd;
  color: #666;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: 1rem;
}

.close-button:hover {
  background: #e0e0e0;
  color: #333;
}

.floating-card-content {
  padding: 1.5rem;
}

.floating-card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.floating-card-tags .strategy-tag {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.floating-strategy-description {
  color: #333;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1.5rem;
  font-style: italic;
}

.floating-strategy-list {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.floating-strategy-list li {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-light);
  line-height: 1.6;
}

.floating-strategy-list li:last-child {
  border-bottom: none;
}

.floating-strategy-list strong {
  color: var(--forest-deep);
  font-weight: 600;
}

/* Floating Card Rating System */
.floating-rating-section {
  margin-top: 2rem;
  text-align: center;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
}

.floating-average-rating {
  margin-bottom: 1.5rem;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(122, 139, 122, 0.2);
}

.floating-average-text {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
}

.floating-user-rating {
  margin-bottom: 1rem;
}


.floating-star-display {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.floating-star.readonly {
  cursor: default;
  opacity: 0.8;
}

.floating-star.readonly:hover {
  transform: none;
  color: var(--border-medium);
}

.floating-readonly-rating {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 123, 255, 0.05);
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 8px;
}

.login-note {
  color: var(--forest-medium);
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.5rem;
  text-align: center;
}

.floating-rating-label {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.floating-star-rating {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.floating-star {
  font-size: 2rem;
  color: var(--border-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.floating-star:hover {
  color: #ffd700;
  transform: scale(1.1);
}

.floating-star.filled {
  color: #ffd700;
}

.floating-rating-text {
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
  font-style: italic;
}

.rating-hint {
  font-size: 0.8rem;
  color: var(--forest-medium);
  font-weight: 400;
  font-style: normal;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .search-input {
    padding: 0.8rem 2.5rem 0.8rem 1.2rem;
    font-size: 0.9rem;
  }

  .search-icon {
    right: 1.2rem;
    font-size: 1rem;
  }

  .filter-label {
    font-size: 0.9rem;
  }

  .category-select {
    min-width: 100%;
    padding: 0.6rem 1.2rem;
    font-size: 0.9rem;
    padding-right: 2.5rem;
  }

  .strategies-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .strategy-card {
    min-height: 160px;
    padding: 1rem;
    gap: 0.75rem;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .card-tags {
    margin-left: 0;
    gap: 0.3rem;
  }

  .strategy-tag {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }

  .card-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .card-description {
    font-size: 0.8rem;
  }

  .card-rating {
    font-size: 0.75rem;
  }

  .section-title {
    font-size: 1.5rem;
  }

  /* Floating Card Mobile Styles */
  .floating-card {
    width: 95%;
    max-height: 90vh;
  }

  .floating-card-header {
    padding: 1.5rem;
  }

  .floating-card-title {
    font-size: 1.5rem;
  }

  .close-button {
    width: 35px;
    height: 35px;
    font-size: 1.5rem;
  }

  .floating-card-content {
    padding: 1.5rem;
  }

  .floating-strategy-description {
    font-size: 1rem;
  }

  .floating-star {
    font-size: 1.8rem;
  }

  .floating-rating-section {
    padding: 1rem;
  }
}
</style>
