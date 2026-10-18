import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner-native';
import { SearchX } from 'lucide-react-native';
import {
  addDaysISO,
  checkAvailability,
  isClosedDate,
  isClosedDay,
  isValidPhMobile,
  todayISO,
  type Schedule,
} from '@/core';
import {
  useCurrentGuest,
  useMesaStore,
  useRestaurant,
  useScheduleFor,
} from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Header } from '@/components/chrome/Header';
import { EmptyState } from '@/components/ui/card';
import { PrimaryButton, SecondaryButton } from '@/components/ui/button';
import { StepHeader } from './_components/StepHeader';
import { StepWhen } from './_components/StepWhen';
import { StepDetails } from './_components/StepDetails';
import { StepConfirm } from './_components/StepConfirm';
import { bookingSchema, type BookingForm } from './_components/schema';

// First bookable day inside the strip window — skip the restaurant's closed days
// so the guest lands on something they can actually pick.
function firstOpenDate(schedule: Schedule): string {
  const start = todayISO();
  for (let i = 0; i < 14; i += 1) {
    const d = addDaysISO(start, i);
    if (!isClosedDay(schedule, d) && !isClosedDate(schedule, d)) return d;
  }
  return start;
}

export default function BookScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();

  const restaurant = useRestaurant(restaurantId);
  const schedule = useScheduleFor(restaurantId);
  const guest = useCurrentGuest();
  const reservations = useMesaStore((s) => s.reservations);
  const createReservation = useMesaStore((s) => s.createReservation);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    mode: 'onTouched',
    defaultValues: {
      dateISO: schedule ? firstOpenDate(schedule) : todayISO(),
      time: '',
      partySize: 2,
      name: guest?.name ?? '',
      phone: guest?.phone ?? '',
      occasion: undefined,
      notes: '',
      acceptedCombination: false,
    },
  });

  const { watch, setValue, handleSubmit } = form;
  const dateISO = watch('dateISO');
  const time = watch('time');
  const partySize = watch('partySize');
  const name = watch('name');
  const phone = watch('phone');
  const acceptedCombination = watch('acceptedCombination');

  // A combined-table offer is specific to a date/time/party — if any of those
  // change, the guest has to opt in again.
  useEffect(() => {
    setValue('acceptedCombination', false);
  }, [dateISO, time, partySize, setValue]);

  const availability = useMemo(() => {
    if (!restaurant || !schedule || !time) return null;
    return checkAvailability({ restaurant, schedule, reservations, dateISO, time, partySize });
  }, [restaurant, schedule, reservations, dateISO, time, partySize]);

  if (!restaurant || !schedule) {
    return (
      <Screen header={<Header title="Book a table" />}>
        <EmptyState
          className="mt-16"
          title="Restaurant not found"
          message="This restaurant is no longer available."
          icon={SearchX}
          action={<PrimaryButton onPress={() => router.replace('/')}>Back to browse</PrimaryButton>}
        />
      </Screen>
    );
  }

  const hasCombo = !!availability && availability.combination.length > 0;
  const step1Ok =
    !!availability && availability.level !== 'unavailable' && (!hasCombo || acceptedCombination);
  const step2Ok = name.trim().length > 0 && isValidPhMobile(phone);

  const onSubmit = handleSubmit((values) => {
    setSubmitting(true);
    const created = createReservation({
      restaurantId: restaurant.id,
      partySize: values.partySize,
      dateISO: values.dateISO,
      time: values.time,
      occasion: values.occasion,
      notes: values.notes.trim() || undefined,
      method: restaurant.depositPolicy.methods[0],
    });
    toast.success('Salamat! Your booking is in.');
    router.replace(`/booking/${created.id}`);
  });

  const footer =
    step === 1 ? (
      <PrimaryButton fullWidth disabled={!step1Ok} onPress={() => setStep(2)}>
        Continue
      </PrimaryButton>
    ) : step === 2 ? (
      <View className="flex-row gap-3">
        <View className="flex-1">
          <SecondaryButton fullWidth onPress={() => setStep(1)}>
            Back
          </SecondaryButton>
        </View>
        <View className="flex-[2]">
          <PrimaryButton fullWidth disabled={!step2Ok} onPress={() => setStep(3)}>
            Continue
          </PrimaryButton>
        </View>
      </View>
    ) : (
      <View className="flex-row gap-3">
        <View className="flex-1">
          <SecondaryButton fullWidth disabled={submitting} onPress={() => setStep(2)}>
            Back
          </SecondaryButton>
        </View>
        <View className="flex-[2]">
          <PrimaryButton fullWidth loading={submitting} onPress={onSubmit}>
            Confirm booking
          </PrimaryButton>
        </View>
      </View>
    );

  return (
    <Screen
      header={<Header title="Book a table" subtitle={restaurant.name} />}
      footer={footer}
    >
      <FormProvider {...form}>
        <View className="pb-2 pt-4">
          <StepHeader current={step} />
        </View>
        <View className="mt-4">
          {step === 1 ? (
            <StepWhen restaurant={restaurant} schedule={schedule} availability={availability} />
          ) : step === 2 ? (
            <StepDetails />
          ) : (
            <StepConfirm restaurant={restaurant} />
          )}
        </View>
      </FormProvider>
    </Screen>
  );
}
