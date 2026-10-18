import { Pressable, ScrollView, View } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { formatTime12, minutesOf, timeFromMinutes } from '@/core';
import { Surface } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { DateStrip } from '@/components/ui/date-strip';
import { PartySizeStepper } from '@/components/ui/field';
import { PrimaryButton, GhostButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Cross-restaurant time options (each restaurant's own schedule decides open/closed
// once "Find a table" runs). Covers lunch through late dinner in 30-min steps.
const TIME_OPTIONS = Array.from(
  { length: (minutesOf('22:00') - minutesOf('11:00')) / 30 + 1 },
  (_, i) => timeFromMinutes(minutesOf('11:00') + i * 30),
);

export interface QuickBookBarProps {
  date: string;
  party: number;
  time: string;
  onDate: (d: string) => void;
  onParty: (n: number) => void;
  onTime: (t: string) => void;
  onFind: () => void;
  onClear: () => void;
  isFiltering: boolean;
}

export function QuickBookBar({
  date,
  party,
  time,
  onDate,
  onParty,
  onTime,
  onFind,
  onClear,
  isFiltering,
}: QuickBookBarProps) {
  return (
    <Surface className="p-4">
      <Text variant="label" className="mb-2.5 uppercase tracking-wide text-mute">
        Find a table
      </Text>

      <DateStrip selectedDate={date} onSelect={onDate} days={14} />

      <View className="mt-4">
        <Text variant="caption" className="mb-2 text-mute">
          Party size
        </Text>
        <PartySizeStepper value={party} onChange={onParty} />
      </View>

      <View className="mt-4">
        <Text variant="caption" className="mb-2 text-mute">
          Time
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 8 }}>
          {TIME_OPTIONS.map((t) => {
            const selected = t === time;
            return (
              <Pressable
                key={t}
                onPress={() => onTime(t)}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                className={cn(
                  'mr-2 rounded-lg border px-3 py-2',
                  selected ? 'border-terracotta bg-terracotta' : 'border-line bg-chalk',
                )}
              >
                <Text className={cn('text-[13px] font-semibold', selected ? 'text-chalk' : 'text-ink')}>
                  {formatTime12(t)}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View className="mt-4 flex-row gap-2">
        <View className="flex-1">
          <PrimaryButton icon={Search} onPress={onFind} fullWidth>
            {isFiltering ? 'Update search' : 'Find a table'}
          </PrimaryButton>
        </View>
        {isFiltering ? (
          <GhostButton icon={X} onPress={onClear}>
            Clear
          </GhostButton>
        ) : null}
      </View>
    </Surface>
  );
}
