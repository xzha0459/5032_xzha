<script setup>
import NavigationBar from '@/components/NavigationBar.vue'
</script>

<template>
  <div id="app">
    <!-- 导航栏始终显示 -->
    <NavigationBar />

    <!-- Router View - 显示当前路由的页面 -->
    <router-view />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}
</style>
