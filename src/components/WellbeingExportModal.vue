<template>
  <div>
    <!-- Export Button -->
    <button class="btn primary" @click="openExportModal" ref="exportOpenBtn">
      Export CSV
    </button>

    <!-- Export Modal -->
    <div v-if="showModal" class="modal-overlay" role="presentation" @click="closeExportModal">
      <div class="modal" @click.stop ref="exportModal"
           role="dialog" aria-modal="true" aria-labelledby="export-modal-title"
           @keydown="handleExportModalKeydown">
        <div class="modal-header">
          <h2 class="modal-title" id="export-modal-title">Export Wellbeing Strategies</h2>
          <button class="close-button" ref="exportCloseBtn" @click="closeExportModal" aria-label="Close modal">×</button>
        </div>

        <div class="modal-body">
          <form @submit.prevent="handleExport">
            <div class="modal-group">
              <label class="modal-description" for="category-filter">Category Filter</label>
              <select
                id="category-filter"
                v-model="exportOptions.category"
                class="filter"
              >
                <option value="all">All Categories</option>
                <option
                  v-for="category in uniqueCategories"
                  :key="category"
                  :value="category"
                >
                  {{ category }}
                </option>
              </select>
            </div>

            <div class="modal-body">
              <label class="modal-description">Export Options</label>
              <div class="modal-group">
                <input
                  id="include-ratings"
                  type="checkbox"
                  v-model="exportOptions.includeRatings"
                  class="checkbox"
                />
                <label for="include-ratings">
                  <p>Include Ratings (Average rating & total count)</p>
                </label>
              </div>
            </div>

            <div class="modal-body">
              <label class="modal-description" id="preview-label">Preview</label>
              <div role="region" aria-labelledby="preview-label">
                <p><strong>Total Strategies:</strong> {{ filteredStrategiesCount }}</p>
                <p><strong>Selected Category:</strong> {{ selectedCategoryName }}</p>
                <p><strong>File Name:</strong> {{ generatedFilename }}</p>
              </div>
            </div>

            <button type="submit" :disabled="isExporting" class="btn submit">
              {{ isExporting ? 'Exporting...' : 'Export CSV' }}
            </button>

            <div v-if="messageType === 'success'" id="success-message" class="alert alert-success" role="alert" aria-live="polite">
              {{ message }}
            </div>
            <div v-if="messageType === 'error'" id="error-message" class="alert alert-error" role="alert" aria-live="assertive">
              {{ message }}
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, computed, nextTick } from 'vue'
import { exportStrategiesToCSV, generateFilename } from '@/utils/csvExport.js'

export default {
  name: 'WellbeingExportModal',
  props: {
    strategies: {
      type: Array,
      required: true,
      default: () => []
    },
    aggregateRatings: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  setup(props) {
    const showModal = ref(false)
    const exportModal = ref(null)
    const exportCloseBtn = ref(null)
    const exportOpenBtn = ref(null)
    let lastFocusedBeforeExportModal = null

    const isExporting = ref(false)
    const message = ref('')
    const messageType = ref('') // 'success' or 'error'

    const exportOptions = reactive({
      category: 'all',
      includeRatings: true
    })

    const openExportModal = () => {
      lastFocusedBeforeExportModal = document.activeElement
      showModal.value = true
      nextTick(() => {
        if (exportCloseBtn.value && exportCloseBtn.value.focus) exportCloseBtn.value.focus()
      })
    }

    const closeExportModal = () => {
      showModal.value = false
      message.value = ''
      messageType.value = ''
      if (lastFocusedBeforeExportModal && lastFocusedBeforeExportModal.focus) {
        lastFocusedBeforeExportModal.focus()
      } else if (exportOpenBtn.value && exportOpenBtn.value.focus) {
        exportOpenBtn.value.focus()
      }
    }

    const handleExportModalKeydown = (e) => {
      if (e.key === 'Escape') {
        closeExportModal()
        return
      }
      if (e.key !== 'Tab') return
      const modal = exportModal.value
      if (!modal) return
      const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])')
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    const filteredStrategiesCount = computed(() => {
      return exportOptions.category === 'all'
        ? props.strategies.length
        : props.strategies.filter(strategy => strategy.category === exportOptions.category).length
    })

    const selectedCategoryName = computed(() => {
      if (exportOptions.category === 'all') return 'All Categories'
      return exportOptions.category
    })

    const generatedFilename = computed(() => {
      return generateFilename('wellbeing_strategies', exportOptions.category)
    })

    // Get unique categories from strategies
    const uniqueCategories = computed(() => {
      const categories = props.strategies.map(strategy => strategy.category)
      return [...new Set(categories)].sort()
    })

    const handleExport = async () => {
      if (isExporting.value) return

      isExporting.value = true
      message.value = ''
      messageType.value = ''

      try {
        const strategiesWithRatings = props.strategies.map(strategy => ({
          ...strategy,
          averageRating: props.aggregateRatings[strategy.id]?.averageRating || 0,
          totalRatings: props.aggregateRatings[strategy.id]?.totalRatings || 0
        }))

        exportStrategiesToCSV(strategiesWithRatings, {
          filename: generatedFilename.value,
          category: exportOptions.category,
          includeRatings: exportOptions.includeRatings,
          includeTips: true
        })

        message.value = `Successfully exported ${filteredStrategiesCount.value} strategies${exportOptions.category !== 'all' ? ` from ${selectedCategoryName.value}` : ''} to ${generatedFilename.value}`
        messageType.value = 'success'

        setTimeout(closeExportModal, 3000)

      } catch (err) {
        console.error('Export failed:', err)
        message.value = 'Export failed. Please try again.'
        messageType.value = 'error'
      } finally {
        isExporting.value = false
      }
    }

    return {
      showModal,
      exportModal,
      exportCloseBtn,
      exportOpenBtn,
      exportOptions,
      isExporting,
      message,
      messageType,
      uniqueCategories,
      filteredStrategiesCount,
      selectedCategoryName,
      generatedFilename,
      openExportModal,
      closeExportModal,
      handleExportModalKeydown,
      handleExport
    }
  }
}
</script>

<style scoped>
.checkbox {
  width: 16px;
  height: 16px;
  accent-color: var(--primary-color);
}
</style>
