import type { ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { cn } from '@/lib/utils';

export interface ScreenProps {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  scroll?: boolean; // default true
  edges?: Edge[]; // safe-area edges, default ['top']
  className?: string; // extra classes on the content container
}

// Paper-backed screen. On tablet/web (>=768px) content is centered at max 720px.
export function Screen({ children, header, footer, scroll = true, edges = ['top'], className }: ScreenProps) {
  const { width } = useWindowDimensions();
  const wide = width >= 768;
  const content = cn('w-full self-center px-5', wide && 'max-w-[720px] px-8', className);

  return (
    <SafeAreaView edges={edges} className="flex-1 bg-paper">
      {header}
      {scroll ? (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={cn('grow pb-8', content)}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={cn('flex-1', content)}>{children}</View>
      )}
      {footer ? (
        <View className="border-t border-line bg-paper px-5 py-3">
          <View className={cn('w-full self-center', wide && 'max-w-[720px]')}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
