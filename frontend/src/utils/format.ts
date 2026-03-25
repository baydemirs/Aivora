/**
 * Shared formatting helpers used across the Aivora frontend.
 */

/**
 * Extract initials from a display name (e.g. "John Doe" → "JD").
 * Falls back to "U" if name is empty/undefined.
 */
export function getInitials(name?: string | null): string {
  if (!name) return 'U'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Format file size in bytes to a human-readable string.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

/**
 * Truncate a string to maxLength with ellipsis.
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '…'
}
