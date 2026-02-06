import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Card } from "@/components/common";
import { PracticeStackScreenProps } from "@/navigation/types";

export function PracticeHomeScreen({
  navigation,
}: PracticeStackScreenProps<"PracticeHome">) {
  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.subtitle}>Choose your practice mode</Text>

        {/* Guided Practice */}
        <Card
          variant="elevated"
          padding="lg"
          style={styles.modeCard}
          onPress={() => navigation.navigate("ProgramSelect")}
        >
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: "#dbeafe" }]}>
              <Text style={styles.modeEmoji}>📋</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Guided Practice</Text>
              <Text style={styles.modeDescription}>
                Follow a program with timed pose transitions
              </Text>
            </View>
          </View>
          <View style={styles.modeFeatures}>
            <Text style={styles.feature}>• Timer for each pose</Text>
            <Text style={styles.feature}>• Transition cues</Text>
            <Text style={styles.feature}>• Audio bells</Text>
          </View>
        </Card>

        {/* Meditation */}
        <Card
          variant="elevated"
          padding="lg"
          style={styles.modeCard}
          onPress={() => navigation.navigate("MeditationSelect")}
        >
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: "#f3e8ff" }]}>
              <Text style={styles.modeEmoji}>🧘‍♀️</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Meditation</Text>
              <Text style={styles.modeDescription}>
                Timed meditation with breathing guide
              </Text>
            </View>
          </View>
          <View style={styles.modeFeatures}>
            <Text style={styles.feature}>• Customizable duration</Text>
            <Text style={styles.feature}>• Ambient sounds</Text>
            <Text style={styles.feature}>• Interval bells</Text>
          </View>
        </Card>

        {/* Interval Training */}
        <Card
          variant="elevated"
          padding="lg"
          style={styles.modeCard}
          onPress={() => navigation.navigate("IntervalSelect")}
        >
          <View style={styles.modeHeader}>
            <View style={[styles.modeIcon, { backgroundColor: "#fef3c7" }]}>
              <Text style={styles.modeEmoji}>⏱️</Text>
            </View>
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Interval Training</Text>
              <Text style={styles.modeDescription}>
                HIIT-style work/rest intervals
              </Text>
            </View>
          </View>
          <View style={styles.modeFeatures}>
            <Text style={styles.feature}>• Customizable intervals</Text>
            <Text style={styles.feature}>• Multiple rounds</Text>
            <Text style={styles.feature}>• Visual cues</Text>
          </View>
        </Card>

        {/* Quick Start */}
        <View style={styles.quickStart}>
          <Text style={styles.quickStartTitle}>Quick Start</Text>
          <View style={styles.quickStartOptions}>
            <TouchableOpacity
              style={styles.quickOption}
              onPress={() =>
                navigation.navigate("MeditationTimer", {
                  durationMinutes: 5,
                  bellIntervalMinutes: 0,
                  ambientSound: "none",
                })
              }
            >
              <Text style={styles.quickOptionTime}>5 min</Text>
              <Text style={styles.quickOptionLabel}>Meditation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() =>
                navigation.navigate("MeditationTimer", {
                  durationMinutes: 10,
                  bellIntervalMinutes: 5,
                  ambientSound: "none",
                })
              }
            >
              <Text style={styles.quickOptionTime}>10 min</Text>
              <Text style={styles.quickOptionLabel}>Meditation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickOption}
              onPress={() =>
                navigation.navigate("MeditationTimer", {
                  durationMinutes: 20,
                  bellIntervalMinutes: 10,
                  ambientSound: "rain",
                })
              }
            >
              <Text style={styles.quickOptionTime}>20 min</Text>
              <Text style={styles.quickOptionLabel}>Meditation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 16,
  },
  modeCard: {
    marginBottom: 16,
  },
  modeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  modeEmoji: {
    fontSize: 28,
  },
  modeInfo: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  modeDescription: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  modeFeatures: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
  },
  feature: {
    fontSize: 14,
    color: "#475569",
    marginBottom: 4,
  },
  quickStart: {
    marginTop: 8,
  },
  quickStartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  quickStartOptions: {
    flexDirection: "row",
    gap: 12,
  },
  quickOption: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  quickOptionTime: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6366f1",
  },
  quickOptionLabel: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },
});

export default PracticeHomeScreen;
