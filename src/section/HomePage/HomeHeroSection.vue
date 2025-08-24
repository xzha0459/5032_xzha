<template>
  <section class="hero-section">
    <div class="container">
      <div class="row justify-content-center align-items-center min-vh-100">
        <div class="col-12 col-6">
          <div class="hero-content text-center">
            <h1 class="mb-4">You're Not Alone in Your Journey</h1>
            <p class="lead mb-4">Mental health is essential...</p>
            <button class="btn btn-primary">Get Started</button>
          </div>
        </div>
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
</style>
