<template>
  <div class="map-page">
    <!-- Left Panel - Places List -->
    <div class="places-panel">
      <div class="card">
        <h1 class="card-title">Places</h1>
        <div class="search-controls">
          <div class="search-input-group">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search mental health services..."
              class="search"
              @keyup.enter="handleSearch"
            />
            <button @click="handleSearch" class="btn action search-btn">
              Search
            </button>
          </div>
          <button @click="requestLocation" class="btn secondary">
            Get My Location
          </button>
        </div>
      </div>

      <!-- Selected Service Details -->
      <div v-if="selectedService" class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Selected Service</h3>
          <button @click="selectedService = null" class="close-button">×</button>
        </div>
        <div class="modal-body">
          <h4 class="modal-description">{{ selectedService.name }}</h4>
          <ul class="modal-list">
            <li><strong>Category:</strong> {{ selectedService.category }}</li>
            <li><strong>Address:</strong> {{ selectedService.address }}</li>
            <li v-if="selectedService.distance !== undefined"><strong>Distance:</strong> {{ selectedService.distance.toFixed(1) }} km</li>
            <li><strong>Rating:</strong> ⭐ {{ selectedService.rating }}</li>
          </ul>
        </div>
        <div class="modal-footer">
          <button @click="navigateToService(selectedService)" class="btn primary">
            → Get Directions
          </button>
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
              <button class="btn primary" @click.stop="navigateToService(service)">
                → Directions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import { ref, onMounted, nextTick } from 'vue'
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
      handleSearch,
      requestLocation,
      selectService,
      navigateToService,
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
  width: 35%;
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

.search-input-group .search {
  flex: 1;
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

/* Selected Service Details - using global card styles */
.modal {
  padding: 1rem;
}

.modal-list li {
  padding: 0.5rem 0;
}


/* Right Panel - Map */
.map-panel {
  flex: 1;
  background: #ffffff;
  position: relative;
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-page {
    flex-direction: column;
  }

  .places-panel {
    width: 100%;
    height: 40%;
    min-width: unset;
  }

  .map-panel {
    height: 60%;
  }

  .places-title {
    font-size: 20px;
  }

}

@media (max-width: 480px) {
  .places-panel {
    height: 35%;
  }

  .map-panel {
    height: 65%;
  }

  .places-header {
    padding: 15px;
  }

}
</style>
