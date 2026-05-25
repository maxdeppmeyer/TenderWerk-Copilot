import type { Deadline } from '../types/domain'

export const deadlineUrgency = (deadline: Deadline | undefined, now = new Date()): string => {
  if (!deadline?.value) return 'unbekannt'
  const hours = (new Date(deadline.value).getTime() - now.getTime()) / 3_600_000
  if (hours < 0) return 'abgelaufen'
  if (hours < 72) return 'kritisch'
  if (hours < 24 * 7) return 'dringend'
  if (hours < 24 * 14) return 'bald'
  return 'normal'
}

export const hasDeadlineConflict = (deadlines: Deadline[]) => deadlines.some((item) => item.conflict)
