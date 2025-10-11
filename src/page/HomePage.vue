<template>
  <div class="page">
    <HeroSection />
  </div>
</template>

<script>
import HomeHeroSection from "@/section/HomePage/HomeHeroSection.vue";

export default {
  name: 'HomePage',
  components: {
    HeroSection: HomeHeroSection,
  }
}
</script>

<style scoped>

</style>
