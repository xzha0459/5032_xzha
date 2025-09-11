<template>
  <div class="strategy-display-section">
      <!-- 页面标题 -->
      <div class="page-header">
        <h1 class="page-title">Emotion Management Strategies</h1>
      </div>

      <!-- 搜索栏 -->
      <div class="search-section">
        <div class="search-input-wrapper">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search strategies, keywords..."
            class="search-input"
          />
          <div class="search-icon">🔍</div>
        </div>
      </div>

      <!-- 筛选器 -->
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

      <!-- 策略列表 -->
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
            <!-- 标题和标签区域 - 顶部 -->
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

            <!-- 描述和评分区域 - 底部 -->
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

        <!-- 悬浮大卡片 -->
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

              <!-- 评分系统 -->
              <div class="floating-rating-section">
                <!-- 聚合评分显示 - 所有用户都可以看到 -->
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

                <!-- 普通用户评分 -->
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

                <!-- 管理员评分查看 -->
                <div class="floating-admin-rating" v-if="isAuthenticated && isAdminUser">
                  <div class="floating-rating-label">Rating Overview (Admin View):</div>
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
                  <div class="floating-rating-text" v-if="getStrategyRating(selectedStrategy.id) > 0">
                    {{ getStrategyRating(selectedStrategy.id) === 5 ? 'Highly Recommended!' : `${getStrategyRating(selectedStrategy.id)} star${getStrategyRating(selectedStrategy.id) > 1 ? 's' : ''}` }}
                    <div class="admin-note">As an administrator, you can view ratings but cannot rate strategies.</div>
                  </div>
                  <div class="floating-rating-text" v-else>
                    No rating given
                    <div class="admin-note">As an administrator, you can view ratings but cannot rate strategies.</div>
                  </div>
                </div>

                <!-- 未登录提示 -->
                <div class="floating-login-prompt" v-if="!isAuthenticated">
                  <div class="floating-rating-label">Please login to rate strategies</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
  </div>
</template>

