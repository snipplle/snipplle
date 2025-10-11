export function isValidJson(value: string): boolean {
  try {
    JSON.parse(value)
  } catch (_) {
    return false
  }

  return true
}
