<template>
  <div class="skill-display-section">

      <!-- 搜索栏 -->
      <div class="search-section mb-4">
        <div class="search-container">
          <div class="search-input-wrapper">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Search skills, keywords..." 
              class="search-input"
              @input="handleSearch"
            />
            <div class="search-icon">🔍</div>
          </div>
        </div>
      </div>

      <!-- 分类筛选器 -->
      <div class="category-filter-section mb-4">
        <div class="filter-container">
          <label for="categoryFilter" class="filter-label">Filter Category:</label>
          <select 
            id="categoryFilter"
            v-model="selectedMainCategory" 
            @change="handleCategoryChange"
            class="category-select"
          >
            <option value="all">All Skills</option>
            <option 
              v-for="category in mainCategories" 
              :key="category.id"
              :value="category.id"
            >
              {{ category.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- 技巧列表 -->
      <div class="techniques-section">
        <div class="techniques-header mb-3">
          <h3 class="section-title">
            {{ getCurrentCategoryTitle() }}
            <span class="technique-count">({{ filteredTechniques.length }} skills)</span>
          </h3>
        </div>

        <!-- 技巧网格 -->
        <div class="techniques-grid" v-if="filteredTechniques.length > 0">
          <div 
            v-for="technique in filteredTechniques" 
            :key="technique.id"
            class="technique-card"
          >
            <div class="card-header">
              <div class="card-icon">{{ technique.icon }}</div>
              <h2 class="card-title">{{ technique.title }}</h2>
              <div class="card-tags">
                <span 
                  v-for="tag in technique.tags" 
                  :key="tag"
                  class="technique-tag"
                >
                  {{ tag }}
                </span>
              </div>
            </div>
            <div class="card-content">
              <p class="technique-description">{{ technique.description }}</p>
              <ul class="technique-list">
                <li v-for="tip in technique.tips" :key="tip.title">
                  <strong>{{ tip.title }}：</strong>
                  {{ tip.description }}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 无结果提示 -->
        <div class="no-results" v-else>
          <div class="no-results-icon">🔍</div>
          <h3>No techniques found</h3>
          <p>Try adjusting your search keywords or select a different category</p>
        </div>
      </div>
  </div>
</template>

<script>
import { mainCategories, techniques } from '@/data/emotionTechniques.js'

export default {
  name: 'SkillDisplaySection',
  data() {
    return {
      searchQuery: '',
      selectedMainCategory: 'all',
      mainCategories,
      techniques
    }
  },

  computed: {
    // 过滤后的技巧
    filteredTechniques() {
      let filtered = this.techniques

      // 分类筛选
      if (this.selectedMainCategory !== 'all') {
        filtered = filtered.filter(technique => 
          technique.category === this.selectedMainCategory
        )
      }

      // 搜索筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(technique => 
          technique.title.toLowerCase().includes(query) ||
          technique.description.toLowerCase().includes(query) ||
          technique.tags.some(tag => tag.toLowerCase().includes(query)) ||
          technique.tips.some(tip => 
            tip.title.toLowerCase().includes(query) ||
            tip.description.toLowerCase().includes(query)
          )
        )
      }

      return filtered
    }
  },

  methods: {
    // 处理分类变化
    handleCategoryChange() {
      // 分类变化逻辑在computed中处理
    },

    // 处理搜索
    handleSearch() {
      // 搜索逻辑在computed中处理
    },

    // 获取当前分类标题
    getCurrentCategoryTitle() {
      if (this.selectedMainCategory === 'all') {
        return 'All Emotion Management Skills'
      }
      const category = this.mainCategories.find(cat => cat.id === this.selectedMainCategory)
      return category ? category.name : 'Emotion Management Skills'
    }
  }
}
</script>

<style scoped>
.skill-display-section {
  width: 100%;
}



/* 搜索栏样式 */
.search-section {
  margin-bottom: 2rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
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
  font-size: 1.2rem;
  color: var(--forest-medium);
}

/* 分类筛选器样式 */
.category-filter-section {
  margin-bottom: 2rem;
}

.filter-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.category-select {
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

.category-select:focus {
  outline: none;
  border-color: var(--forest-accent);
  box-shadow: 0 0 0 3px rgba(122, 139, 122, 0.1);
}

/* 技巧区域样式 */
.techniques-section {
  margin-bottom: 3rem;
}

.techniques-header {
  text-align: center;
}

.section-title {
  color: var(--color-heading);
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.technique-count {
  color: var(--forest-medium);
  font-size: 1rem;
  font-weight: 400;
}

.techniques-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.technique-card {
  background: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 4px 6px var(--shadow-light);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.technique-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px var(--shadow-medium);
}

.card-header {
  background: var(--forest-accent);
  padding: 1.5rem;
  text-align: center;
  color: white;
  position: relative;
}

.card-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.technique-tag {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 15px;
  font-size: 0.8rem;
  font-weight: 500;
}

.card-content {
  padding: 1.5rem;
}

.technique-description {
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  font-style: italic;
}

.technique-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.technique-list li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-light);
  line-height: 1.6;
}

.technique-list li:last-child {
  border-bottom: none;
}

.technique-list strong {
  color: var(--forest-deep);
  font-weight: 600;
}

/* 无结果样式 */
.no-results {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-secondary);
}

.no-results-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.no-results h3 {
  color: var(--text-primary);
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.no-results p {
  font-size: 1rem;
  opacity: 0.8;
}


/* 响应式设计 */
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
  
  .techniques-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .technique-card {
    margin: 0 0.5rem;
  }
  
  .card-header {
    padding: 1rem;
  }

  .card-title {
    font-size: 1.3rem;
  }

  .card-tags {
    gap: 0.25rem;
  }

  .technique-tag {
    padding: 0.2rem 0.5rem;
    font-size: 0.7rem;
  }
  
  .card-content {
    padding: 1rem;
  }

  .technique-description {
    font-size: 0.9rem;
  }
  

  .section-title {
    font-size: 1.5rem;
  }

  .no-results {
    padding: 3rem 1rem;
  }

  .no-results-icon {
    font-size: 3rem;
  }
}
</style>
