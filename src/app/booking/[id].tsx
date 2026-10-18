import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { toast } from 'sonner-native';
import { CalendarX, Calendar, Clock, MapPin, Users, Utensils } from 'lucide-react-native';
import {
  formatDateLong,
  formatTime12,
  nextStatuses,
  type Reservation,
} from '@/core';
import { useMesaStore } from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Header } from '@/components/chrome/Header';
import { Text } from '@/components/ui/text';
import { Surface, Divider, EmptyState, Skeleton } from '@/components/ui/card';
import { GhostButton } from '@/components/ui/button';
import { OccasionChip } from '@/components/ui/pill';
import { HeroImage } from '@/app/restaurant/_components/HeroImage';
import { StatusTimeline } from '@/app/booking/_components/StatusTimeline';
import { DepositSection } from '@/app/booking/_components/DepositSection';
import { CancelSheet } from '@/app/booking/_components/CancelSheet';

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="label" className="mb-2.5 mt-7 uppercase tracking-wide text-mute">
      {children}
    </Text>
  );
}

function FactColumn({ icon: Icon, label, value }: { icon: typeof Calendar; label: string; value: string }) {
  return (
    <View className="flex-1 items-center px-2">
      <Icon size={18} color="#b4563a" strokeWidth={2.25} />
      <Text variant="caption" className="mt-1.5 text-mute">
        {label}
      </Text>
      <Text className="mt-0.5 text-center font-bold text-[15px] text-ink">{value}</Text>
    </View>
  );
}

export default function BookingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservation = useMesaStore((s) => s.reservations.find((r) => r.id === id));
  const restaurant = useMesaStore((s) => s.restaurants.find((r) => r.id === reservation?.restaurantId));
  const cancelReservation = useMesaStore((s) => s.cancelReservation);
  const [cancelOpen, setCancelOpen] = useState(false);

  // Params can arrive a tick after mount — show a skeleton, not "not found".
  if (!id) {
    return (
      <Screen header={<Header title="Booking" />}>
        <View className="mt-2 gap-4">
          <Skeleton className="h-[200px] w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </View>
      </Screen>
    );
  }

  if (!reservation || !restaurant) {
    return (
      <Screen header={<Header title="Booking" />} scroll={false}>
        <EmptyState
          className="flex-1"
          title="Booking not found"
          message="This booking may have been cancelled or is no longer available."
          icon={CalendarX}
        />
      </Screen>
    );
  }

  const r: Reservation = reservation;
  const tableLabels = r.tableIds
    .map((tid) => restaurant.tables.find((t) => t.id === tid)?.label)
    .filter((l): l is string => Boolean(l));
  const canCancel = nextStatuses(r.status).includes('cancelled');
  const hasVerifiedDeposit = r.deposit?.status === 'verified';
  const showRefundWarning = hasVerifiedDeposit && restaurant.depositPolicy.nonRefundable;

  const confirmCancel = () => {
    cancelReservation(r.id);
    setCancelOpen(false);
    toast.success('Booking cancelled. Your table has been released.');
    router.back();
  };

  return (
    <Screen header={<Header title={restaurant.name} />}>
      <View className="mt-2">
        <HeroImage uri={restaurant.heroImage} height={200} className="rounded-2xl" />
      </View>

      <Text variant="title" className="mt-4">
        {restaurant.name}
      </Text>
      <View className="mt-1.5 flex-row items-center gap-1.5">
        <MapPin size={15} color="#6e6a5e" strokeWidth={2} />
        <Text variant="body" className="flex-1 text-slate">
          {restaurant.address}
        </Text>
      </View>

      <Surface className="mt-4 flex-row py-4">
        <FactColumn icon={Calendar} label="Date" value={formatDateLong(r.dateISO)} />
        <Divider vertical />
        <FactColumn icon={Clock} label="Time" value={formatTime12(r.time)} />
        <Divider vertical />
        <FactColumn icon={Users} label="Party" value={`${r.partySize} ${r.partySize === 1 ? 'guest' : 'guests'}`} />
      </Surface>

      <SectionTitle>Status</SectionTitle>
      <StatusTimeline status={r.status} />

      <SectionTitle>Your table</SectionTitle>
      <Surface className="p-4">
        <View className="flex-row items-center gap-2">
          <Utensils size={16} color="#6e6a5e" strokeWidth={2} />
          {tableLabels.length > 0 ? (
            <Text variant="body" className="flex-1 text-ink">
              {tableLabels.length === 1 ? 'Table' : 'Tables'} {tableLabels.join(' · ')}
            </Text>
          ) : (
            <Text variant="body" className="flex-1 text-slate">
              We&apos;ll assign your table when you arrive.
            </Text>
          )}
        </View>
      </Surface>

      {r.occasion || (r.notes && r.notes.length > 0) ? (
        <>
          <SectionTitle>Occasion &amp; notes</SectionTitle>
          <Surface className="p-4">
            {r.occasion ? <OccasionChip occasion={r.occasion} /> : null}
            {r.notes && r.notes.length > 0 ? (
              <Text variant="body" className={r.occasion ? 'mt-2.5 text-slate' : 'text-slate'}>
                {r.notes}
              </Text>
            ) : null}
          </Surface>
        </>
      ) : null}

      <SectionTitle>Deposit</SectionTitle>
      <DepositSection deposit={r.deposit} policy={restaurant.depositPolicy} reservationId={r.id} createdAt={r.createdAt} />

      {canCancel ? (
        <View className="mt-7">
          <GhostButton className="bg-danger-bg" onPress={() => setCancelOpen(true)} fullWidth>
            <Text className="font-bold text-[15px] text-danger">Cancel booking</Text>
          </GhostButton>
        </View>
      ) : null}

      <CancelSheet
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={confirmCancel}
        showRefundWarning={Boolean(showRefundWarning)}
      />
    </Screen>
  );
}
