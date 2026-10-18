import { Pressable, ScrollView } from 'react-native';
import {
  addDaysISO,
  isClosedDate,
  isClosedDay,
  todayISO,
  weekdayOf,
  type Schedule,
} from '@/core';
import { Text } from './text';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface DateStripProps {
  selectedDate: string;
  onSelect: (dateISO: string) => void;
  schedule?: Schedule; // when given, closed days are disabled
  startDate?: string;
  days?: number;
  className?: string;
}

export function DateStrip({ selectedDate, onSelect, schedule, startDate, days = 14, className }: DateStripProps) {
  const start = startDate ?? todayISO();
  const dates = Array.from({ length: days }, (_, i) => addDaysISO(start, i));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={className}
      contentContainerStyle={{ paddingHorizontal: 2, paddingVertical: 2 }}
    >
      {dates.map((date) => {
        const [, m, d] = date.split('-').map(Number);
        const closed = schedule ? isClosedDay(schedule, date) || isClosedDate(schedule, date) : false;
        const selected = date === selectedDate;
        return (
          <Pressable
            key={date}
            disabled={closed}
            onPress={() => onSelect(date)}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: closed }}
            className={cn(
              'mr-2 h-[74px] w-[58px] items-center justify-center rounded-2xl border',
              selected ? 'border-terracotta bg-terracotta' : 'border-line bg-chalk',
              closed && 'opacity-35',
            )}
          >
            <Text className={cn('text-[11px] font-semibold uppercase', selected ? 'text-sand' : 'text-mute')}>
              {WEEKDAYS[weekdayOf(date)]}
            </Text>
            <Text className={cn('my-0.5 text-[21px] font-bold leading-[24px]', selected ? 'text-chalk' : 'text-ink')}>
              {d}
            </Text>
            <Text className={cn('text-[10px] font-medium', selected ? 'text-sand' : 'text-mute')}>{MONTHS[m - 1]}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
