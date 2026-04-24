export function isValidDate(value: string): boolean {
  if (!value.trim()) return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}
