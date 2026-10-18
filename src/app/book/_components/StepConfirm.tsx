import { Platform, View } from 'react-native';
import { useFormContext } from 'react-hook-form';
import { toast } from 'sonner-native';
import { CalendarDays, Clock, Copy, ShieldAlert, Users } from 'lucide-react-native';
import {
  depositAmount,
  depositRequired,
  formatDateLong,
  formatPeso,
  formatPhoneLocal,
  formatTime12,
  paymentMethodLabel,
  type Restaurant,
} from '@/core';
import { Surface, Divider, Row } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { OccasionChip } from '@/components/ui/pill';
import { IconButton } from '@/components/ui/button';
import type { BookingForm } from './schema';

async function copyToClipboard(value: string, label: string): Promise<void> {
  // ponytail: web-only real copy; native needs expo-clipboard (not installed, deps
  // frozen). On native we surface the value in a toast and leave the number
  // selectable so it can be long-pressed. Add expo-clipboard to unify both paths.
  try {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
      return;
    }
  } catch {
    // fall through to the toast fallback
  }
  toast(`${label}: ${value}`);
}

function SummaryRow({ icon: Icon, label, value }: { icon: typeof Clock; label: string; value: string }) {
  return (
    <Row className="py-2.5">
      <View className="flex-row items-center gap-2.5">
        <Icon size={17} color="#6e6a5e" strokeWidth={2} />
        <Text variant="body" className="text-mute">
          {label}
        </Text>
      </View>
      <Text variant="body" className="font-semibold text-ink">
        {value}
      </Text>
    </Row>
  );
}

export interface StepConfirmProps {
  restaurant: Restaurant;
}

export function StepConfirm({ restaurant }: StepConfirmProps) {
  const { watch } = useFormContext<BookingForm>();
  const values = watch();
  const policy = restaurant.depositPolicy;
  const needsDeposit = depositRequired(policy, values.partySize);
  const amount = depositAmount(policy, values.partySize);

  return (
    <View className="gap-5">
      <Surface className="p-4">
        <Text variant="label" className="text-mute">
          {restaurant.name}
        </Text>
        <SummaryRow icon={CalendarDays} label="Date" value={formatDateLong(values.dateISO)} />
        <Divider />
        <SummaryRow icon={Clock} label="Time" value={formatTime12(values.time)} />
        <Divider />
        <SummaryRow
          icon={Users}
          label="Party"
          value={`${values.partySize} ${values.partySize === 1 ? 'guest' : 'guests'}`}
        />
        <Divider />
        <Row className="pt-2.5">
          <View>
            <Text variant="body" className="font-semibold text-ink">
              {values.name}
            </Text>
            <Text variant="caption" className="mt-0.5 text-mute">
              {formatPhoneLocal(values.phone)}
            </Text>
          </View>
          {values.occasion ? <OccasionChip occasion={values.occasion} /> : null}
        </Row>
        {values.notes.trim() ? (
          <View className="mt-3 rounded-xl bg-sand px-3 py-2.5">
            <Text variant="caption" className="text-mute">
              Note
            </Text>
            <Text variant="body" className="mt-0.5 text-slate">
              {values.notes.trim()}
            </Text>
          </View>
        ) : null}
      </Surface>

      {needsDeposit ? (
        <Surface className="p-4">
          <Row>
            <Text variant="heading">Deposit to confirm</Text>
            <Text variant="title" className="text-terracotta">
              {formatPeso(amount)}
            </Text>
          </Row>
          <Text variant="caption" className="mt-0.5 text-mute">
            {policy.perHead
              ? `${formatPeso(policy.amount)} per head × ${values.partySize} guests`
              : `Flat ${formatPeso(policy.amount)} to hold your table`}
          </Text>

          {policy.nonRefundable ? (
            <View className="mt-3 flex-row items-start gap-2 rounded-xl bg-warn-bg px-3 py-2.5">
              <ShieldAlert size={16} color="#b5730f" strokeWidth={2.25} />
              <Text variant="caption" className="flex-1 text-warn">
                This deposit is non-refundable — it goes toward your bill on the night.
              </Text>
            </View>
          ) : null}

          <Divider className="my-4" />

          <Text variant="label" className="text-slate">
            Send your deposit to
          </Text>
          <View className="mt-2 gap-2">
            <Row className="rounded-xl border border-line bg-chalk px-3 py-2.5">
              <View>
                <Text variant="caption" className="text-mute">
                  GCash number
                </Text>
                <Text variant="heading" selectable className="mt-0.5 text-ink">
                  {policy.gcashNumber}
                </Text>
              </View>
              <IconButton
                icon={Copy}
                accessibilityLabel="Copy GCash number"
                onPress={() => copyToClipboard(policy.gcashNumber, 'GCash number')}
              />
            </Row>
            <Row className="rounded-xl border border-line bg-chalk px-3 py-2.5">
              <View className="flex-1 pr-2">
                <Text variant="caption" className="text-mute">
                  Account name
                </Text>
                <Text variant="body" selectable className="mt-0.5 font-semibold text-ink">
                  {policy.gcashName}
                </Text>
              </View>
              <IconButton
                icon={Copy}
                accessibilityLabel="Copy account name"
                onPress={() => copyToClipboard(policy.gcashName, 'Account name')}
              />
            </Row>
          </View>
          <Text variant="caption" className="mt-2 text-mute">
            Also accepts {policy.methods.map(paymentMethodLabel).join(', ')}.
          </Text>

          <View className="mt-4 rounded-xl bg-sand px-3 py-3">
            <Text variant="body" className="text-slate">
              Book now, then send your deposit and upload the proof of payment. Your table is held
              for 2 hours while we verify it.
            </Text>
          </View>
        </Surface>
      ) : (
        <Surface className="p-4">
          <Text variant="body" className="text-slate">
            No deposit needed for this booking. We&apos;ll hold your table and confirm shortly — salamat!
          </Text>
        </Surface>
      )}
    </View>
  );
}
