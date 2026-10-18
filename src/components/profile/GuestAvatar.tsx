import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

// 'Maria Santos' -> 'MS'. Single-word names give one initial.
function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '?';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

interface GuestAvatarProps {
  name: string;
  vip?: boolean;
  size?: number; // px, default 44
  className?: string;
}

// Initials disc. VIP gets the brass ring — brass is reserved for VIP/celebrations.
export function GuestAvatar({ name, vip = false, size = 44, className }: GuestAvatarProps) {
  return (
    <View
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={cn(
        'items-center justify-center border',
        vip ? 'border-[#c9973f] bg-[#f5e9d2]' : 'border-line bg-sand',
        className,
      )}
    >
      <Text style={{ fontSize: Math.round(size * 0.36) }} className={cn('font-bold', vip ? 'text-brass' : 'text-slate')}>
        {initials(name)}
      </Text>
    </View>
  );
}
