import React, { useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Linking } from "react-native";
import { format } from "date-fns";
import { useSubscriptionStore } from "@/store";
import { Card, Button, Badge } from "@/components/common";
import { TIER_LIMITS } from "@/types";

export function SubscriptionScreen() {
  const { subscription, fetchSubscription, isPremium, getTier } =
    useSubscriptionStore();

  useEffect(() => {
    fetchSubscription();
  }, []);

  const tier = getTier();
  const limits = TIER_LIMITS[tier];

  const features = [
    {
      key: "programsTotal",
      label: "Programs",
      free: "3 programs",
      premium: "Unlimited",
    },
    {
      key: "aiChatPerDay",
      label: "AI Chat",
      free: "10/day",
      premium: "50/day",
    },
    {
      key: "aiProgramGeneration",
      label: "AI Program Generation",
      free: false,
      premium: true,
    },
    {
      key: "offlineAccess",
      label: "Offline Access",
      free: false,
      premium: true,
    },
    {
      key: "fullAnalytics",
      label: "Full Analytics",
      free: false,
      premium: true,
    },
    {
      key: "poseDetection",
      label: "Pose Detection",
      free: false,
      premium: true,
    },
  ];

  const handleUpgrade = () => {
    // In a real app, this would open in-app purchase flow
    Linking.openURL("https://yog.app/subscription");
  };

  const handleManage = () => {
    Linking.openURL("https://yog.app/settings/subscription");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Current Plan */}
      <Card variant="elevated" padding="lg" style={styles.currentPlanCard}>
        <View style={styles.planHeader}>
          <Text style={styles.planEmoji}>
            {tier === "FREE" ? "🆓" : tier === "PREMIUM" ? "⭐" : "👑"}
          </Text>
          <Text style={styles.planName}>{tier}</Text>
          <Badge
            label={subscription?.status || "Active"}
            variant={subscription?.status === "ACTIVE" ? "success" : "warning"}
            size="sm"
          />
        </View>

        {subscription?.currentPeriodEnd && (
          <Text style={styles.renewalDate}>
            {subscription.cancelAtPeriodEnd
              ? "Expires"
              : "Renews"}{" "}
            {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
          </Text>
        )}
      </Card>

      {/* Features Comparison */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>

        <Card variant="outlined" padding="none">
          {features.map((feature, index) => (
            <View key={feature.key}>
              <View style={styles.featureRow}>
                <Text style={styles.featureLabel}>{feature.label}</Text>
                <View style={styles.featureValue}>
                  {typeof feature.premium === "boolean" ? (
                    <Text
                      style={[
                        styles.featureCheck,
                        isPremium()
                          ? styles.featureEnabled
                          : styles.featureDisabled,
                      ]}
                    >
                      {isPremium() ? "✓" : "✗"}
                    </Text>
                  ) : (
                    <Text style={styles.featureText}>
                      {isPremium() ? feature.premium : feature.free}
                    </Text>
                  )}
                </View>
              </View>
              {index < features.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </Card>
      </View>

      {/* Upgrade/Manage */}
      {!isPremium() ? (
        <Card
          variant="elevated"
          padding="lg"
          style={styles.upgradeCard}
        >
          <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
          <Text style={styles.upgradeDescription}>
            Unlock all features including offline access, AI program generation,
            and unlimited programs.
          </Text>

          <View style={styles.pricing}>
            <View style={styles.priceOption}>
              <Text style={styles.priceAmount}>$9.99</Text>
              <Text style={styles.pricePeriod}>/month</Text>
            </View>
            <View style={styles.priceOption}>
              <Text style={styles.priceAmount}>$79.99</Text>
              <Text style={styles.pricePeriod}>/year</Text>
              <Badge label="Save 33%" variant="success" size="sm" />
            </View>
          </View>

          <Button
            title="Upgrade Now"
            onPress={handleUpgrade}
            style={styles.upgradeButton}
          />

          <Text style={styles.trialNote}>
            7-day free trial included
          </Text>
        </Card>
      ) : (
        <Button
          title="Manage Subscription"
          variant="outline"
          onPress={handleManage}
        />
      )}

      {/* Restore */}
      <Button
        title="Restore Purchases"
        variant="ghost"
        onPress={() => {}}
        style={styles.restoreButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  currentPlanCard: {
    marginBottom: 24,
    alignItems: "center",
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  planEmoji: {
    fontSize: 24,
  },
  planName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  renewalDate: {
    fontSize: 14,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  featureLabel: {
    fontSize: 15,
    color: "#1e293b",
  },
  featureValue: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureCheck: {
    fontSize: 18,
    fontWeight: "600",
  },
  featureEnabled: {
    color: "#22c55e",
  },
  featureDisabled: {
    color: "#94a3b8",
  },
  featureText: {
    fontSize: 14,
    color: "#64748b",
  },
  divider: {
    height: 1,
    backgroundColor: "#f1f5f9",
    marginLeft: 16,
  },
  upgradeCard: {
    backgroundColor: "#6366f1",
    marginBottom: 16,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  upgradeDescription: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  pricing: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  priceOption: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
  },
  pricePeriod: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 4,
  },
  upgradeButton: {
    backgroundColor: "#fff",
  },
  trialNote: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    marginTop: 12,
  },
  restoreButton: {
    marginTop: 8,
  },
});

export default SubscriptionScreen;
