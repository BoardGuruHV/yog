import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, StyleSheet } from "react-native";
import { MainTabParamList } from "./types";

import { HomeScreen } from "@/screens/HomeScreen";
import { ExploreNavigator } from "./stacks/ExploreNavigator";
import { PracticeNavigator } from "./stacks/PracticeNavigator";
import { ProgressNavigator } from "./stacks/ProgressNavigator";
import { ProfileNavigator } from "./stacks/ProfileNavigator";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarLabelStyle: styles.tabBarLabel,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="ExploreTab"
        component={ExploreNavigator}
        options={{
          tabBarLabel: "Explore",
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="PracticeTab"
        component={PracticeNavigator}
        options={{
          tabBarLabel: "Practice",
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>🧘</Text>,
        }}
      />
      <Tab.Screen
        name="ProgressTab"
        component={ProgressNavigator}
        options={{
          tabBarLabel: "Progress",
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileNavigator}
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => <Text style={[styles.icon, { color }]}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 8,
    paddingBottom: 8,
    height: 70,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "500",
    marginTop: 4,
  },
  icon: {
    fontSize: 22,
  },
});

export default MainNavigator;
