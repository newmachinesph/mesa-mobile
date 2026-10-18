import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const STEPS = ['When', 'Details', 'Confirm'] as const;

export interface StepHeaderProps {
  current: number; // 1-based
}

// Three-dot progress: done steps get a check, the active one is terracotta,
// upcoming ones sit muted. The connector fills as you advance.
export function StepHeader({ current }: StepHeaderProps) {
  return (
    <View className="flex-row items-center">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const isLast = i === STEPS.length - 1;
        return (
          <View key={label} className={cn('flex-row items-center', !isLast && 'flex-1')}>
            <View className="items-center">
              <View
                className={cn(
                  'h-8 w-8 items-center justify-center rounded-full border',
                  done && 'border-terracotta bg-terracotta',
                  active && 'border-terracotta bg-chalk',
                  !done && !active && 'border-line bg-chalk',
                )}
              >
                {done ? (
                  <Check size={16} color="#ffffff" strokeWidth={3} />
                ) : (
                  <Text
                    className={cn('text-[13px] font-bold', active ? 'text-terracotta' : 'text-mute')}
                  >
                    {n}
                  </Text>
                )}
              </View>
              <Text
                variant="caption"
                className={cn('mt-1.5', active ? 'text-ink' : 'text-mute')}
              >
                {label}
              </Text>
            </View>
            {!isLast ? (
              <View className={cn('mx-2 h-px flex-1', n < current ? 'bg-terracotta' : 'bg-line')} />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
