import { Pressable, View } from 'react-native';
import { MapPin } from 'lucide-react-native';
import {
  formatTime12,
  type AvailabilityResult,
  type Restaurant,
  type Schedule,
} from '@/core';
import { Text } from '@/components/ui/text';
import { AvailabilityBadge } from '@/components/ui/pill';
import { cn } from '@/lib/utils';
import { HeroImage } from './HeroImage';
import { OpenStatusChip } from './OpenStatusChip';

// When the quick-book filter is on, the card carries the availability check for
// the chosen date/time so it can badge itself and suggest an alternative time.
export interface CardAvailability {
  result: AvailabilityResult;
  time: string;
}

export interface RestaurantCardProps {
  restaurant: Restaurant;
  schedule: Schedule;
  nowISO: string; // live clock — drives the open/closed chip
  nowTime: string;
  onPress: () => void;
  availability?: CardAvailability;
  className?: string;
}

function unavailableLine(av: CardAvailability): string {
  if (av.result.closed === 'day' || av.result.closed === 'date') return 'Closed on this day';
  const alt = av.result.alternativeTimes[0];
  const at = formatTime12(av.time);
  return alt ? `No tables at ${at} — try ${formatTime12(alt)}` : `No tables at ${at}`;
}

export function RestaurantCard({
  restaurant,
  schedule,
  nowISO,
  nowTime,
  onPress,
  availability,
  className,
}: RestaurantCardProps) {
  const showAltLine = availability && availability.result.level === 'unavailable';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${restaurant.name}, ${restaurant.cuisine}`}
      onPress={onPress}
      className={cn('overflow-hidden rounded-2xl border border-line bg-chalk active:opacity-90', className)}
    >
      <HeroImage uri={restaurant.heroImage} height={190}>
        <View className="absolute right-3 top-3 rounded-full bg-chalk/90 px-2.5 py-1">
          <Text className="text-[13px] font-bold text-ink">{restaurant.priceBand}</Text>
        </View>
        <View className="absolute bottom-3 left-3">
          <OpenStatusChip schedule={schedule} dateISO={nowISO} time={nowTime} className="bg-chalk/90" />
        </View>
      </HeroImage>

      <View className="p-4">
        <Text variant="heading" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text variant="caption" className="mt-1 text-mute">
          {restaurant.cuisine} · {restaurant.priceBand}
        </Text>

        <View className="mt-1.5 flex-row items-center gap-1">
          <MapPin size={13} color="#6e6a5e" strokeWidth={2} />
          <Text variant="caption" numberOfLines={1} className="flex-1 text-mute">
            {restaurant.address}
          </Text>
        </View>

        <Text variant="body" numberOfLines={2} className="mt-2.5">
          {restaurant.blurb}
        </Text>

        {availability ? (
          <View className="mt-3.5">
            <AvailabilityBadge level={availability.result.level} />
            {showAltLine ? (
              <Text variant="caption" className="mt-1.5 text-mute">
                {unavailableLine(availability)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}
