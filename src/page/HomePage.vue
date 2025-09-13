<template>
  <div class="home-page">
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
