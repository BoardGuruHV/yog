import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PracticeStackParamList } from "../types";
import { PracticeHomeScreen } from "@/screens/practice/PracticeHomeScreen";
import { ProgramSelectScreen } from "@/screens/practice/ProgramSelectScreen";
import { PracticeTimerScreen } from "@/screens/practice/PracticeTimerScreen";
import { MeditationSelectScreen } from "@/screens/meditation/MeditationSelectScreen";
import { MeditationTimerScreen } from "@/screens/meditation/MeditationTimerScreen";
import { IntervalSelectScreen } from "@/screens/practice/IntervalSelectScreen";
import { IntervalTimerScreen } from "@/screens/practice/IntervalTimerScreen";
import { PracticeCompleteScreen } from "@/screens/practice/PracticeCompleteScreen";

const Stack = createNativeStackNavigator<PracticeStackParamList>();

export function PracticeNavigator() {
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
        name="PracticeHome"
        component={PracticeHomeScreen}
        options={{ title: "Practice" }}
      />
      <Stack.Screen
        name="ProgramSelect"
        component={ProgramSelectScreen}
        options={{ title: "Select Program" }}
      />
      <Stack.Screen
        name="PracticeTimer"
        component={PracticeTimerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="MeditationSelect"
        component={MeditationSelectScreen}
        options={{ title: "Meditation" }}
      />
      <Stack.Screen
        name="MeditationTimer"
        component={MeditationTimerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="IntervalSelect"
        component={IntervalSelectScreen}
        options={{ title: "Interval Training" }}
      />
      <Stack.Screen
        name="IntervalTimer"
        component={IntervalTimerScreen}
        options={{
          headerShown: false,
          presentation: "fullScreenModal",
        }}
      />
      <Stack.Screen
        name="PracticeComplete"
        component={PracticeCompleteScreen}
        options={{
          headerShown: false,
          presentation: "modal",
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
}

export default PracticeNavigator;
