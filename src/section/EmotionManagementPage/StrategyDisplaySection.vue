<template>
  <div class="strategy-display-section">
      <h1 class="section-title">Emotion Management Strategies</h1>

      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search strategies, keywords..."
          class="search"
        />
      </div>

      <div class="filters-section">
        <div class="filter-group">
          <label for="categoryFilter" class="filter-label">Sort by Category:</label>
          <select
            id="categoryFilter"
            v-model="selectedMainCategory"
            class="filter"
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
            class="filter"
          >
            <option value="none">No Sorting</option>
            <option value="high-to-low">High to Low</option>
            <option value="low-to-high">Low to High</option>
          </select>
        </div>
      </div>

      <div class="strategies-section">
        <div class="strategies-grid" v-if="filteredStrategies.length > 0">
          <div
            v-for="strategy in filteredStrategies"
            :key="strategy.id"
            class="card"
            @click="selectStrategy(strategy)"
          >

            <div class="card-header">
              <h2 class="card-title">{{ strategy.title }}</h2>
              <span
                v-for="tag in strategy.tags"
                :key="tag"
                class="tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="card-body">
              <p>{{ strategy.description }}</p>
            </div>

            <div class="card-footer">
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

        <div class="modal-overlay" v-if="hasSelectedStrategy()" @click="closeModal" role="presentation">
          <div class="modal" @click.stop ref="strategyModal"
               role="dialog" aria-modal="true" :aria-labelledby="'strategy-modal-title'"
               @keydown="handleModalKeydown">
            <div class="modal-header">
              <h2 class="modal-title" :id="'strategy-modal-title'">{{ selectedStrategy.title }}</h2>
              <button class="close-button" ref="strategyCloseBtn" @click="closeModal" aria-label="Close modal">×</button>
            </div>

            <div class="modal-body">
              <div class="modal-tags">
                <span
                  v-for="tag in selectedStrategy.tags"
                  :key="tag"
                  class="tag"
                >
                  {{ tag }}
                </span>
              </div>

              <p class="modal-description">{{ selectedStrategy.description }}</p>

              <ul class="modal-list">
                <li v-for="tip in selectedStrategy.tips" :key="tip.title">
                  <strong>{{ tip.title }}：</strong>
                  {{ tip.description }}
                </li>
              </ul>

              <div class="modal-rating">
                <div class="rating-average" v-if="getTotalRatings(selectedStrategy.id) > 0">
                  Average: {{ getAverageRating(selectedStrategy.id).toFixed(1) }}⭐
                  ({{ getTotalRatings(selectedStrategy.id) }} ratings)
                </div>
                <div class="rating-average" v-else>
                  No ratings yet
                </div>

                <div class="rating-user" v-if="isAuthenticated && !isAdminUser">
                  <div class="rating-label">Your rating:</div>
                  <div class="rating-stars">
                    <span
                      v-for="star in renderStars(selectedStrategy.id)"
                      :key="star.value"
                      @click="setStrategyRating(selectedStrategy.id, star.value)"
                      :class="['star', { 'filled': star.filled }]"
                    >
                      ★
                    </span>
                  </div>
                  <div class="rating-text" v-if="getStrategyRating(selectedStrategy.id) > 0">
                    {{ getStrategyRating(selectedStrategy.id) === 5 ? 'Highly Recommended!' : `${getStrategyRating(selectedStrategy.id)} star${getStrategyRating(selectedStrategy.id) > 1 ? 's' : ''}` }}
                    <div class="rating-hint">Click a star to change your rating</div>
                  </div>
                </div>

                <div class="rating-readonly" v-if="!isAuthenticated">
                  <div class="rating-label">Overall Rating:</div>
                  <div class="rating-stars">
                    <span
                      v-for="star in renderStars(selectedStrategy.id)"
                      :key="star.value"
                      :class="['star', 'readonly', { 'filled': star.filled }]"
                    >
                      ★
                    </span>
                  </div>
                  <div class="rating-text">
                    Login to rate this strategy
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
import { useAuth } from '@/utils/useAuth.js'
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
      selectedStrategy: null,
      lastFocusedBeforeModal: null
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
      if (this.isAuthenticated && this.user?.uid) {
        await this.loadUserRatings()
      }
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
          filled: i <= rating
        })
      }
      return stars
    },

    selectStrategy(strategy) {
      // 记录触发元素以便关闭后还原焦点
      this.lastFocusedBeforeModal = document.activeElement
      this.selectedStrategy = strategy
      this.$nextTick(() => {
        // 将焦点移到关闭按钮
        const btn = this.$refs.strategyCloseBtn
        if (btn && btn.focus) btn.focus()
      })
    },

    closeModal() {
      this.selectedStrategy = null
      // 关闭后把焦点还原到触发元素
      if (this.lastFocusedBeforeModal && this.lastFocusedBeforeModal.focus) {
        this.lastFocusedBeforeModal.focus()
      }
    },

    hasSelectedStrategy() {
      return this.selectedStrategy !== null
    },

    // 焦点陷阱与ESC
    handleModalKeydown(e) {
      if (e.key === 'Escape') {
        this.closeModal()
        return
      }
      if (e.key !== 'Tab') return
      const modal = this.$refs.strategyModal
      if (!modal) return
      const focusable = modal.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
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
  }
}
</script>

<style scoped>
/* Search Bar Styles */
.search-section {
  margin: 0 auto 2rem auto;
  display: flex;
  justify-content: center;
  max-width: 800px;
}

/* Filter Styles */
.filters-section {
  margin: 0 auto 2rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4rem;
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


/* Strategy Area Styles */
.strategies-section {
  margin-bottom: 3rem;
}

.strategies-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* Modal styles */
.modal-rating {
  text-align: center;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid var(--border-light);
}

.rating-average,
.rating-readonly {
  margin-bottom: 1rem;
  padding: 1rem;
  border-radius: 8px;
  color: var(--text-primary);
  font-weight: 600;
}

.rating-average {
  border: 1px solid rgba(122, 139, 122, 0.2);
}

.rating-readonly {
  background: rgba(0, 123, 255, 0.05);
  border: 1px solid rgba(0, 123, 255, 0.2);
}

.rating-label {
  color: var(--text-primary);
  font-size: 1rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.rating-stars {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.star {
  font-size: 2rem;
  color: var(--border-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.star:hover,
.star.filled {
  color: #ffd700;
}

.star:hover {
  transform: scale(1.1);
}

.star.readonly {
  cursor: default;
  opacity: 0.8;
}

.star.readonly:hover {
  transform: none;
  color: var(--border-medium);
}

.rating-text {
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
  margin-top: 0.5rem;
  text-align: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .strategies-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>
