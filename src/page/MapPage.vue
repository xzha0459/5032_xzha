<template>
  <div class="map-page">
    <!-- Left Panel - Places List -->
    <div class="places-panel">
      <div class="card">
        <h1 class="card-title">Places</h1>
        <div class="search-controls">
          <div class="search-input-group">
            <div class="search-input-wrapper">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search mental health services..."
                class="search"
                @keyup.enter="handleSearch"
              />
              <button @click="requestLocation" class="location-icon-btn" title="Get My Location">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <button @click="handleSearch" class="btn action search-btn">
              Search
            </button>
          </div>
        </div>
      </div>


      <!-- Services List -->
      <div class="services-list">
        <div v-if="isLoading" class="loading-state">
          <div class="spinner"></div>
          <span>Loading services...</span>
        </div>

        <div v-else-if="filteredServices.length === 0" class="no-results">
          <p>No services found. Try adjusting your search.</p>
        </div>

        <div v-else class="services-content">
          <div
            v-for="service in filteredServices"
            :key="service.id"
            class="card"
            :class="{ active: selectedService?.id === service.id }"
            :data-service-id="service.id"
            @click="selectService(service)"
          >
            <div class="card-header">
              <h3 class="card-title">{{ service.name }}</h3>
              <span class="card-rating">⭐ {{ service.rating }} ({{ Math.floor(Math.random() * 100) + 1 }} reviews)</span>
            </div>
            <div class="card-body">
              <p><strong>{{ service.category }}</strong></p>
              <p>{{ service.address }}</p>
              <p v-if="service.distance !== undefined" class="distance">
                📍 {{ service.distance.toFixed(1) }} km
              </p>
            </div>
            <div class="card-footer">
              <button class="btn secondary" @click.stop="navigateToService(service)">Directions</button>
              <button class="btn secondary" @click.stop="viewInGoogleMaps(service)">Google Maps</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resizer -->
    <div class="resizer" @mousedown="startResize"></div>

    <!-- Right Panel - Map -->
    <div class="map-panel">
      <MentalHealthMap
        ref="mapComponent"
        :selected-service="selectedService"
        @service-selected="onServiceSelected"
        @location-updated="onLocationUpdated"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, nextTick, computed } from 'vue'
import MentalHealthMap from '@/components/map/MentalHealthMap.vue'

