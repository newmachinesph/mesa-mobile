import { View } from 'react-native';
import { Check, XCircle } from 'lucide-react-native';
import { statusLabel, type ReservationStatus } from '@/core';
import { Surface } from '@/components/ui/card';
import { Text } from '@/components/ui/text';

const STEPS: { status: ReservationStatus; label: string; hint: string }[] = [
  { status: 'pending', label: 'Pending', hint: 'Booking received' },
  { status: 'confirmed', label: 'Confirmed', hint: 'Your table is reserved' },
  { status: 'seated', label: 'Seated', hint: 'Enjoy your meal' },
  { status: 'completed', label: 'Completed', hint: 'Thanks for dining with us' },
];

const ORDER: Record<'pending' | 'confirmed' | 'seated' | 'completed', number> = {
  pending: 0,
  confirmed: 1,
  seated: 2,
  completed: 3,
};

const TERMINAL_MESSAGE: Record<'no_show' | 'cancelled', string> = {
  no_show: 'This booking was marked a no-show. Any deposit on file may be forfeited.',
  cancelled: 'This booking was cancelled and the table released.',
};

export function StatusTimeline({ status }: { status: ReservationStatus }) {
  if (status === 'cancelled' || status === 'no_show') {
    return (
      <Surface className="border-danger/30 bg-danger-bg p-4">
        <View className="flex-row items-center gap-2">
          <XCircle size={18} color="#b3261e" strokeWidth={2.25} />
          <Text variant="heading" className="text-[16px] text-danger">
            {statusLabel(status)}
          </Text>
        </View>
        <Text variant="body" className="mt-1.5 text-slate">
          {TERMINAL_MESSAGE[status]}
        </Text>
      </Surface>
    );
  }

  const current = ORDER[status];

  return (
    <Surface className="p-4">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const isLast = i === STEPS.length - 1;
        return (
          <View key={step.status} className="flex-row">
            <View className="items-center">
              <View
                className={
                  done || active
                    ? 'h-7 w-7 items-center justify-center rounded-full bg-terracotta'
                    : 'h-7 w-7 items-center justify-center rounded-full border border-line bg-sand'
                }
              >
                {done ? (
                  <Check size={15} color="#ffffff" strokeWidth={3} />
                ) : (
                  <View className={active ? 'h-2.5 w-2.5 rounded-full bg-chalk' : 'h-2 w-2 rounded-full bg-mute'} />
                )}
              </View>
              {!isLast ? <View className={done ? 'w-0.5 flex-1 bg-terracotta' : 'w-0.5 flex-1 bg-line'} /> : null}
            </View>

            <View className={isLast ? 'ml-3 pb-0' : 'ml-3 pb-5'}>
              <Text
                variant="heading"
                className={active ? 'text-[15px] text-ink' : done ? 'text-[15px] text-slate' : 'text-[15px] text-mute'}
              >
                {step.label}
              </Text>
              <Text variant="caption" className="mt-0.5 text-mute">
                {step.hint}
              </Text>
            </View>
          </View>
        );
      })}
    </Surface>
  );
}
