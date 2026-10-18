import { useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import {
  checkAvailability,
  type AvailabilityLevel,
  type Restaurant,
  type Schedule,
} from '@/core';
import { useMesaStore } from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/ui/card';
import { RestaurantCard, type CardAvailability } from '@/app/restaurant/_components/RestaurantCard';
import { QuickBookBar } from '@/app/restaurant/_components/QuickBookBar';
import { nowManila } from '@/app/restaurant/_components/OpenStatusChip';

const AVAILABILITY_RANK: Record<AvailabilityLevel, number> = { available: 0, tight: 1, unavailable: 2 };

function greeting(time: string): string {
  const hour = Number(time.slice(0, 2));
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DiscoverScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const wide = width >= 768;

  const restaurants = useMesaStore((s) => s.restaurants);
  const schedules = useMesaStore((s) => s.schedules);
  const reservations = useMesaStore((s) => s.reservations);

  const now = nowManila();
  const [date, setDate] = useState(now.dateISO);
  const [party, setParty] = useState(2);
  const [time, setTime] = useState('19:00');
  const [isFiltering, setIsFiltering] = useState(false);

  const scheduleFor = (r: Restaurant): Schedule | undefined =>
    schedules.find((sc) => sc.restaurantId === r.id);

  const open = (r: Restaurant) => router.push(`/restaurant/${r.id}`);

  // Filtered feed: every restaurant checked for the chosen date/time/party, best first.
  const filtered = useMemo(() => {
    if (!isFiltering) return [];
    return restaurants
      .map((restaurant) => {
        const schedule = scheduleFor(restaurant);
        if (!schedule) return null;
        const result = checkAvailability({ restaurant, schedule, reservations, dateISO: date, time, partySize: party });
        return { restaurant, schedule, availability: { result, time } as CardAvailability };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => AVAILABILITY_RANK[a.availability.result.level] - AVAILABILITY_RANK[b.availability.result.level]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFiltering, restaurants, reservations, date, time, party]);

  const cardWrapClass = wide ? 'w-[48.5%]' : 'w-full';

  const renderCard = (r: Restaurant, availability?: CardAvailability) => {
    const schedule = scheduleFor(r);
    if (!schedule) return null;
    return (
      <View key={r.id} className={`${cardWrapClass} mb-4`}>
        <RestaurantCard
          restaurant={r}
          schedule={schedule}
          nowISO={now.dateISO}
          nowTime={now.time}
          onPress={() => open(r)}
          availability={availability}
        />
      </View>
    );
  };

  const section = (title: string, subtitle: string, list: Restaurant[]) => {
    if (list.length === 0) return null;
    return (
      <View className="mt-7">
        <Text variant="heading">{title}</Text>
        <Text variant="caption" className="mt-0.5 text-mute">
          {subtitle}
        </Text>
        <View className="mt-3 flex-row flex-wrap justify-between">{list.map((r) => renderCard(r))}</View>
      </View>
    );
  };

  const celebrations = restaurants.filter((r) =>
    r.zones.some((z) => z.name === 'Function Room' || z.name === 'Private Room'),
  );
  const nearBGC = restaurants.filter((r) => r.address.includes('BGC'));

  return (
    <Screen>
      <View className="pb-1 pt-2">
        <Text variant="caption" className="uppercase tracking-wide text-mute">
          Mesa Hospitality Group
        </Text>
        <Text variant="display" className="mt-1">
          {greeting(now.time)}
        </Text>
        <Text variant="body" className="mt-1 text-mute">
          Book a table across BGC, Poblacion and Makati.
        </Text>
      </View>

      <View className="mt-4">
        <QuickBookBar
          date={date}
          party={party}
          time={time}
          onDate={setDate}
          onParty={setParty}
          onTime={setTime}
          onFind={() => setIsFiltering(true)}
          onClear={() => setIsFiltering(false)}
          isFiltering={isFiltering}
        />
      </View>

      {isFiltering ? (
        <View className="mt-7">
          <Text variant="heading">Available tables</Text>
          <Text variant="caption" className="mt-0.5 text-mute">
            Party of {party} · {filtered.filter((f) => f.availability.result.level !== 'unavailable').length} of{' '}
            {filtered.length} can seat you
          </Text>
          {filtered.length === 0 ? (
            <EmptyState className="mt-6" title="No restaurants" message="Nothing to show right now." icon={SearchX} />
          ) : (
            <View className="mt-3 flex-row flex-wrap justify-between">
              {filtered.map((f) => renderCard(f.restaurant, f.availability))}
            </View>
          )}
        </View>
      ) : (
        <>
          {section('Tonight', 'Where Manila is dining today', restaurants)}
          {section('Good for celebrations', 'Function and private rooms for the big ones', celebrations)}
          {section('Near BGC', 'Walkable from the office', nearBGC)}
        </>
      )}
    </Screen>
  );
}
