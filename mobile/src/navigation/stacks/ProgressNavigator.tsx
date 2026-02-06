import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProgressStackParamList } from "../types";
import { ProgressDashboardScreen } from "@/screens/goals/ProgressDashboardScreen";
import { GoalsScreen } from "@/screens/goals/GoalsScreen";
import { GoalDetailScreen } from "@/screens/goals/GoalDetailScreen";
import { CreateGoalScreen } from "@/screens/goals/CreateGoalScreen";
import { StreaksScreen } from "@/screens/goals/StreaksScreen";
import { FavoritesScreen } from "@/screens/asana/FavoritesScreen";

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export function ProgressNavigator() {
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
        name="ProgressDashboard"
        component={ProgressDashboardScreen}
        options={{ title: "Progress" }}
      />
      <Stack.Screen
        name="Goals"
        component={GoalsScreen}
        options={{ title: "Goals" }}
      />
      <Stack.Screen
        name="GoalDetail"
        component={GoalDetailScreen}
        options={{ title: "Goal Details" }}
      />
      <Stack.Screen
        name="CreateGoal"
        component={CreateGoalScreen}
        options={{
          title: "New Goal",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="Streaks"
        component={StreaksScreen}
        options={{ title: "Streaks" }}
      />
      <Stack.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: "Favorites" }}
      />
    </Stack.Navigator>
  );
}

export default ProgressNavigator;
