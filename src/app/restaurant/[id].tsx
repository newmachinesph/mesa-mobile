import { useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CalendarX, MapPin, Sparkles } from 'lucide-react-native';
import {
  depositAmount,
  formatPeso,
  formatTime12,
  paymentMethodLabel,
  weekdayOf,
  type Restaurant,
  type Schedule,
} from '@/core';
import { useRestaurant, useScheduleFor } from '@/lib/store';
import { Screen } from '@/components/chrome/Screen';
import { Header } from '@/components/chrome/Header';
import { Text } from '@/components/ui/text';
import { Surface, Divider, Row, EmptyState } from '@/components/ui/card';
import { DateStrip } from '@/components/ui/date-strip';
import { PartySizeStepper } from '@/components/ui/field';
import { PrimaryButton } from '@/components/ui/button';
import { HeroImage } from '@/app/restaurant/_components/HeroImage';
import { OpenStatusChip, nowManila } from '@/app/restaurant/_components/OpenStatusChip';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Mon-first for a natural hours listing
const HOLIDAYS: Record<string, string> = {
  '01-01': "New Year's Day",
  '06-12': 'Independence Day',
  '12-25': 'Christmas',
  '12-30': 'Rizal Day',
  '12-31': "New Year's Eve",
};

function shortDate(dateISO: string): string {
  const [, m, d] = dateISO.split('-').map(Number);
  const holiday = HOLIDAYS[dateISO.slice(5)];
  return holiday ? `${d} ${MONTHS[m - 1]} (${holiday})` : `${d} ${MONTHS[m - 1]}`;
}

function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="label" className="mb-2.5 mt-7 uppercase tracking-wide text-mute">
      {children}
    </Text>
  );
}

function ZonesCard({ restaurant }: { restaurant: Restaurant }) {
  const stats = restaurant.zones.map((z) => {
    const tables = restaurant.tables.filter((t) => t.zoneId === z.id);
    const seats = tables.reduce((sum, t) => sum + t.seats, 0);
    return { zone: z, tables: tables.length, seats };
  });
  return (
    <Surface className="p-4">
      {stats.map((s, i) => (
        <View key={s.zone.id}>
          {i > 0 ? <Divider className="my-3" /> : null}
          <Row>
            <Text variant="heading" className="text-[16px]">
              {s.zone.name}
            </Text>
            <Text variant="caption" className="text-mute">
              {s.tables} {s.tables === 1 ? 'table' : 'tables'} · {s.seats} seats
            </Text>
          </Row>
        </View>
      ))}
    </Surface>
  );
}

function DepositCard({ restaurant }: { restaurant: Restaurant }) {
  const p = restaurant.depositPolicy;
  if (!p.required) {
    return (
      <Surface className="p-4">
        <Text variant="body">No deposit needed — just pick a time and book.</Text>
      </Surface>
    );
  }
  const per = p.perHead ? 'per head' : 'to hold your table';
  const example = depositAmount(p, p.requiredFromPartySize);
  return (
    <Surface className="p-4">
      <View className="flex-row items-center gap-1.5">
        <Sparkles size={16} color="#c9973f" strokeWidth={2.25} />
        <Text variant="heading" className="text-[16px]">
          Parties of {p.requiredFromPartySize} and up
        </Text>
      </View>
      <Text variant="body" className="mt-2">
        {formatPeso(p.amount)} {per} — a table of {p.requiredFromPartySize} comes to {formatPeso(example)}.
      </Text>
      <Text variant="body" className="mt-2">
        Send via GCash to {p.gcashNumber} ({p.gcashName}), then upload your screenshot of the proof of payment against
        this booking.
      </Text>
      {p.nonRefundable ? (
        <Text variant="caption" className="mt-2 text-mute">
          Deposit is non-refundable and goes toward your bill on the night.
        </Text>
      ) : null}

      <Divider className="my-3.5" />
      <Text variant="caption" className="mb-2 text-mute">
        Accepted payment
      </Text>
      <View className="flex-row flex-wrap gap-2">
        {p.methods.map((m) => (
          <View key={m} className="rounded-full bg-sand px-3 py-1">
            <Text className="text-[12px] font-semibold text-slate">{paymentMethodLabel(m)}</Text>
          </View>
        ))}
      </View>
    </Surface>
  );
}

