<template>
  <section class="hero-section">
    <div class="hero-content">
      <h1>You're Not Alone in Your Journey</h1>
      <p>Mental health is essential...</p>
      <button class="btn btn-primary">Get Started</button>
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
  min-height: 100vh;
  color: var(--text-light);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  padding: 2rem;
}

.hero-content h1 {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px var(--shadow-dark);
}

.hero-content p {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.btn {
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-primary {
  background: var(--forest-dark);
  color: var(--text-light);
  box-shadow: 0 4px 15px var(--shadow-medium);
}

.btn-primary:hover {
  background: var(--forest-deep);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--shadow-dark);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-content p {
    font-size: 1.2rem;
  }

  .btn {
    padding: 0.8rem 2rem;
    font-size: 1rem;
  }
}
</style>
