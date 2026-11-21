export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

/** Morning 5–11, day 11–18, evening 18–22, night otherwise. */
export function timeOfDay(time: number): TimeOfDay {
  const hour = new Date(time).getHours();
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 18) return 'day';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}
