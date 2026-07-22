import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { colors, typography } from '@/src/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandDeepRose,
        tabBarInactiveTintColor: colors.onSurfaceTertiary,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.borderInk,
          borderTopWidth: 2,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarLabelStyle: { fontFamily: typography.display, fontSize: 11, marginTop: 2 },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Talk',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wardrobe"
        options={{
          title: 'Wardrobe',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'shirt' : 'shirt-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gacha"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'sparkles' : 'sparkles-outline'} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Me',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons name={focused ? 'person-circle' : 'person-circle-outline'} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
