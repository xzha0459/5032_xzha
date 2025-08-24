<!-- src/page/RegisterPage.vue -->
<template>
  <div class="register-page">
    <div class="back-link">
      <router-link to="/" class="back-home">← Back to Home</router-link>
    </div>
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

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    var(--forest-light) 0%,
    var(--forest-sage) 50%,
    var(--forest-muted) 100%
  );
  padding: 2rem 0;
}

.back-link {
  text-align: center;
  margin-bottom: 1rem;
}

.back-home {
  color: var(--forest-dark);
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  background: var(--forest-light);
  border: 1px solid var(--border-light);
}

.back-home:hover {
  background: var(--forest-sage);
  color: var(--forest-deep);
  text-decoration: none;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-light);
}
</style>
