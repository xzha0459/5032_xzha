<template>
  <div class="mental-health-map">
    <!-- Map Container -->
    <div ref="mapContainer" class="map"></div>

    <!-- Search This Area Button -->
    <button @click="searchCurrentMapArea" class="btn primary search-this-area-btn">
      Search this area
    </button>

  </div>
</template>

<script>
/* eslint-disable no-undef */
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'

export default {
  name: 'MentalHealthMap',
  props: {
    selectedService: {
      type: Object,
      default: null
    }
  },
  emits: ['service-selected', 'location-updated'],
      setup(props, { emit }) {
        const mapContainer = ref(null)
        const map = ref(null)
        const searchQuery = ref('')
        const selectedType = ref('all')
        const filteredServices = ref([])
        const showServicesList = ref(false)
        const currentSelectedService = ref(null)
        const userLocation = ref(null)
        const isLoading = ref(false)
        const error = ref(null)

        // Firebase Functions URLs
        const FIREBASE_FUNCTIONS = {
          searchMentalHealthServices: 'https://searchmentalhealthservices-ha3ghdr32q-uc.a.run.app'
        }

        // Address search is now handled by Firebase Functions

        // Google Maps services (only for directions)
        const directionsService = ref(null)
        const directionsRenderer = ref(null)

    // Service types
    const serviceTypes = [
      { id: 'all', name: 'All Services' },
      { id: 'emergency', name: 'Emergency Services' },
      { id: 'counseling', name: 'Counseling' },
      { id: 'therapy', name: 'Therapy' },
      { id: 'support', name: 'Support Groups' },
      { id: 'youth', name: 'Youth Services' },
      { id: 'education', name: 'Education' }
    ]

    // Initialize Google Maps
    const initMap = () => {
      console.log('Initializing map...')
      console.log('Map container:', mapContainer.value)

      if (!mapContainer.value) {
        console.error('Map container not found')
        return
      }

      // Check if Google Maps API is fully loaded
      if (!window.google || !window.google.maps || !window.google.maps.MapTypeId) {
        console.error('Google Maps API not fully loaded')
        return
      }

      console.log('Creating Google Maps instance...')
      map.value = new google.maps.Map(mapContainer.value, {
        center: { lat: -37.8136, lng: 144.9631 }, // Melbourne coordinates
        zoom: 12,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      })

      console.log('Map created successfully:', map.value)

      // Initialize services (only for directions, not places)
      directionsService.value = new google.maps.DirectionsService()
      directionsRenderer.value = new google.maps.DirectionsRenderer()
      directionsRenderer.value.setMap(map.value)

      // Load initial services
      loadMentalHealthServices()
      getUserLocation()
    }

        // Load mental health services using Firebase Functions
        const loadMentalHealthServices = async (userLat = null, userLng = null, bounds = null) => {
          // Use Melbourne as default location if no coordinates provided
          const searchLat = userLat || -37.8136
          const searchLng = userLng || 144.9631
          isLoading.value = true
          error.value = null

          try {
            // Use Firebase Function to search for mental health services
            const response = await axios.post(FIREBASE_FUNCTIONS.searchMentalHealthServices, {
              keyword: 'mental health services',
              userLat: searchLat,
              userLng: searchLng,
              radius: 3000 // 3km radius
            })

            if (response.data.success) {
              let processedServices = response.data.services

              // If bounds were provided, filter results to only include services within bounds
              if (bounds) {
                processedServices = processedServices.filter(service => {
                  const serviceLatLng = new google.maps.LatLng(service.location.lat, service.location.lng)
                  return bounds.contains(serviceLatLng)
                })
                console.log('Filtered services within bounds:', processedServices.length)
              }

              filteredServices.value = processedServices
              addServiceMarkers(processedServices)

              // Emit services to parent component
              emit('location-updated', processedServices)

              console.log('Loaded mental health services:', processedServices.length)
            } else {
              throw new Error(response.data.error || 'Failed to load services')
            }
          } catch (err) {
            console.error('Error loading services:', err)
            error.value = err.message || 'Failed to load services'
          } finally {
            isLoading.value = false
          }
        }

    // These functions are now handled by Firebase Functions
    // Keeping them for backward compatibility if needed

    // Add service markers to map
    const addServiceMarkers = (services) => {
      // Clear existing markers
      if (window.serviceMarkers) {
        window.serviceMarkers.forEach(marker => marker.setMap(null))
      }
      window.serviceMarkers = []

      // Create a single InfoWindow for all markers
      const infoWindow = new google.maps.InfoWindow()

      services.forEach(service => {
        // Choose icon based on service type with rounded options
        let iconUrl, iconSize

        // Use red for all mental health services
        iconUrl = 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
        iconSize = new google.maps.Size(35, 35)

        const marker = new google.maps.Marker({
          position: { lat: service.location.lat, lng: service.location.lng },
          map: map.value,
          title: service.name,
          icon: {
            url: iconUrl,
            scaledSize: iconSize
          }
        })

        marker.addListener('click', () => {
          // Close any existing info window first
          infoWindow.close()

          // Set new content and open
          infoWindow.setContent(`
            <div class="info-window">
              <h3>${service.name}</h3>
              <p><strong>Category:</strong> ${service.category}</p>
              <p><strong>Address:</strong> ${service.address}</p>
              <p><strong>Rating:</strong> ⭐ ${service.rating}</p>
              <button onclick="openInGoogleMaps('${service.location.lat}', '${service.location.lng}', '${service.name}')" class="navigate-btn">
                View in Google Map
              </button>
            </div>
          `)

          infoWindow.open(map.value, marker)
          // Emit service selection to parent component
          emit('service-selected', service)
        })

        window.serviceMarkers.push(marker)
      })
    }

    // Get user location
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location obtained:', {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy
            })

            userLocation.value = [position.coords.longitude, position.coords.latitude]

            // Add user location marker
            new google.maps.Marker({
              position: { lat: position.coords.latitude, lng: position.coords.longitude },
              map: map.value,
              title: 'Your Location',
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(35, 35)
              }
            })

            // Center map on user location
            map.value.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude })
            map.value.setZoom(13)

            // Reload services based on user location
            console.log('Searching services within 3km radius of user location')
            loadMentalHealthServices(position.coords.latitude, position.coords.longitude)

            console.log('Location set successfully')
          },
          (error) => {
            console.log('Error getting location:', error)
            // If user denies location, use default Melbourne location
            loadMentalHealthServices()
          }
        )
      } else {
        console.log('Geolocation is not supported by this browser')
        // Use default Melbourne location
        loadMentalHealthServices()
      }
    }

    // Handle search
    const handleSearch = async () => {
      const query = searchQuery.value.toLowerCase()
      const type = selectedType.value

      if (query.length < 2) {
        // If no search query, show all services
        filteredServices.value = [...filteredServices.value]
      } else {
        // Filter services by search query
        filteredServices.value = filteredServices.value.filter(service =>
          service.name.toLowerCase().includes(query) ||
          service.address.toLowerCase().includes(query) ||
          service.category.toLowerCase().includes(query) ||
          service.services.some(s => s.toLowerCase().includes(query))
        )
      }

      // Filter by type
      if (type !== 'all') {
        filteredServices.value = filteredServices.value.filter(service => service.type === type)
      }

      addServiceMarkers(filteredServices.value)
      showServicesList.value = filteredServices.value.length > 0
    }

    // Handle type change
    const handleTypeChange = () => {
      handleSearch()
    }

    // Focus on service
    const focusOnService = (service) => {
      map.value.setCenter({ lat: service.location.lat, lng: service.location.lng })
      map.value.setZoom(15)
    }

        // Navigate to service
        const navigateToService = async (service) => {
          currentSelectedService.value = service

          if (userLocation.value) {
            console.log('Navigating to service:', service.name)
            console.log('User location:', userLocation.value)
            console.log('Service location:', [service.location.lng, service.location.lat])

            await calculateRoute(userLocation.value, [service.location.lng, service.location.lat])
          } else {
            alert('Please get your location first by clicking "Get My Location"')
          }
        }

        // Open location in Google Maps
        const openInGoogleMaps = (lat, lng, name) => {
          const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}&query_place_id=${encodeURIComponent(name)}`
          window.open(url, '_blank')
        }

        // Make function globally available for InfoWindow onclick
        window.openInGoogleMaps = openInGoogleMaps

    // Calculate route using Google Directions API
    const calculateRoute = async (start, end) => {
      try {
        console.log('Calculating route from:', start, 'to:', end)

        // Clear any existing route
        directionsRenderer.value.setDirections({ routes: [] })

        directionsService.value.route({
          origin: new google.maps.LatLng(start[1], start[0]),
          destination: new google.maps.LatLng(end[1], end[0]),
          travelMode: google.maps.TravelMode.DRIVING,
          avoidHighways: false,
          avoidTolls: false
        }, (result, status) => {
          console.log('Directions API response status:', status)

          if (status === google.maps.DirectionsStatus.OK) {
            console.log('Route calculated successfully:', result)

            // Set the route on the map
            directionsRenderer.value.setDirections(result)

            const route = result.routes[0]
            const leg = route.legs[0]

            console.log('Route calculated successfully')

            console.log('Route details:', {
              distance: leg.distance.text,
              duration: leg.duration.text,
              steps: leg.steps.length
            })
          } else {
            console.error('Directions request failed:', status)
            let errorMessage = 'Failed to calculate route'

            switch (status) {
              case google.maps.DirectionsStatus.NOT_FOUND:
                errorMessage = 'Destination not found'
                break
              case google.maps.DirectionsStatus.ZERO_RESULTS:
                errorMessage = 'No route found between locations'
                break
              case google.maps.DirectionsStatus.REQUEST_DENIED:
                errorMessage = 'Directions request denied'
                break
              case google.maps.DirectionsStatus.OVER_QUERY_LIMIT:
                errorMessage = 'Too many requests - please try again later'
                break
            }

            error.value = errorMessage
          }
        })
      } catch (error) {
        console.error('Error calculating route:', error)
        error.value = error.message || 'Failed to calculate route'
      }
    }

    // Address search is now handled by Firebase Functions


    // Request user location manually
    const requestLocation = () => {
      console.log('Manual location request triggered')
      // Clear existing markers first
      if (window.serviceMarkers) {
        window.serviceMarkers.forEach(marker => marker.setMap(null))
        window.serviceMarkers = []
      }

      // Clear search marker
      if (window.searchMarker) {
        window.searchMarker.setMap(null)
        window.searchMarker = null
      }

      getUserLocation()
    }

    // Address detection is now handled by Firebase Functions

    // Search services by keyword using Firebase Functions
    const searchServicesByKeyword = async (keyword) => {
      if (!keyword) return

      isLoading.value = true
      error.value = null

      try {
        console.log('Searching for keyword:', keyword)

        // Clear existing markers
        if (window.serviceMarkers) {
          window.serviceMarkers.forEach(marker => marker.setMap(null))
          window.serviceMarkers = []
        }

        // Clear previous search marker if it exists
        if (window.searchMarker) {
          window.searchMarker.setMap(null)
          window.searchMarker = null
        }

        // Use user location for search (Firebase Function handles address detection)
        const searchLat = userLocation.value ? userLocation.value[1] : -37.8136
        const searchLng = userLocation.value ? userLocation.value[0] : 144.9631

        console.log(`Searching for "${keyword}" within 3km of location: ${searchLat}, ${searchLng}`)

        // Use Firebase Function to search for mental health services
        const response = await axios.post(FIREBASE_FUNCTIONS.searchMentalHealthServices, {
          keyword: keyword,
          userLat: searchLat,
          userLng: searchLng,
          radius: 3000
        })

        if (response.data.success) {
          const processedServices = response.data.services
          filteredServices.value = processedServices
          addServiceMarkers(processedServices)

          // Handle search location marker if provided by Firebase Function
          if (response.data.searchLocation) {
            const searchLocation = response.data.searchLocation
            const searchMarker = new google.maps.Marker({
              position: { lat: searchLocation.lat, lng: searchLocation.lng },
              map: map.value,
              title: `Searched: ${searchLocation.address}`,
              icon: {
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                scaledSize: new google.maps.Size(45, 45)
              }
            })

            const searchInfoWindow = new google.maps.InfoWindow({
              content: `
                <div class="info-window">
                  <h3>📍 Search Location</h3>
                  <p><strong>Address:</strong> ${searchLocation.address}</p>
                  <p>Searching for mental health services within 3km of this location...</p>
                </div>
              `
            })

            searchMarker.addListener('click', () => {
              searchInfoWindow.open(map.value, searchMarker)
            })

            window.searchMarker = searchMarker

            // Center map on the search location
            map.value.setCenter({ lat: searchLocation.lat, lng: searchLocation.lng })
            map.value.setZoom(15)
          }

          // Emit services to parent component
          emit('location-updated', processedServices)

          console.log('Search results:', processedServices.length)
        } else {
          throw new Error(response.data.error || 'Failed to search services')
        }

      } catch (err) {
        console.error('Error searching services:', err)
        error.value = err.message || 'Failed to search services'
      } finally {
        isLoading.value = false
      }
    }

    // Search current map area using Firebase Functions
    const searchCurrentMapArea = async () => {
      if (map.value) {
        const currentBounds = map.value.getBounds()
        if (currentBounds) {
          const ne = currentBounds.getNorthEast()
          const sw = currentBounds.getSouthWest()

          console.log('Searching current map area with bounds:', {
            north: ne.lat(),
            south: sw.lat(),
            east: ne.lng(),
            west: sw.lng()
          })

          // Clear existing markers before loading new ones
          if (window.serviceMarkers) {
            window.serviceMarkers.forEach(marker => marker.setMap(null))
            window.serviceMarkers = []
          }

          // Clear search marker
          if (window.searchMarker) {
            window.searchMarker.setMap(null)
            window.searchMarker = null
          }

          // Use Firebase Function to search current map area with bounds
          try {
            const response = await axios.post(FIREBASE_FUNCTIONS.searchMentalHealthServices, {
              keyword: 'mental health services',
              bounds: {
                north: ne.lat(),
                south: sw.lat(),
                east: ne.lng(),
                west: sw.lng()
              }
            })

            if (response.data.success) {
              const processedServices = response.data.services
              filteredServices.value = processedServices
              addServiceMarkers(processedServices)
              emit('location-updated', processedServices)

              console.log('Map area search results:', processedServices.length)
            }
          } catch (error) {
            console.error('Error searching map area:', error)
          }
        } else {
          console.warn('Map bounds not available yet.')
          alert('Map is still loading. Please wait a moment and try again.')
        }
      }
    }

    // Load Google Maps API dynamically
    const loadGoogleMapsAPI = () => {
      return new Promise((resolve, reject) => {
        if (window.google && window.google.maps && window.google.maps.MapTypeId) {
          resolve()
          return
        }

        // Get API key from environment variable
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
        if (!apiKey) {
          reject(new Error('Google Maps API Key not found in environment variables'))
          return
        }

        console.log('Loading Google Maps API with key:', apiKey.substring(0, 10) + '...')

        // Create a callback function name
        const callbackName = 'initGoogleMapsCallback'
        window[callbackName] = () => {
          delete window[callbackName]
          resolve()
        }

        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&loading=async`
        script.onerror = () => {
          delete window[callbackName]
          reject(new Error('Failed to load Google Maps API'))
        }
        document.head.appendChild(script)
      })
    }

    onMounted(async () => {
      console.log('MentalHealthMap component mounted')
      await nextTick()
      console.log('After nextTick, mapContainer:', mapContainer.value)

      try {
        console.log('Loading Google Maps API...')
        await loadGoogleMapsAPI()
        console.log('Google Maps API loaded, initializing map...')
        initMap()
      } catch (error) {
        console.error('Failed to load Google Maps API:', error)
        error.value = 'Failed to load Google Maps API'
      }
    })

    onUnmounted(() => {
      // Clean up markers
      if (window.serviceMarkers) {
        window.serviceMarkers.forEach(marker => marker.setMap(null))
      }

      // Clean up search marker
      if (window.searchMarker) {
        window.searchMarker.setMap(null)
        window.searchMarker = null
      }
    })

    return {
      mapContainer,
      searchQuery,
      selectedType,
      filteredServices,
      showServicesList,
      currentSelectedService,
      serviceTypes,
      isLoading,
      error,
      handleSearch,
      handleTypeChange,
      focusOnService,
      navigateToService,
      openInGoogleMaps,
      requestLocation,
      searchCurrentMapArea,
      searchServicesByKeyword
    }
  }
}
</script>

