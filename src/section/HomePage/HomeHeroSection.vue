<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1 class="hero-title">You're Not Alone in Your Journey</h1>
      <p class="hero-subtitle">Pay attention to mental health is essential...</p>
      <button class="btn primary">GET STARTED</button>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  background: linear-gradient(
    135deg,
    var(--forest-light) 0%,
    var(--forest-sage) 25%,
    var(--forest-medium) 50%,
    var(--forest-deep) 75%,
    var(--forest-dark) 100%
  );
  color: var(--text-light);
  margin: 0;
  padding: 0;
}

.hero-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 90vh;
  padding: 1.5rem;
  text-align: center;
  max-width: 700px;
  width: 100%;
  margin: 0 auto;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px var(--shadow-dark);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  opacity: 0.9;
  line-height: 1.4;
}
</style>
