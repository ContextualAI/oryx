/**
 * Creates a Date object from year, month, and day in PST timezone.
 * Note: Month is 1-indexed (1 = January, 12 = December) for readability.
 */
export function getDate(year: number, month: number, day: number): Date {
  const pstDateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}T00:00:00-08:00`;
  return new Date(pstDateString);
}
