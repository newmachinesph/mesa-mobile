import { Tabs } from 'expo-router';
import { CalendarClock, Compass, User } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#b4563a',
        tabBarInactiveTintColor: '#6e6a5e',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e3ddd1',
          borderTopWidth: 1,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontFamily: 'HankenGrotesk_600SemiBold', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Discover', tabBarIcon: ({ color, size }) => <Compass color={color} size={size} strokeWidth={2} /> }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Bookings', tabBarIcon: ({ color, size }) => <CalendarClock color={color} size={size} strokeWidth={2} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <User color={color} size={size} strokeWidth={2} /> }}
      />
    </Tabs>
  );
}
