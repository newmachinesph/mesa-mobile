import { type ReactNode, useState } from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { Skeleton } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Photographic hero with a real loading skeleton (the Unsplash image is the only
// genuinely async thing on these screens). `children` render as overlays on top.
export function HeroImage({
  uri,
  height,
  className,
  children,
}: {
  uri: string;
  height: number;
  className?: string;
  children?: ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  return (
    <View className={cn('relative overflow-hidden bg-sand', className)} style={{ height }}>
      {!loaded ? <Skeleton className="absolute inset-0 rounded-none" /> : null}
      <Image
        source={{ uri }}
        contentFit="cover"
        transition={250}
        onLoad={() => setLoaded(true)}
        style={{ width: '100%', height }}
      />
      {children}
    </View>
  );
}
