<template>
  <div class="emotion-management-page">
    <div class="page-header">
      <div class="container">
        <h1 class="page-title">Mental Health Resource Center</h1>
        <p class="page-subtitle">
          Discover professional skills, helpful articles, and practical tools to enhance your mental wellness</p>
      </div>
    </div>

    <div class="page-content">
      <div class="container">
        <SkillDisplaySection />
      </div>
    </div>
  </div>
</template>

<script>
import SkillDisplaySection from '@/section/EmotionManagementPage/StrategyDisplaySection.vue'

export default {
  name: 'EmotionManagementPage',
  components: {
    SkillDisplaySection
  }
}
</script>

<style scoped>
.emotion-management-page {
  min-height: 100vh;
  background-color: var(--forest-light);
}

.page-header {
  background: var(--forest-medium);
  color: var(--text-light);
  padding: 4rem 0;
  text-align: center;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px var(--shadow-dark);
}

.page-subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 700px;
  margin: 0 auto;
}

.page-content {
  padding: 4rem 0;
}

.container {
  max-width: 100%;
  margin: 0 auto;
  padding: 0 8rem;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2.5rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
  }

  .container {
    padding: 0 1rem;
  }
}
</style>