export default {
  name: 'MapPage',
  components: {
    MentalHealthMap
  },
  setup() {
    const mapComponent = ref(null)
    const searchQuery = ref('')
    const selectedService = ref(null)
    const filteredServices = ref([])
    const isLoading = ref(false)

    // Resize functionality
    const isResizing = ref(false)
    const placesPanelWidth = ref(35) // Default width percentage

    // Check if device is mobile
    const isMobile = computed(() => {
      return window.innerWidth <= 768
    })

    // Handle search
    const handleSearch = () => {
      if (mapComponent.value && searchQuery.value.trim()) {
        mapComponent.value.searchServicesByKeyword(searchQuery.value.trim())
      }
    }

    // Request location
    const requestLocation = () => {
      if (mapComponent.value) {
        mapComponent.value.requestLocation()
      }
    }

    // Select service
    const selectService = (service) => {
      selectedService.value = service
      if (mapComponent.value) {
        mapComponent.value.focusOnService(service)
      }
    }

    // Navigate to service
    const navigateToService = (service) => {
      if (mapComponent.value) {
        mapComponent.value.navigateToService(service)
      }
    }

    // View service in Google Maps
    const viewInGoogleMaps = (service) => {
      if (service && service.location) {
        const { lat, lng } = service.location
        const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`
        window.open(googleMapsUrl, '_blank')
      }
    }

    // Resize functionality
    const startResize = () => {
      if (isMobile.value) return // Don't allow resize on mobile

      isResizing.value = true
      document.addEventListener('mousemove', handleResize)
      document.addEventListener('mouseup', stopResize)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    const handleResize = (e) => {
      if (!isResizing.value) return

      const containerWidth = window.innerWidth
      const newWidth = (e.clientX / containerWidth) * 100

      // Constrain width between 20% and 70%
      const constrainedWidth = Math.max(20, Math.min(70, newWidth))
      placesPanelWidth.value = constrainedWidth
    }

    const stopResize = () => {
      isResizing.value = false
      document.removeEventListener('mousemove', handleResize)
      document.removeEventListener('mouseup', stopResize)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    // Handle service selection from map
    const onServiceSelected = (service) => {
      console.log('Service selected from map:', service)
      selectedService.value = service

      // Scroll to the selected service in the list
      nextTick(() => {
        const element = document.querySelector(`[data-service-id="${service.id}"]`)
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          })
        }
      })
    }

    // Handle location update
    const onLocationUpdated = (services) => {
      filteredServices.value = services
    }

    // Get services from map component
    const updateServices = () => {
      if (mapComponent.value && mapComponent.value.filteredServices) {
        filteredServices.value = mapComponent.value.filteredServices
      }
    }

    onMounted(() => {
      // Update services periodically
      setInterval(updateServices, 1000)
    })

    return {
      mapComponent,
      searchQuery,
      selectedService,
      filteredServices,
      isLoading,
      isMobile,
      placesPanelWidth,
      isResizing,
      handleSearch,
      requestLocation,
      selectService,
      navigateToService,
      viewInGoogleMaps,
      startResize,
      onServiceSelected,
      onLocationUpdated
    }
  }
}
</script>

<style scoped>
.map-page {
  display: flex;
  min-height: 90vh;
  background: #ffffff;
  color: #333333;
}

/* Left Panel - Places */
.places-panel {
  width: v-bind(placesPanelWidth + '%');
  max-height: 90vh;
  background: var(--bg-card);
  border-right: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-input-wrapper {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
}

.search-input-wrapper .search {
  width: 100%;
  padding-right: 40px;
}

.location-icon-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  z-index: 10;
  color: var(--forest-medium);
  display: flex;
  align-items: center;
  justify-content: center;
}

.location-icon-btn:hover {
  color: var(--forest-dark);
}

.location-icon-btn svg {
  width: 20px;
  height: 20px;
}

.search-btn {
  padding: 0.6rem;
  min-width: 40px;
  border-radius: 4px;
}


/* Services List */
.services-list {
  flex: 1;
  overflow-y: auto;
  background: #ffffff;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  gap: 10px;
  color: #6b7280;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #10b981;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-results {
  padding: 40px;
  text-align: center;
  color: #6b7280;
}

.services-content {
  padding: 0;
  display: flex;
  flex-direction: column;
}

/* Custom card styles - no border, only bottom border */
.card {
  padding: 1.5rem;
  border: none;
  border-bottom: 1px solid var(--border-light);
  box-shadow: none;
  border-radius: 0;
  margin-bottom: 0;
}

.card:hover {
  background: var(--forest-light);
}

.card:last-child {
  border-bottom: none;
}

.card.active {
  border-bottom: 2px solid var(--forest-deep);
  background: var(--forest-light);
}



/* Resizer */
.resizer {
  width: 2px;
  background: var(--border-light);
  cursor: col-resize;
  transition: background-color 0.2s ease;
  position: relative;
  z-index: 10;
}

.resizer:hover {
  background: var(--forest-medium);
}

.resizer:active {
  background: var(--forest-dark);
}

/* Right Panel - Map */
.map-panel {
  flex: 1;
  background: #ffffff;
  position: relative;
  height: 100%;
  min-height: 60vh;
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-page {
    flex-direction: column;
    min-height: 100vh;
  }

  .places-panel {
    width: 100%;
    height: 50vh;
    max-height: 50vh;
    min-height: 50vh;
    border-right: none;
    border-bottom: 1px solid var(--border-light);
    overflow-y: auto;
  }

  .map-panel {
    height: 50vh;
    min-height: 50vh;
  }

  .search-controls {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-input-group {
    flex-direction: row;
    gap: 0.5rem;
  }

  .search-input-wrapper {
    flex: 1;
  }

  .search-input-wrapper .search {
    padding-right: 40px; /* 保持图标空间 */
  }

  .search-btn {
    width: auto;
    min-width: 80px;
  }

  .services-list {
    max-height: calc(50vh - 100px);
  }

  .card {
    padding: 0.8rem;
  }

  .resizer {
    display: none;
  }
}

@media (max-width: 480px) {
  .map-page {
    min-height: 100vh;
  }

  .places-panel {
    height: 50vh;
    max-height: 50vh;
    min-height: 50vh;
    overflow-y: auto;
  }

  .map-panel {
    height: 50vh;
    min-height: 50vh;
  }

  .search-controls {
    padding: 0.5rem;
  }

  .search-input-group {
    gap: 0.3rem;
  }

  .search-input-wrapper {
    flex: 1;
  }

  .search-input-wrapper .search {
    font-size: 0.9rem;
    padding: 0.6rem;
    padding-right: 40px; /* 保持图标空间 */
  }

  .search-btn {
    width: auto;
    min-width: 70px;
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }

  .location-icon-btn svg {
    width: 18px;
    height: 18px;
  }

  .services-list {
    max-height: calc(50vh - 100px);
  }

  .card {
    padding: 0.6rem;
    margin: 0.3rem;
  }

  .card-body p {
    font-size: 0.8rem;
  }
}

/* Landscape orientation on mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .places-panel {
    height: auto;
    max-height: 50vh;
    min-height: auto;
    overflow-y: auto;
  }

  .map-panel {
    height: 50vh;
    min-height: 50vh;
  }

  .services-list {
    max-height: calc(50vh - 100px);
  }
}
</style>
