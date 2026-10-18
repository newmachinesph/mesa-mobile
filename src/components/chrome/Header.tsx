import type { ReactNode } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { IconButton } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

export interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean; // default true
  onBack?: () => void; // default router.back()
  right?: ReactNode;
  className?: string;
}

export function Header({ title, subtitle, showBack = true, onBack, right, className }: HeaderProps) {
  const router = useRouter();
  const back = onBack ?? (() => router.back());

  return (
    <View className={cn('border-b border-line bg-paper', className)}>
      <View className="w-full max-w-[720px] self-center flex-row items-center justify-between px-3 py-2.5">
        <View className="w-11 items-start">
          {showBack ? <IconButton icon={ChevronLeft} accessibilityLabel="Go back" variant="ghost" onPress={back} /> : null}
        </View>
        <View className="flex-1 items-center px-2">
          {title ? (
            <Text variant="heading" numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text variant="caption" className="text-mute" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
        <View className="w-11 items-end">{right}</View>
      </View>
    </View>
  );
}
