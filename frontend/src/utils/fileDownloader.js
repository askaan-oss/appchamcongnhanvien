/**
 * Helper function to trigger browser download for binary blob responses (Excel, PDF, etc.)
 * @param {Blob|ArrayBuffer} data 
 * @param {string} filename 
 * @param {string} mimeType 
 */
export function downloadFile(data, filename, mimeType = 'application/octet-stream') {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.style.display = 'none'
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