function HoursCard({ schedule, todayWeekday }: { schedule: Schedule; todayWeekday: number }) {
  return (
    <Surface className="p-4">
      {WEEK_ORDER.map((w, i) => {
        const day = schedule.days.find((d) => d.weekday === w);
        const isToday = w === todayWeekday;
        const shifts = day && !day.closed ? day.shifts : [];
        return (
          <View key={w}>
            {i > 0 ? <Divider className="my-3" /> : null}
            <View className="flex-row justify-between">
              <Text className={cnName(isToday)}>{WEEKDAYS_LONG[w]}</Text>
              <View className="items-end">
                {shifts.length === 0 ? (
                  <Text variant="body" className="text-mute">
                    Closed
                  </Text>
                ) : (
                  shifts.map((shift, si) => (
                    <View key={shift.id} className="items-end">
                      {si > 0 ? (
                        <Text variant="caption" className="text-mute">
                          Closed {formatTime12(shifts[si - 1].end)} – {formatTime12(shift.start)}
                        </Text>
                      ) : null}
                      <Text variant="body" className={isToday ? 'font-semibold text-ink' : 'text-slate'}>
                        {formatTime12(shift.start)} – {formatTime12(shift.end)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </View>
        );
      })}
    </Surface>
  );
}

function cnName(isToday: boolean): string {
  return isToday ? 'font-bold text-[15px] text-terracotta' : 'font-semibold text-[15px] text-ink';
}

export default function RestaurantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = useRestaurant(id);
  const schedule = useScheduleFor(id);

  const now = nowManila();
  const [date, setDate] = useState(now.dateISO);
  const [party, setParty] = useState(2);

  if (!restaurant || !schedule) {
    return (
      <Screen header={<Header title="Restaurant" />} scroll={false}>
        <EmptyState
          className="flex-1"
          title="Restaurant not found"
          message="This restaurant may have moved or is no longer listed."
          icon={CalendarX}
        />
      </Screen>
    );
  }

  const upcomingClosed = schedule.closedDates.filter((d) => d >= now.dateISO).sort();

  const checkAvailability = () =>
    router.push(`/book/${restaurant.id}?date=${date}&party=${party}`);

  const footer = (
    <View>
      <DateStrip selectedDate={date} onSelect={setDate} schedule={schedule} days={12} />
      <View className="mt-3 flex-row items-center gap-3">
        <View className="flex-1">
          <PartySizeStepper value={party} onChange={setParty} />
        </View>
        <View className="w-[150px]">
          <PrimaryButton onPress={checkAvailability} fullWidth>
            Check availability
          </PrimaryButton>
        </View>
      </View>
    </View>
  );

  return (
    <Screen header={<Header title={restaurant.name} />} footer={footer}>
      <View className="mt-2">
        <HeroImage uri={restaurant.heroImage} height={220} className="rounded-2xl">
          <View className="absolute right-3 top-3 rounded-full bg-chalk/90 px-2.5 py-1">
            <Text className="text-[13px] font-bold text-ink">{restaurant.priceBand}</Text>
          </View>
          <View className="absolute bottom-3 left-3">
            <OpenStatusChip schedule={schedule} dateISO={now.dateISO} time={now.time} className="bg-chalk/90" />
          </View>
        </HeroImage>
      </View>

      <Text variant="title" className="mt-4">
        {restaurant.name}
      </Text>
      <Text variant="body" className="mt-1 text-mute">
        {restaurant.cuisine} · {restaurant.priceBand}
      </Text>
      <View className="mt-2 flex-row items-center gap-1.5">
        <MapPin size={15} color="#6e6a5e" strokeWidth={2} />
        <Text variant="body" className="flex-1 text-slate">
          {restaurant.address}
        </Text>
      </View>
      <Text variant="body" className="mt-3">
        {restaurant.blurb}
      </Text>

      <SectionTitle>Rooms</SectionTitle>
      <ZonesCard restaurant={restaurant} />

      <SectionTitle>Deposit policy</SectionTitle>
      <DepositCard restaurant={restaurant} />

      <SectionTitle>Hours</SectionTitle>
      <HoursCard schedule={schedule} todayWeekday={weekdayOf(now.dateISO)} />
      {upcomingClosed.length > 0 ? (
        <Surface className="mt-3 p-4">
          {upcomingClosed.map((d, i) => (
            <View key={d}>
              {i > 0 ? <Divider className="my-3" /> : null}
              <View className="flex-row items-center gap-1.5">
                <CalendarX size={15} color="#6e6a5e" strokeWidth={2} />
                <Text variant="body" className="text-slate">
                  Closed {shortDate(d)}
                </Text>
              </View>
            </View>
          ))}
        </Surface>
      ) : null}
    </Screen>
  );
}
