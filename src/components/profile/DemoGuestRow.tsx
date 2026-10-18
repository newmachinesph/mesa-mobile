import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { tagsFor, type Guest } from '@/core';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { GuestAvatar } from './GuestAvatar';

interface DemoGuestRowProps {
  guest: Guest;
  description: string;
  bookingCount: number;
  selected: boolean;
  onSelect: () => void;
}

// A selectable guest in the demo switcher. Selecting one re-points the whole app.
export function DemoGuestRow({ guest, description, bookingCount, selected, onSelect }: DemoGuestRowProps) {
  const isVip = tagsFor(guest).some((t) => t.label === 'VIP');
  const bookings =
    bookingCount === 0 ? 'No bookings yet' : `${bookingCount} booking${bookingCount === 1 ? '' : 's'}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onSelect}
      className={cn(
        'flex-row items-center gap-3 rounded-2xl border p-3',
        selected ? 'border-terracotta bg-[#f7e9e4]' : 'border-line bg-chalk',
      )}
    >
      <GuestAvatar name={guest.name} vip={isVip} />
      <View className="flex-1">
        <Text variant="label" numberOfLines={1}>
          {guest.name}
        </Text>
        <Text variant="caption" className="mt-0.5 text-mute">
          {description}
        </Text>
        <Text variant="caption" className="mt-1.5 text-mute">
          {bookings}
        </Text>
      </View>
      {selected ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-terracotta">
          <Check size={14} color="#ffffff" strokeWidth={3} />
        </View>
      ) : (
        <View className="h-6 w-6 rounded-full border border-line" />
      )}
    </Pressable>
  );
}
