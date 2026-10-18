import { Pressable, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Check, Users } from 'lucide-react-native';
import {
  formatTime12,
  minutesOf,
  shiftsForDate,
  weekdayOf,
  type AvailabilityResult,
  type Restaurant,
  type Schedule,
} from '@/core';
import { Field, PartySizeStepper } from '@/components/ui/field';
import { DateStrip } from '@/components/ui/date-strip';
import { TimeSlots } from '@/components/ui/time-slots';
import { AvailabilityBadge } from '@/components/ui/pill';
import { Surface, Divider } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { PrimaryButton } from '@/components/ui/button';
import type { BookingForm } from './schema';

const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export interface StepWhenProps {
  restaurant: Restaurant;
  schedule: Schedule;
  availability: AvailabilityResult | null;
}

// Warm, customer-facing sentence for whatever checkAvailability returned.
function availabilityCopy(
  a: AvailabilityResult,
  restaurant: Restaurant,
  schedule: Schedule,
  dateISO: string,
  time: string,
  party: number,
): string {
  if (a.closed === 'day') {
    return `${restaurant.name} is closed on ${WEEKDAYS_LONG[weekdayOf(dateISO)]}s.`;
  }
  if (a.closed === 'date') {
    const [, m, d] = dateISO.split('-').map(Number);
    return `Closed ${d} ${MONTHS[m - 1]} for the holiday.`;
  }
  if (a.closed === 'between_shifts') {
    const shifts = shiftsForDate(schedule, dateISO);
    const t = minutesOf(time);
    const before = [...shifts].reverse().find((s) => minutesOf(s.end) <= t);
    const after = shifts.find((s) => minutesOf(s.start) > t);
    if (before && after) {
      return `The kitchen closes ${formatTime12(before.end)}–${formatTime12(after.start)}. Dinner starts at ${formatTime12(after.start)}.`;
    }
    return 'The kitchen is between service right now — try dinner.';
  }
  if (a.closed === 'outside_hours') {
    return 'That time is outside opening hours — pick a slot within a shift.';
  }
  if (a.combination.length) {
    return `No single table fits ${party}. We can put two together — tap to request.`;
  }
  if (a.level === 'tight') {
    return `Only one table left at ${formatTime12(time)} — grab it before it goes.`;
  }
  if (a.level === 'unavailable') {
    return `We're fully booked for ${party} at ${formatTime12(time)}.`;
  }
  return `Table for ${party} available at ${formatTime12(time)}.`;
}

export function StepWhen({ restaurant, schedule, availability }: StepWhenProps) {
  const { control, watch, setValue } = useFormContext<BookingForm>();
  const dateISO = watch('dateISO');
  const time = watch('time');
  const party = watch('partySize');
  const accepted = watch('acceptedCombination');

  const hasCombo = !!availability && availability.combination.length > 0;
  const showAlternatives =
    !!availability && availability.level === 'unavailable' && availability.alternativeTimes.length > 0;

  return (
    <View className="gap-6">
      <Field label="When are you coming?">
        <Controller
          control={control}
          name="dateISO"
          render={({ field }) => (
            <DateStrip selectedDate={field.value} onSelect={field.onChange} schedule={schedule} days={14} />
          )}
        />
      </Field>

      <Field label="How many guests?" hint="Up to 16 online — for bigger parties, call the restaurant.">
        <Controller
          control={control}
          name="partySize"
          render={({ field }) => (
            <PartySizeStepper value={field.value} onChange={field.onChange} min={1} max={16} />
          )}
        />
      </Field>

      <Field label="Pick a time">
        <Controller
          control={control}
          name="time"
          render={({ field }) => (
            <TimeSlots
              schedule={schedule}
              dateISO={dateISO}
              selectedTime={field.value || undefined}
              onSelect={field.onChange}
            />
          )}
        />
      </Field>

      {availability && time ? (
        <Surface className="p-4">
          <AvailabilityBadge level={availability.level} />
          <Text variant="body" className="mt-2 text-ink">
            {availabilityCopy(availability, restaurant, schedule, dateISO, time, party)}
          </Text>

          {hasCombo ? (
            accepted ? (
              <View className="mt-3 flex-row items-center gap-2 rounded-xl bg-ok-bg px-3 py-2.5">
                <Check size={16} color="#2f8f5b" strokeWidth={2.5} />
                <Text variant="body" className="flex-1 text-ok">
                  Tables {availability.combination.map((t) => t.label).join(' + ')} will be set together.
                </Text>
              </View>
            ) : (
              <View className="mt-3">
                <Text variant="caption" className="mb-2 text-mute">
                  Suggested: {availability.combination.map((t) => t.label).join(' + ')} (
                  {availability.combination.reduce((s, t) => s + t.seats, 0)} seats)
                </Text>
                <PrimaryButton
                  icon={Users}
                  fullWidth
                  onPress={() => setValue('acceptedCombination', true, { shouldValidate: true })}
                >
                  Put these tables together
                </PrimaryButton>
              </View>
            )
          ) : null}

          {showAlternatives ? (
            <View className="mt-3">
              <Divider className="mb-3" />
              <Text variant="caption" className="mb-2 text-mute">
                Other times that work
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {availability.alternativeTimes.map((t) => (
                  <Pressable
                    key={t}
                    accessibilityRole="button"
                    onPress={() => setValue('time', t, { shouldValidate: true })}
                    className="rounded-lg border border-line bg-chalk px-3 py-2"
                  >
                    <Text className="text-[13px] font-semibold text-terracotta">{formatTime12(t)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : null}
        </Surface>
      ) : (
        <Text variant="caption" className="text-mute">
          Pick a time to check availability.
        </Text>
      )}
    </View>
  );
}
