import { View } from 'react-native';
import { formatDateLong, type Reservation } from '@/core';
import { Text } from '@/components/ui/text';
import { Row } from '@/components/ui/card';
import { StatusPill, OccasionChip } from '@/components/ui/pill';

interface VisitRowProps {
  reservation: Reservation;
  restaurantName: string;
}

// One past booking: restaurant + date + party, with occasion and status.
export function VisitRow({ reservation: r, restaurantName }: VisitRowProps) {
  return (
    <View className="py-3.5">
      <Row className="items-start">
        <View className="flex-1 pr-3">
          <Text variant="label" numberOfLines={1}>
            {restaurantName}
          </Text>
          <Text variant="caption" className="mt-1 text-mute">
            {formatDateLong(r.dateISO)} · Party of {r.partySize}
          </Text>
        </View>
        <StatusPill status={r.status} />
      </Row>
      {r.occasion ? <OccasionChip occasion={r.occasion} className="mt-2.5" /> : null}
    </View>
  );
}
