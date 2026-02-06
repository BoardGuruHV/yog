import React, { useEffect } from "react";
import { StatusBar, LogBox } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RootNavigator } from "@/navigation";
import { soundPlayer } from "@/services/audio/soundPlayer";
import { syncService } from "@/services/offline/syncService";

// Ignore specific warnings in development
LogBox.ignoreLogs([
  "ViewPropTypes will be removed",
  "ColorPropType will be removed",
]);

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (was cacheTime)
    },
  },
});

export default function App() {
  useEffect(() => {
    // Initialize services
    initializeApp();

    return () => {
      // Cleanup services
      soundPlayer.release();
      syncService.stopNetworkListener();
    };
  }, []);

  const initializeApp = async () => {
    // Preload sounds
    await soundPlayer.preloadSounds();

    // Start network listener for offline sync
    syncService.startNetworkListener();
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
          <RootNavigator />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
