import { type ReactNode, useEffect } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Flat white surface with a hairline border — depth from the rule, not a heavy shadow.
export interface SurfaceProps extends ViewProps {
  className?: string;
  children?: ReactNode;
}
export function Surface({ className, children, ...props }: SurfaceProps) {
  return (
    <View className={cn('rounded-2xl border border-line bg-chalk', className)} {...props}>
      {children}
    </View>
  );
}

export interface CardProps {
  children?: ReactNode;
  onPress?: () => void;
  className?: string;
}
export function Card({ children, onPress, className }: CardProps) {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const base = cn('rounded-2xl border border-line bg-chalk p-4', className);
  if (!onPress) return <View className={base}>{children}</View>;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      onPress={onPress}
      onPressIn={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value; `.value` writes are its API, not a real mutation
        scale.value = withTiming(0.985, { duration: 90 });
      }}
      onPressOut={() => {
        // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
        scale.value = withTiming(1, { duration: 130 });
      }}
      style={style}
      className={base}
    >
      {children}
    </AnimatedPressable>
  );
}

export interface DividerProps {
  vertical?: boolean;
  className?: string;
}
export function Divider({ vertical, className }: DividerProps) {
  return <View className={cn(vertical ? 'w-px self-stretch' : 'h-px w-full', 'bg-line', className)} />;
}

export interface RowProps extends ViewProps {
  children?: ReactNode;
  className?: string;
}
export function Row({ children, className, ...props }: RowProps) {
  return (
    <View className={cn('flex-row items-center justify-between', className)} {...props}>
      {children}
    </View>
  );
}

export interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}
export function EmptyState({ title, message, icon: Icon, action, className }: EmptyStateProps) {
  return (
    <View className={cn('items-center justify-center px-6 py-12', className)}>
      {Icon ? (
        <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-sand">
          <Icon size={24} color="#6e6a5e" strokeWidth={2} />
        </View>
      ) : null}
      <Text variant="heading" className="text-center">
        {title}
      </Text>
      {message ? (
        <Text variant="body" className="mt-1.5 max-w-[280px] text-center text-mute">
          {message}
        </Text>
      ) : null}
      {action ? <View className="mt-5">{action}</View> : null}
    </View>
  );
}

// Pulsing placeholder block. Size it with className (e.g. "h-4 w-32").
export function Skeleton({ className }: { className?: string }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={style} className={cn('rounded-lg bg-sand', className)} />;
}
