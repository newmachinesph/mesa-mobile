import { View } from 'react-native';
import { formatPeso, paymentMethodLabel, type Restaurant } from '@/core';
import { Text } from '@/components/ui/text';

// One restaurant + its deposit policy, summarised for the demo settings screen.
export function PolicyCard({ restaurant: r }: { restaurant: Restaurant }) {
  const p = r.depositPolicy;
  const amount = p.perHead
    ? `${formatPeso(p.amount)} per head`
    : `${formatPeso(p.amount)} to hold the table`;

  return (
    <View className="py-3.5">
      <View className="flex-row items-center justify-between">
        <Text variant="label" className="flex-1 pr-2" numberOfLines={1}>
          {r.name}
        </Text>
        <Text variant="caption" className="text-mute">
          {r.priceBand}
        </Text>
      </View>
      <Text variant="caption" className="mt-0.5 text-mute">
        {r.cuisine} · {r.address}
      </Text>
      <View className="mt-2.5 rounded-xl bg-sand px-3 py-2.5">
        <Text variant="caption" className="text-slate">
          Deposit {amount} for parties of {p.requiredFromPartySize}+.{' '}
          {p.nonRefundable ? 'Non-refundable.' : 'Refundable.'}
        </Text>
        <Text variant="caption" className="mt-1 text-mute">
          {p.methods.map(paymentMethodLabel).join(' · ')} — GCash {p.gcashNumber}
        </Text>
      </View>
    </View>
  );
}
