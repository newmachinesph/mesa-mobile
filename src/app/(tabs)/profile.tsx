import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarX, Phone, Settings, Sparkles, UserRound } from 'lucide-react-native';
import { formatDateLong, formatPhoneLocal, tagsFor, todayISO } from '@/core';
import { useCurrentGuest, useMyReservations, useMesaStore } from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Text } from '@/components/ui/text';
import { Surface, Divider, Row, EmptyState } from '@/components/ui/card';
import { IconButton, PrimaryButton } from '@/components/ui/button';
import { TagChip, OccasionChip } from '@/components/ui/pill';
import { GuestAvatar } from '@/components/profile/GuestAvatar';
import { Stat } from '@/components/profile/Stat';
import { VisitRow } from '@/components/profile/VisitRow';

export default function ProfileScreen() {
  const router = useRouter();
  const guest = useCurrentGuest();
  const myReservations = useMyReservations();
  const restaurants = useMesaStore((s) => s.restaurants);

  const openSettings = () => router.push('/settings');

  if (!guest) {
    return (
      <Screen>
        <EmptyState
          className="mt-16"
          title="No guest selected"
          message="Pick a demo guest in settings to explore the app as them."
          icon={UserRound}
          action={
            <PrimaryButton icon={Settings} onPress={openSettings}>
              Open settings
            </PrimaryButton>
          }
        />
      </Screen>
    );
  }

  const tags = tagsFor(guest);
  const isVip = tags.some((t) => t.label === 'VIP');
  const today = todayISO();
  const nameOf = (id: string): string => restaurants.find((r) => r.id === id)?.name ?? 'Mesa';

  // History = the guest's bookings up to today, newest first (date then time).
  const history = myReservations
    .filter((r) => r.dateISO <= today)
    .sort((a, b) => (b.dateISO + b.time).localeCompare(a.dateISO + a.time));

  return (
    <Screen>
      <Row className="pt-2">
        <Text variant="caption" className="uppercase tracking-wide text-mute">
          Your profile
        </Text>
        <IconButton icon={Settings} accessibilityLabel="Demo settings" onPress={openSettings} />
      </Row>

      {/* Header card */}
      <Surface className="mt-3 p-5">
        <View className="flex-row items-center gap-4">
          <GuestAvatar name={guest.name} vip={isVip} size={56} />
          <View className="flex-1">
            <Text variant="title" numberOfLines={1}>
              {guest.name}
            </Text>
            <Text variant="body" className="mt-0.5 text-mute">
              {formatPhoneLocal(guest.phone)}
            </Text>
          </View>
        </View>

        {isVip ? (
          <View className="mt-4 flex-row items-center gap-2 rounded-xl bg-[#f5e9d2] px-3 py-2.5">
            <Sparkles size={15} color="#c9973f" strokeWidth={2.25} />
            <Text variant="caption" className="flex-1 text-brass">
              VIP — one of Mesa&apos;s most valued regulars. Expect the warmest table in the house.
            </Text>
          </View>
        ) : null}

        <Divider className="mt-4" />
        <Text variant="caption" className="mt-3 text-mute">
          {guest.firstVisit ? `Dining with Mesa since ${formatDateLong(guest.firstVisit)}` : 'New to Mesa'}
        </Text>
      </Surface>

      {/* Stats */}
      <Surface className="mt-4 p-5">
        <Row className="items-stretch">
          <Stat value={guest.visitCount} label="Visits" />
          <Divider vertical className="mx-2" />
          <Stat value={guest.noShowCount} label="No-shows" />
          <Divider vertical className="mx-2" />
          <Stat value={guest.occasions.length} label="Celebrations" />
        </Row>
        <Text variant="caption" className="mt-4 text-mute">
          A no-show is just a booking that couldn&apos;t happen — life gets in the way. Restaurants ask
          for a deposit on bigger tables so a held table doesn&apos;t go to waste, never as a penalty.
        </Text>
      </Surface>

      {/* Your tags */}
      <View className="mt-7">
        <Text variant="heading">Your tags</Text>
        <Text variant="caption" className="mt-0.5 text-mute">
          Restaurants use these to look after you.
        </Text>
        {tags.length === 0 ? (
          <Text variant="body" className="mt-3 text-mute">
            No tags yet — they appear as you dine with us.
          </Text>
        ) : (
          <View className="mt-3 flex-row flex-wrap items-center gap-x-3 gap-y-2">
            {tags.map((t) => (
              <View key={t.id} className="flex-row items-center gap-1.5">
                <TagChip tag={t} />
                {t.kind === 'auto' ? (
                  <Text variant="caption" className="text-mute">
                    Auto
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Visit history */}
      <View className="mt-7">
        <Text variant="heading">Visit history</Text>
        <Text variant="caption" className="mt-0.5 text-mute">
          Your past bookings with Mesa, newest first.
        </Text>
        {history.length === 0 ? (
          <EmptyState
            className="mt-4"
            title="No visits yet"
            message="Your completed bookings will show up here."
            icon={CalendarX}
          />
        ) : (
          <Surface className="mt-3 px-4">
            {history.map((r, i) => (
              <View key={r.id}>
                {i > 0 ? <Divider /> : null}
                <VisitRow reservation={r} restaurantName={nameOf(r.restaurantId)} />
              </View>
            ))}
          </Surface>
        )}
      </View>

      {/* Saved details */}
      <View className="mt-7">
        <Text variant="heading">Saved details</Text>
        <Text variant="caption" className="mt-0.5 text-mute">
          We prefill these when you book.
        </Text>
        <Surface className="mt-3 p-4">
          <Row className="items-center">
            <View className="flex-row items-center gap-2">
              <Phone size={15} color="#6e6a5e" strokeWidth={2.25} />
              <Text variant="label">Mobile</Text>
            </View>
            <Text variant="body">{formatPhoneLocal(guest.phone)}</Text>
          </Row>

          <Divider className="my-3.5" />

          <Text variant="label">Occasions you celebrate</Text>
          {guest.occasions.length === 0 ? (
            <Text variant="body" className="mt-1.5 text-mute">
              None saved yet.
            </Text>
          ) : (
            <View className="mt-2.5 flex-row flex-wrap gap-2">
              {guest.occasions.map((o) => (
                <OccasionChip key={o} occasion={o} />
              ))}
            </View>
          )}

          {guest.notes ? (
            <>
              <Divider className="my-3.5" />
              <Text variant="label">A note for the table</Text>
              <Text variant="body" className="mt-1.5 text-slate">
                {guest.notes}
              </Text>
            </>
          ) : null}
        </Surface>
      </View>
    </Screen>
  );
}
