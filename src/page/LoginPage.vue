<template>
  <div class="auth-page">
    <router-link to="/" class="btn back-home">
      ← Back to Home
    </router-link>
    <LoginForm />
  </div>
</template>

<script>
import LoginForm from '@/components/form/LoginForm.vue'

export default {
  name: 'LoginPage',
  components: {
    LoginForm,
  },
}
</script>