<script>
import { mainCategories, strategies } from '@/data/emotionStrategies.js'
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
      strategies,
      userRatings: {},
      aggregateRatings: {},
      selectedStrategy: null
    }
  },

  async mounted() {
    // 延迟一点时间确保认证状态已确定
    setTimeout(async () => {
      await this.loadDataIfAuthenticated()
    }, 100)
  },

  watch: {
    isAuthenticated: {
      handler: async function(newVal) {
        if (newVal) {
          await this.loadDataIfAuthenticated()
        } else {
          // 用户登出时清空数据
          this.userRatings = {}
          this.aggregateRatings = {}
        }
      },
      immediate: true
    }
  },

  computed: {
    // 检查用户是否为管理员
    isAdminUser() {
      return isAdmin(this.userRole)
    },

    // 过滤后的策略
    filteredStrategies() {
      let filtered = this.strategies

      // 分类筛选
      if (this.selectedMainCategory !== 'all') {
        filtered = filtered.filter(strategy =>
          strategy.category === this.selectedMainCategory
        )
      }

      // 搜索筛选
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

      // 评分排序
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
    // 如果用户已认证则加载数据
    async loadDataIfAuthenticated() {
      if (this.isAuthenticated && this.user?.uid) {
        await this.loadUserRatings()
        await this.loadAggregateRatings()
      }
    },


    // 获取当前分类标题
    getCurrentCategoryTitle() {
      if (this.selectedMainCategory === 'all') {
        return 'All Emotion Management Strategies'
      }
      const category = this.mainCategories.find(cat => cat.id === this.selectedMainCategory)
      return category ? category.name : 'Emotion Management Strategies'
    },

    // 加载当前用户的评分
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

    // 加载聚合评分数据
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

    // 获取用户评分
    getStrategyRating(strategyId) {
      return this.userRatings[strategyId] || 0
    },

    // 获取平均评分
    getAverageRating(strategyId) {
      return this.aggregateRatings[strategyId]?.averageRating || 0
    },

    // 获取总评分数量
    getTotalRatings(strategyId) {
      return this.aggregateRatings[strategyId]?.totalRatings || 0
    },

    // 设置策略评分
    async setStrategyRating(strategyId, rating) {
      if (!this.isAuthenticated) {
        alert('Please login to rate strategies')
        return
      }

      try {
        const existingRatingId = `${this.user.uid}_${strategyId}`
        const isExistingRating = this.userRatings[strategyId] > 0

        // 获取现有评分数据以保持创建时间
        let existingData = null
        if (isExistingRating) {
          try {
            const ratingDoc = await getDoc(doc(db, 'ratings', existingRatingId))
            existingData = ratingDoc.exists() ? ratingDoc.data() : null
          } catch (error) {
            console.warn('Could not fetch existing rating data:', error)
          }
        }

        // 保存或更新用户评分（使用setDoc会自动覆盖）
        await setDoc(doc(db, 'ratings', existingRatingId), {
          userId: this.user.uid,
          itemId: strategyId,
          itemType: 'strategy',
          rating: rating,
          createdAt: existingData?.createdAt || new Date(),
          updatedAt: new Date()
        })

        // 更新本地状态
        this.userRatings[strategyId] = rating

        // 重新计算聚合评分
        await this.updateAggregateRating(strategyId)

        // 显示成功消息
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

    // 更新聚合评分
    async updateAggregateRating(strategyId) {
      // 查询该策略的所有评分
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

      // 更新聚合数据
      await setDoc(doc(db, 'rating_aggregates', strategyId), {
        itemId: strategyId,
        itemType: 'strategy',
        totalRatings: count,
        averageRating: averageRating,
        lastUpdated: new Date()
      })
    },

    // 渲染星星
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

    // 选择策略显示悬浮卡片
    selectStrategy(strategy) {
      this.selectedStrategy = strategy
    },

    // 关闭悬浮卡片
    closeModal() {
      this.selectedStrategy = null
    },

    // 检查是否有选中的策略
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



/* 页面标题样式 */
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

/* 搜索栏样式 */
.search-section {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.search-input {
  width: 100%;
  padding: 1rem 3rem 1rem 1.5rem;
  border: 2px solid var(--border-light);
  border-radius: 50px;
  font-size: 1rem;
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
  font-size: 1.2rem;
  color: var(--forest-medium);
  pointer-events: none;
}

/* 筛选器样式 */
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
  padding: 0.75rem 1.5rem;
  border: 2px solid var(--border-light);
  border-radius: 25px;
  background: #f8f9fa;
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
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

/* 策略区域样式 */
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
  border-radius: 12px;
  padding: 1.5rem;
  position: relative;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.strategy-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}


/* 卡片头部区域 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.3rem;
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

/* 卡片底部区域 */
.card-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.card-description {
  color: #333;
  font-size: 0.9rem;
  font-style: italic;
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

.card-rating {
  color: #666;
  font-size: 0.8rem;
  font-weight: 500;
  margin: 0;
  white-space: nowrap;
}


/* 评分系统样式 */
.rating-section {
  margin: 1rem;
  padding: 1rem;
  background: var(--color-background-soft);
  border-radius: 8px;
  text-align: center;
}

.average-rating {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: rgba(122, 139, 122, 0.1);
  border-radius: 8px;
}

.average-text {
  color: var(--text-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.rating-label {
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.star-rating {
  display: flex;
  justify-content: center;
  gap: 0.25rem;
  margin-bottom: 0.5rem;
}

.star {
  font-size: 1.5rem;
  color: var(--border-medium);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.star:hover {
  color: #ffd700;
  transform: scale(1.1);
}

.star.filled {
  color: #ffd700;
}

.star.recommended {
  color: #ff6b6b;
}

.star.recommended.filled {
  color: #ff6b6b;
  text-shadow: 0 0 8px rgba(255, 107, 107, 0.5);
}

.rating-text {
  color: var(--text-primary);
  font-size: 0.8rem;
  font-weight: 600;
  font-style: italic;
}

/* 悬浮卡片样式 */
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
  font-size: 0.9rem;
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

/* 悬浮卡片评分系统 */
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

.floating-admin-rating {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 123, 255, 0.05);
  border: 1px solid rgba(0, 123, 255, 0.2);
  border-radius: 8px;
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

.admin-note {
  color: var(--forest-medium);
  font-size: 0.9rem;
  font-style: italic;
  margin-top: 0.5rem;
  text-align: center;
}

.floating-login-prompt {
  margin-bottom: 1rem;
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

  .filter-container {
    flex-direction: column;
    gap: 0.5rem;
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

  /* 悬浮卡片移动端样式 */
  .floating-card {
    width: 95%;
    max-height: 90vh;
  }

  .floating-card-header {
    padding: 1.5rem;
  }

  .floating-card-icon {
    font-size: 2.5rem;
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
