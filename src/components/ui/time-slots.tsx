import { Pressable, View } from 'react-native';
import {
  formatTime12,
  minutesOf,
  shiftsForDate,
  slotsForDate,
  type Schedule,
} from '@/core';
import { Text } from './text';
import { cn } from '@/lib/utils';

export interface TimeSlotsProps {
  schedule: Schedule;
  dateISO: string;
  selectedTime?: string;
  onSelect: (time: string) => void;
  disabledTimes?: string[]; // slots to dim (e.g. unavailable for this party)
  className?: string;
}

export function TimeSlots({ schedule, dateISO, selectedTime, onSelect, disabledTimes, className }: TimeSlotsProps) {
  const shifts = shiftsForDate(schedule, dateISO);
  const slots = slotsForDate(schedule, dateISO);
  const dimmed = new Set(disabledTimes ?? []);

  if (shifts.length === 0) {
    return (
      <Text variant="body" className={cn('text-mute', className)}>
        Closed on this day — pick another date.
      </Text>
    );
  }

  return (
    <View className={className}>
      {shifts.map((shift) => {
        const start = minutesOf(shift.start);
        const end = minutesOf(shift.end);
        const shiftSlots = slots.filter((s) => {
          const t = minutesOf(s);
          return t >= start && t < end;
        });
        if (shiftSlots.length === 0) return null;
        return (
          <View key={shift.id} className="mb-5">
            <Text variant="label" className="mb-2.5 uppercase tracking-wide text-mute">
              {shift.name}
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {shiftSlots.map((s) => {
                const disabled = dimmed.has(s);
                const selected = s === selectedTime;
                return (
                  <Pressable
                    key={s}
                    disabled={disabled}
                    onPress={() => onSelect(s)}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    className={cn(
                      'rounded-lg border px-3 py-2',
                      selected ? 'border-terracotta bg-terracotta' : 'border-line bg-chalk',
                      disabled && 'opacity-30',
                    )}
                  >
                    <Text className={cn('text-[13px] font-semibold', selected ? 'text-chalk' : 'text-ink')}>
                      {formatTime12(s)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
