export function formatDate(value: string | null | undefined): string {
  if (!value) return 'N/A';
  return value.split('T')[0];
}
