import { Pressable, View } from 'react-native';
import { Controller, useFormContext } from 'react-hook-form';
import { Sparkles } from 'lucide-react-native';
import type { Occasion } from '@/core';
import { Field, TextInput, TextArea, PhoneField } from '@/components/ui/field';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { OCCASIONS, type BookingForm } from './schema';

const OCCASION_LABELS: Record<Occasion, string> = {
  birthday: 'Birthday',
  debut: 'Debut',
  anniversary: 'Anniversary',
  christening: 'Christening',
  graduation: 'Graduation',
  despedida: 'Despedida',
  blowout: 'Blowout',
  other: 'Other',
};

export function StepDetails() {
  const { control } = useFormContext<BookingForm>();

  return (
    <View className="gap-6">
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <Field label="Who's the booking under?" required error={fieldState.error?.message}>
            <TextInput
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              placeholder="Juan dela Cruz"
              autoCapitalize="words"
              error={!!fieldState.error}
            />
          </Field>
        )}
      />

      <Controller
        control={control}
        name="phone"
        render={({ field, fieldState }) => (
          <PhoneField
            label="Mobile number"
            value={field.value}
            onChangeText={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="occasion"
        render={({ field }) => (
          <Field label="Celebrating something?" hint="Optional — helps the kitchen prepare.">
            <View className="flex-row flex-wrap gap-2">
              {OCCASIONS.map((occ) => {
                const selected = field.value === occ;
                return (
                  <Pressable
                    key={occ}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => field.onChange(selected ? undefined : occ)}
                    className={cn(
                      'flex-row items-center gap-1 rounded-full border px-3 py-1.5',
                      selected ? 'border-brass bg-[#f5e9d2]' : 'border-line bg-chalk',
                    )}
                  >
                    {selected ? <Sparkles size={13} color="#c9973f" strokeWidth={2.5} /> : null}
                    <Text
                      className={cn(
                        'text-[13px] font-semibold',
                        selected ? 'text-brass' : 'text-slate',
                      )}
                    >
                      {OCCASION_LABELS[occ]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </Field>
        )}
      />

      <Controller
        control={control}
        name="notes"
        render={({ field }) => (
          <Field label="Anything we should know?" hint="High chair, wheelchair access, allergies…">
            <TextArea
              value={field.value}
              onChangeText={field.onChange}
              placeholder="High chair, please"
            />
          </Field>
        )}
      />
    </View>
  );
}
