<template>
  <section class="hero-section">
    <div class="hero-container">
      <div class="hero-content">
        <h1 class="hero-title">You're Not Alone in Your Journey</h1>
        <p class="hero-subtitle">Mental health is essential...</p>
        <button class="btn btn-primary">GET STARTED</button>
      </div>
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
  min-height: 100vh;
}

.hero-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.hero-content {
  text-align: center;
  max-width: 900px;
  width: 100%;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px var(--shadow-dark);
  line-height: 1.2;
}

/* >=768px */
@media (min-width: 768px) {
  .hero-title {
    white-space: nowrap;
  }
}

/* <768px  */
@media (max-width: 767px) {
  .hero-title {
    font-size: 2.8rem;
    white-space: normal;
    line-height: 1.3;
  }

  .hero-container {
    padding: 1rem;
  }
}

.hero-subtitle {
  font-size: 1.5rem;
  margin-bottom: 2rem;
  opacity: 0.9;
  line-height: 1.4;
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
</style>
