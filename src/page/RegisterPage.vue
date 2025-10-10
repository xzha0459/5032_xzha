<!-- src/page/RegisterPage.vue -->
<template>
  <div class="register-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-12 col-8">
          <div class="text-center mb-4">
            <router-link to="/" class="back-home">
              ← Back to Home
            </router-link>
          </div>
          <RegisterForm />
        </div>
      </div>
    </div>
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
  padding: 1rem 0;
}

.back-home {
  color: var(--forest-dark);
  text-decoration: none;
  font-weight: 600;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
  transition: all 0.3s ease;
  background: var(--forest-light);
  border: 1px solid var(--border-light);
  display: inline-block;
  font-size: 0.9rem;
}

.back-home:hover {
  background: var(--forest-sage);
  color: var(--forest-deep);
  text-decoration: none;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px var(--shadow-light);
}
</style>
