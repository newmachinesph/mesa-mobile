import { View } from 'react-native';
import { ArrowRight, Users } from 'lucide-react-native';
import {
  formatDateLong,
  formatTime12,
  type Reservation,
  type Restaurant,
} from '@/core';
import { Card } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { StatusPill, DepositPill, OccasionChip } from '@/components/ui/pill';
import { HeroImage } from '@/app/restaurant/_components/HeroImage';

interface BookingRowProps {
  reservation: Reservation;
  restaurant: Restaurant | undefined;
  onPress: () => void;
}

export function BookingRow({ reservation: r, restaurant, onPress }: BookingRowProps) {
  const needsProof = r.deposit?.status === 'awaiting_proof';

  return (
    <Card onPress={onPress} className="mb-3 p-0">
      <View className="flex-row gap-3 p-3">
        <View className="h-[92px] w-[92px] overflow-hidden rounded-xl bg-sand">
          {restaurant ? <HeroImage uri={restaurant.heroImage} height={92} /> : null}
        </View>

        <View className="flex-1">
          <Text variant="heading" className="text-[16px]" numberOfLines={1}>
            {restaurant?.name ?? 'Restaurant'}
          </Text>
          <Text variant="caption" className="mt-1 text-mute">
            {formatDateLong(r.dateISO)} · {formatTime12(r.time)}
          </Text>
          <View className="mt-0.5 flex-row items-center gap-1">
            <Users size={13} color="#6e6a5e" strokeWidth={2} />
            <Text variant="caption" className="text-mute">
              {r.partySize} {r.partySize === 1 ? 'guest' : 'guests'}
            </Text>
          </View>

          <View className="mt-2 flex-row flex-wrap items-center gap-1.5">
            <StatusPill status={r.status} />
            {r.deposit && r.deposit.status !== 'none' ? <DepositPill status={r.deposit.status} /> : null}
            {r.occasion ? <OccasionChip occasion={r.occasion} /> : null}
          </View>
        </View>
      </View>

      {needsProof ? (
        <View className="flex-row items-center justify-between gap-2 rounded-b-2xl bg-terracotta px-4 py-2.5">
          <Text className="font-bold text-[13px] text-chalk">Upload proof of payment</Text>
          <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
        </View>
      ) : null}
    </Card>
  );
}
