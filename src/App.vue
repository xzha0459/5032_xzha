<script setup>
import NavigationBar from '@/components/NavigationBar.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 在注册页面和登录页面时不显示导航栏
const showNavigationBar = computed(() => {
  return route.name !== 'Register' && route.name !== 'Login'
})
</script>

<template>
  <div id="app">
    <!-- 导航栏条件显示 -->
    <NavigationBar v-if="showNavigationBar" />

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
