import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarHeart } from 'lucide-react-native';
import { todayISO, type Reservation } from '@/core';
import { useMyReservations, useMesaStore } from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/ui/card';
import { PrimaryButton } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookingRow } from '@/app/booking/_components/BookingRow';

type Segment = 'upcoming' | 'past';

// Past = a finished/dead booking, or one whose date has gone by.
function isPast(r: Reservation, today: string): boolean {
  if (r.status === 'completed' || r.status === 'cancelled' || r.status === 'no_show') return true;
  return r.dateISO < today;
}

function Segments({
  value,
  onChange,
  upcomingCount,
  pastCount,
}: {
  value: Segment;
  onChange: (s: Segment) => void;
  upcomingCount: number;
  pastCount: number;
}) {
  const tabs: { key: Segment; label: string }[] = [
    { key: 'upcoming', label: `Upcoming (${upcomingCount})` },
    { key: 'past', label: `Past (${pastCount})` },
  ];
  return (
    <View className="flex-row rounded-xl border border-line bg-sand p-1">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(t.key)}
            className={cn('flex-1 items-center rounded-lg py-2', active && 'border border-line bg-chalk')}
          >
            <Text className={cn('font-bold text-[13px]', active ? 'text-terracotta' : 'text-mute')}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const reservations = useMyReservations();
  const restaurants = useMesaStore((s) => s.restaurants);
  const [tab, setTab] = useState<Segment>('upcoming');
  const today = todayISO();

  const { upcoming, past } = useMemo(() => {
    const up: Reservation[] = [];
    const pa: Reservation[] = [];
    for (const r of reservations) (isPast(r, today) ? pa : up).push(r);
    // Upcoming: soonest first. Past: most recent first.
    up.sort((a, b) => (a.dateISO === b.dateISO ? a.time.localeCompare(b.time) : a.dateISO.localeCompare(b.dateISO)));
    pa.sort((a, b) => (a.dateISO === b.dateISO ? b.time.localeCompare(a.time) : b.dateISO.localeCompare(a.dateISO)));
    return { upcoming: up, past: pa };
  }, [reservations, today]);

  const list = tab === 'upcoming' ? upcoming : past;
  const restaurantFor = (id: string) => restaurants.find((r) => r.id === id);

  return (
    <Screen>
      <View className="pb-1 pt-2">
        <Text variant="caption" className="uppercase tracking-wide text-mute">
          Your table
        </Text>
        <Text variant="display" className="mt-1">
          My bookings
        </Text>
      </View>

      <View className="mt-4">
        <Segments value={tab} onChange={setTab} upcomingCount={upcoming.length} pastCount={past.length} />
      </View>

      <View className="mt-5">
        {list.length === 0 ? (
          tab === 'upcoming' ? (
            <EmptyState
              className="mt-8"
              title="No bookings yet"
              message="When you reserve a table, it shows up here — with your deposit and confirmation."
              icon={CalendarHeart}
              action={
                <View className="w-[220px]">
                  <PrimaryButton onPress={() => router.push('/')} fullWidth>
                    Find a table
                  </PrimaryButton>
                </View>
              }
            />
          ) : (
            <EmptyState className="mt-8" title="Nothing past yet" message="Your dining history will collect here." icon={CalendarHeart} />
          )
        ) : (
          list.map((r) => (
            <BookingRow key={r.id} reservation={r} restaurant={restaurantFor(r.restaurantId)} onPress={() => router.push(`/booking/${r.id}`)} />
          ))
        )}
      </View>
    </Screen>
  );
}
