<template>
  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Mental Health Resource Center</h1>
      <p class="page-subtitle">
        Discover professional skills, helpful articles, and practical tools to enhance your mental wellness</p>
    </div>

    <div class="page-content">
      <SkillDisplaySection />
    </div>
  </div>
</template>

<script>
import SkillDisplaySection from '@/section/EmotionManagementPage/StrategyDisplaySection.vue'

export default {
  name: 'WellbeingPage',
  components: {
    SkillDisplaySection
  }
}
</script>

<style scoped>

</style>
