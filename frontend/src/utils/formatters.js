export function formatDate(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatDateTime(dateString) {
  if (!dateString) return '-'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return dateString
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)
}

export function formatTime(timeString) {
  if (!timeString) return '-'
  // If it's full ISO string or date
  if (timeString.includes('T') || timeString.includes(' ')) {
    const date = new Date(timeString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
    }
  }
  // If it's a TimeSpan string like "08:00:00" or "08:00"
  const parts = timeString.split(':')
  if (parts.length >= 2) {
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
  }
  return timeString
}

export function formatDurationHours(hours) {
  if (hours === null || hours === undefined) return '-'
  const num = Number(hours)
  if (isNaN(num)) return '-'
  return `${num.toFixed(1)} giờ`
}

export function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined || minutes === 0) return '0 phút'
  return `${minutes} phút`
}

