import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import { Asana, Program, Goal, ProgramAsana, IntervalConfig } from "@/types";

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  HomeTab: undefined;
  ExploreTab: NavigatorScreenParams<ExploreStackParamList>;
  PracticeTab: NavigatorScreenParams<PracticeStackParamList>;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Explore Stack (Asana browsing)
export type ExploreStackParamList = {
  AsanaBrowser: undefined;
  AsanaDetail: { asanaId: string; asana?: Asana };
};

// Practice Stack
export type PracticeStackParamList = {
  PracticeHome: undefined;
  ProgramSelect: undefined;
  PracticeTimer: { program: Program };
  MeditationSelect: undefined;
  MeditationTimer: {
    durationMinutes: number;
    bellIntervalMinutes: number;
    ambientSound: "none" | "rain" | "ocean" | "forest";
  };
  IntervalSelect: undefined;
  IntervalTimer: { config: IntervalConfig };
  PracticeComplete: {
    durationSeconds: number;
    programId?: string;
    type: "practice" | "meditation" | "interval";
  };
};

// Progress Stack
export type ProgressStackParamList = {
  ProgressDashboard: undefined;
  Goals: undefined;
  GoalDetail: { goalId: string };
  CreateGoal: undefined;
  Streaks: undefined;
  Favorites: undefined;
};

// Profile Stack
export type ProfileStackParamList = {
  Settings: undefined;
  OfflineSettings: undefined;
  Subscription: undefined;
  EditProfile: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

export type ExploreStackScreenProps<T extends keyof ExploreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ExploreStackParamList, T>,
    MainTabScreenProps<"ExploreTab">
  >;

export type PracticeStackScreenProps<T extends keyof PracticeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<PracticeStackParamList, T>,
    MainTabScreenProps<"PracticeTab">
  >;

export type ProgressStackScreenProps<T extends keyof ProgressStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProgressStackParamList, T>,
    MainTabScreenProps<"ProgressTab">
  >;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ProfileStackParamList, T>,
    MainTabScreenProps<"ProfileTab">
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
