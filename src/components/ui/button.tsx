import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Shared press feedback: gentle scale-down. Web-safe (plain timing on a shared value).
function usePressScale() {
  const scale = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return {
    style,
    onPressIn: () => {
      // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value; `.value` writes are its API, not a real mutation
      scale.value = withTiming(0.97, { duration: 90 });
    },
    onPressOut: () => {
      // eslint-disable-next-line react-hooks/immutability -- Reanimated shared value
      scale.value = withTiming(1, { duration: 130 });
    },
  };
}

type Variant = 'primary' | 'secondary' | 'ghost';

const VARIANTS: Record<Variant, { container: string; label: string; iconColor: string; spinner: string }> = {
  primary: { container: 'bg-terracotta', label: 'text-chalk', iconColor: '#ffffff', spinner: '#ffffff' },
  secondary: { container: 'bg-chalk border border-line', label: 'text-ink', iconColor: '#17150f', spinner: '#17150f' },
  ghost: { container: 'bg-transparent', label: 'text-terracotta', iconColor: '#b4563a', spinner: '#b4563a' },
};

export interface ButtonProps {
  children?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: LucideIcon;
  fullWidth?: boolean;
  className?: string;
}

function Button({ variant, children, onPress, disabled, loading, icon: Icon, fullWidth, className }: ButtonProps & { variant: Variant }) {
  const press = usePressScale();
  const v = VARIANTS[variant];
  const inert = disabled || loading;
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inert, busy: loading }}
      disabled={inert}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={press.style}
      className={cn(
        'h-12 flex-row items-center justify-center gap-2 rounded-xl px-5',
        v.container,
        fullWidth && 'w-full',
        inert && 'opacity-40',
        className,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.spinner} />
      ) : (
        <>
          {Icon ? <Icon size={18} color={v.iconColor} strokeWidth={2.25} /> : null}
          {typeof children === 'string' ? (
            <Text className={cn('font-bold text-[15px] leading-[18px]', v.label)}>{children}</Text>
          ) : (
            children
          )}
        </>
      )}
    </AnimatedPressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <Button variant="primary" {...props} />;
}
export function SecondaryButton(props: ButtonProps) {
  return <Button variant="secondary" {...props} />;
}
export function GhostButton(props: ButtonProps) {
  return <Button variant="ghost" {...props} />;
}

type IconVariant = 'solid' | 'surface' | 'ghost';

const ICON_VARIANTS: Record<IconVariant, { container: string; color: string }> = {
  solid: { container: 'bg-terracotta', color: '#ffffff' },
  surface: { container: 'bg-chalk border border-line', color: '#17150f' },
  ghost: { container: 'bg-transparent', color: '#3a372f' },
};

export interface IconButtonProps {
  icon: LucideIcon;
  accessibilityLabel: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: IconVariant;
  size?: number;
  className?: string;
}

export function IconButton({
  icon: Icon,
  accessibilityLabel,
  onPress,
  disabled,
  variant = 'surface',
  size = 20,
  className,
}: IconButtonProps) {
  const press = usePressScale();
  const v = ICON_VARIANTS[variant];
  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={press.style}
      className={cn(
        'h-11 w-11 items-center justify-center rounded-full',
        v.container,
        disabled && 'opacity-40',
        className,
      )}
    >
      <Icon size={size} color={v.color} strokeWidth={2.25} />
    </AnimatedPressable>
  );
}
