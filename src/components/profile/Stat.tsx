import { View } from 'react-native';
import { Text } from '@/components/ui/text';

interface StatProps {
  value: string | number;
  label: string;
}

// One figure in the stats row. Sized to share width via flex-1.
export function Stat({ value, label }: StatProps) {
  return (
    <View className="flex-1 items-center">
      <Text variant="title">{value}</Text>
      <Text variant="caption" className="mt-1 text-mute">
        {label}
      </Text>
    </View>
  );
}
