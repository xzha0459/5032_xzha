/**
 * CSV Export Utility for Wellbeing Data
 * Provides functionality to export emotion management strategies to CSV format
 */

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header names
 * @returns {string} CSV formatted string
 */
export function arrayToCSV(data, headers) {
  if (!data || data.length === 0) {
    return ''
  }

  // Escape CSV values (handle commas, quotes, newlines)
  const escapeCSVValue = (value) => {
    if (value === null || value === undefined) {
      return ''
    }

    const stringValue = String(value)

    // If value contains comma, quote, or newline, wrap in quotes and escape internal quotes
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
      return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
  }

  // Create CSV header row
  const headerRow = headers.map(escapeCSVValue).join(',')

  // Create CSV data rows
  const dataRows = data.map(row =>
    headers.map(header => escapeCSVValue(row[header])).join(',')
  )

  return [headerRow, ...dataRows].join('\n')
}

/**
 * Export wellbeing strategies to CSV
 * @param {Array} strategies - Array of strategy objects
 * @param {Object} options - Export options
 * @param {string} options.filename - Name of the CSV file
 * @param {string} options.category - Filter by category (optional)
 * @param {boolean} options.includeRatings - Whether to include rating data
 * @param {boolean} options.includeTips - Whether to include tips data
 */
export function exportStrategiesToCSV(strategies, options = {}) {
  const {
    filename = 'wellbeing_strategies.csv',
    category = 'all',
    includeRatings = true,
    includeTips = true
  } = options

  // Filter strategies by category if specified
  let filteredStrategies = strategies
  if (category !== 'all') {
    filteredStrategies = strategies.filter(strategy => strategy.category === category)
  }

  // Prepare headers based on options
  const baseHeaders = [
    'id',
    'title',
    'description',
    'category',
    'tags'
  ]

  const headers = [...baseHeaders]

  if (includeRatings) {
    headers.push('average_rating', 'total_ratings')
  }

  if (includeTips) {
    headers.push('tips_count', 'tips_details')
  }

  // Transform strategies data for CSV
  const csvData = filteredStrategies.map(strategy => {
    const row = {
      id: strategy.id || '',
      title: strategy.title || '',
      description: strategy.description || '',
      category: strategy.category || '',
      tags: Array.isArray(strategy.tags) ? strategy.tags.join('; ') : ''
    }

    if (includeRatings) {
      row.average_rating = strategy.averageRating || 0
      row.total_ratings = strategy.totalRatings || 0
    }

    if (includeTips && Array.isArray(strategy.tips)) {
      row.tips_count = strategy.tips.length
      row.tips_details = strategy.tips
        .map(tip => `${tip.title}: ${tip.description}`)
        .join(' | ')
    }

    return row
  })

  // Generate CSV content
  const csvContent = arrayToCSV(csvData, headers)

  // Create and download file
  downloadCSV(csvContent, filename)
}

/**
 * Download CSV content as a file
 * @param {string} csvContent - CSV content string
 * @param {string} filename - Name of the file to download
 */
export function downloadCSV(csvContent, filename) {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  // Trigger download
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up URL object
  URL.revokeObjectURL(url)
}

/**
 * Get category name by ID
 * @param {string} categoryId - Category ID
 * @param {Array} categories - Array of category objects
 * @returns {string} Category name
 */
export function getCategoryName(categoryId, categories) {
  const category = categories.find(cat => cat.id === categoryId)
  return category ? category.name : categoryId
}

/**
 * Generate filename with timestamp
 * @param {string} baseName - Base filename
 * @param {string} category - Category filter (optional)
 * @returns {string} Generated filename
 */
export function generateFilename(baseName, category = '') {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
  const categorySuffix = category && category !== 'all' ? `_${category}` : ''
  return `${baseName}${categorySuffix}_${timestamp}.csv`
}
