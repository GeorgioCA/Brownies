import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, Text } from "react-native";
import { useAuth } from "../contexts/AuthContext";

import PhoneScreen from "../screens/PhoneScreen";
import OtpScreen from "../screens/OtpScreen";
import SetupProfileScreen from "../screens/SetupProfileScreen";
import DiscoveryScreen from "../screens/DiscoveryScreen";
import ChatListScreen from "../screens/ChatListScreen";
import ChatScreen from "../screens/ChatScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SubscriptionScreen from "../screens/SubscriptionScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ label, focused }) {
  const icons = { Discover: "♥", Chats: "💬", Profile: "👤" };
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ fontSize: 20 }}>{icons[label] || "•"}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: "#fcf8f3" },
        headerTitleStyle: { fontWeight: "700", color: "#2d1810" },
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: "#ebd9c8" },
        tabBarActiveTintColor: "#6b3f2e",
        tabBarInactiveTintColor: "#c49a78",
        tabBarIcon: ({ focused }) => <TabIcon label={route.name} focused={focused} />,
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Discover" component={DiscoveryScreen} />
      <Tab.Screen name="Chats" component={ChatListScreen} options={{ headerShown: true }} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#fcf8f3" }, headerTitleStyle: { fontWeight: "700", color: "#2d1810" }, headerShadowVisible: false }}>
      <Stack.Screen name="Phone" component={PhoneScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Otp" component={OtpScreen} options={{ title: "Verify" }} />
      <Stack.Screen name="SetupProfile" component={SetupProfileScreen} options={{ title: "Setup", headerShown: false }} />
    </Stack.Navigator>
  );
}

export default function Navigation() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fcf8f3" }}>
        <Text style={{ fontSize: 18, color: "#8b7a6e" }}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({
              headerShown: true, title: route.params?.name || "Chat",
              headerStyle: { backgroundColor: "#fcf8f3" },
              headerTitleStyle: { fontWeight: "700", color: "#2d1810" },
            })} />
            <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: true, title: "Settings", headerStyle: { backgroundColor: "#fcf8f3" }, headerTitleStyle: { fontWeight: "700", color: "#2d1810" } }} />
            <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: true, title: "Premium", headerStyle: { backgroundColor: "#fcf8f3" }, headerTitleStyle: { fontWeight: "700", color: "#2d1810" } }} />
          </>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
