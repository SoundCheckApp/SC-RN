import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

export default function MusicianHomepageLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#1F2937",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Homepage",
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ position: "relative", alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="home" size={size} color={color} />
              {focused && (
                <View style={{ position: "absolute", top: -4, left: size / 2 - 3 }}>
                  <Ionicons name="chevron-up" size={10} color={color} />
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
