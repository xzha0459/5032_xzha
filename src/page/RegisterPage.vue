<!-- src/page/RegisterPage.vue -->
<template>
  <div class="auth-page">
    <router-link to="/" class="btn back-home">
      ← Back to Home
    </router-link>
    <RegisterForm />
  </div>
</template>

<script>
import RegisterForm from '@/components/form/RegisterForm.vue'

export default {
  name: 'RegisterPage',
  components: {
    RegisterForm,
  },
}
</script>
