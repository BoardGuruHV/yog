import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ExploreStackParamList } from "../types";
import { AsanaBrowserScreen } from "@/screens/asana/AsanaBrowserScreen";
import { AsanaDetailScreen } from "@/screens/asana/AsanaDetailScreen";

const Stack = createNativeStackNavigator<ExploreStackParamList>();

export function ExploreNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: "#fff",
        },
        headerTintColor: "#1e293b",
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="AsanaBrowser"
        component={AsanaBrowserScreen}
        options={{ title: "Explore Poses" }}
      />
      <Stack.Screen
        name="AsanaDetail"
        component={AsanaDetailScreen}
        options={{ title: "Pose Details" }}
      />
    </Stack.Navigator>
  );
}

export default ExploreNavigator;
