<script setup>
import NavigationBar from '@/components/NavigationBar.vue'
import Chatbot from '@/components/Chatbot.vue'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

// 在注册页面和登录页面时不显示导航栏
const showNavigationBar = computed(() => {
  return route.name !== 'Register' && route.name !== 'Login'
})

// 在注册页面和登录页面时不显示聊天机器人
const showChatbot = computed(() => {
  return route.name !== 'Register' && route.name !== 'Login'
})
</script>

<template>
  <div id="app">
    <!-- Skip Link for pages without navigation -->
    <a v-if="!showNavigationBar" href="#main-content" class="skip-link" tabindex="1">Skip to main content</a>

    <!-- 导航栏条件显示 -->
    <NavigationBar v-if="showNavigationBar" />

    <!-- Router View - 显示当前路由的页面 -->
    <main id="main-content" role="main">
      <router-view />
    </main>

    <!-- 聊天机器人 - 全局可用 -->
    <Chatbot v-if="showChatbot" />
  </div>
</template>

<style scoped>
#app {
  width: 100%;
  min-height: 100vh;
}

/* Main content landmark */
main {
  outline: none;
}
</style>
