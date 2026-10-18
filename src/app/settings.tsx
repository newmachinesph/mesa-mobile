import { View } from 'react-native';
import { toast } from 'sonner-native';
import { type Guest } from '@/core';
import { useMesaStore } from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Header } from '@/components/chrome/Header';
import { Text } from '@/components/ui/text';
import { Surface, Divider } from '@/components/ui/card';
import { DemoGuestRow } from '@/components/profile/DemoGuestRow';
import { PolicyCard } from '@/components/profile/PolicyCard';

// Curated demo guests. Descriptions are deterministic (tags/notes from the seed);
// booking counts are read live from the store below.
const DEMO_GUESTS: { id: string; description: string }[] = [
  { id: 'g-maria', description: 'VIP regular — brass treatment, an active party-of-14 celebration awaiting deposit proof.' },
  { id: 'g-marco', description: 'Repeat no-show — flagged "Problematic". See how the app surfaces risk, gently.' },
  { id: 'g-isabel', description: 'Allergy on file — a manual "shellfish" tag the kitchen must never miss.' },
  { id: 'g-katrina', description: 'Celebrations host — debut and anniversary bookings, deposits required.' },
  { id: 'g-juan', description: 'New diner — barely any history and no tags yet.' },
];

const ABOUT = [
  'Frontend-only and in-memory — all data lives in the app while it runs.',
  'No backend and no real payments. Proof-of-payment screenshots stay on this device.',
  'Reloading the app resets everything to the seeded starting point.',
  'All times are Asia/Manila, fixed at UTC+8. No daylight saving, ever.',
];

export default function SettingsScreen() {
  const currentGuestId = useMesaStore((s) => s.currentGuestId);
  const guests = useMesaStore((s) => s.guests);
  const reservations = useMesaStore((s) => s.reservations);
  const restaurants = useMesaStore((s) => s.restaurants);
  const setGuest = useMesaStore((s) => s.setGuest);

  const byId = (id: string): Guest | undefined => guests.find((g) => g.id === id);
  const countFor = (id: string): number => reservations.filter((r) => r.guestId === id).length;

  const select = (g: Guest) => {
    setGuest(g.id);
    toast.success(`Now browsing as ${g.name}`);
  };

  return (
    <Screen header={<Header title="Settings" subtitle="Demo controls" />}>
      {/* Demo guest switcher — the headline control */}
      <View className="pt-3">
        <Text variant="caption" className="uppercase tracking-wide text-terracotta">
          Demo control
        </Text>
        <Text variant="title" className="mt-1">
          Browse as…
        </Text>
        <Text variant="body" className="mt-1.5 text-mute">
          There&apos;s no login in this demo. Pick a guest and the whole app — profile, bookings and
          deposits — reflects them instantly.
        </Text>
      </View>

      <View className="mt-4 gap-2.5">
        {DEMO_GUESTS.map(({ id, description }) => {
          const g = byId(id);
          if (!g) return null;
          return (
            <DemoGuestRow
              key={id}
              guest={g}
              description={description}
              bookingCount={countFor(id)}
              selected={id === currentGuestId}
              onSelect={() => select(g)}
            />
          );
        })}
      </View>

      {/* Restaurant group + deposit policies */}
      <View className="mt-8">
        <Text variant="heading">Mesa Hospitality Group</Text>
        <Text variant="caption" className="mt-0.5 text-mute">
          Three rooms, three deposit policies.
        </Text>
        <Surface className="mt-3 px-4">
          {restaurants.map((r, i) => (
            <View key={r.id}>
              {i > 0 ? <Divider /> : null}
              <PolicyCard restaurant={r} />
            </View>
          ))}
        </Surface>
      </View>

      {/* About this demo */}
      <View className="mt-8">
        <Text variant="heading">About this demo</Text>
        <Surface className="mt-3 gap-2.5 p-4">
          {ABOUT.map((line) => (
            <View key={line} className="flex-row gap-2">
              <Text variant="body" className="text-mute">
                •
              </Text>
              <Text variant="body" className="flex-1 text-slate">
                {line}
              </Text>
            </View>
          ))}
        </Surface>
      </View>
    </Screen>
  );
}