<style scoped>
.mental-health-map {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 90vh;
}

.map {
  width: 100%;
  height: 100%;
  min-height: 90vh;
  position: relative;
}

.search-this-area-btn {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
}

/* Responsive Design for Map */
@media (max-width: 768px) {
  .search-this-area-btn {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 0.6rem 1.2rem;
    font-size: 0.8rem;
    width: auto;
    min-width: 140px;
  }
}

@media (max-width: 480px) {
  .search-this-area-btn {
    bottom: 15px;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    min-width: 120px;
  }
}

/* Landscape orientation adjustments */
@media (max-width: 768px) and (orientation: landscape) {
  .search-this-area-btn {
    bottom: 15px;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }
}

/* InfoWindow responsive styles */
:deep(.info-window) {
  max-width: 250px;
  font-size: 0.9rem;
}

:deep(.info-window h3) {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

:deep(.info-window p) {
  font-size: 0.8rem;
  margin-bottom: 0.3rem;
}

:deep(.navigate-btn) {
  background: var(--forest-dark);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  margin-top: 0.5rem;
  width: 100%;
}

:deep(.navigate-btn:hover) {
  background: var(--forest-deep);
}

@media (max-width: 480px) {
  :deep(.info-window) {
    max-width: 200px;
    font-size: 0.8rem;
  }

  :deep(.info-window h3) {
    font-size: 0.9rem;
  }

  :deep(.info-window p) {
    font-size: 0.75rem;
  }

  :deep(.navigate-btn) {
    padding: 0.4rem 0.8rem;
    font-size: 0.75rem;
  }
}
</style>
