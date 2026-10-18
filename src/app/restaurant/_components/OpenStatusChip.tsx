import { View } from 'react-native';
import {
  formatTime12,
  isClosedDate,
  isClosedDay,
  minutesOf,
  shiftForTime,
  shiftsForDate,
  todayISO,
  type Schedule,
} from '@/core';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000;

// Current Asia/Manila calendar date + 'HH:mm'. Fixed +08:00, no DST — ever.
export function nowManila(): { dateISO: string; time: string } {
  const d = new Date(Date.now() + MANILA_OFFSET_MS);
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return { dateISO: todayISO(), time: `${hh}:${mm}` };
}

type OpenTone = 'open' | 'soon' | 'closed';

export interface OpenStatus {
  label: string;
  tone: OpenTone;
}

// Live open/closed state for `time` on `dateISO` against the restaurant's schedule.
export function openStatusFor(schedule: Schedule, dateISO: string, time: string): OpenStatus {
  if (isClosedDate(schedule, dateISO) || isClosedDay(schedule, dateISO)) {
    return { label: 'Closed today', tone: 'closed' };
  }
  const active = shiftForTime(schedule, dateISO, time);
  if (active) return { label: `Open until ${formatTime12(active.end)}`, tone: 'open' };

  const now = minutesOf(time);
  const upcoming = shiftsForDate(schedule, dateISO)
    .filter((s) => minutesOf(s.start) > now)
    .sort((a, b) => minutesOf(a.start) - minutesOf(b.start))[0];
  if (upcoming) return { label: `Opens ${formatTime12(upcoming.start)}`, tone: 'soon' };

  return { label: 'Closed', tone: 'closed' };
}

const CHIP: Record<OpenTone, { bg: string; text: string; dot: string }> = {
  open: { bg: 'bg-ok-bg', text: 'text-ok', dot: 'bg-ok' },
  soon: { bg: 'bg-warn-bg', text: 'text-warn', dot: 'bg-warn' },
  closed: { bg: 'bg-sand', text: 'text-mute', dot: 'bg-mute' },
};

export function OpenStatusChip({
  schedule,
  dateISO,
  time,
  className,
}: {
  schedule: Schedule;
  dateISO: string;
  time: string;
  className?: string;
}) {
  const status = openStatusFor(schedule, dateISO, time);
  const s = CHIP[status.tone];
  return (
    <View className={cn('flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1', s.bg, className)}>
      <View className={cn('h-1.5 w-1.5 rounded-full', s.dot)} />
      <Text className={cn('text-[11px] font-bold leading-[13px]', s.text)}>{status.label}</Text>
    </View>
  );
}
