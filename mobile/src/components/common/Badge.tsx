import React from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";

interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md";
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  label,
  variant = "default",
  size = "md",
  style,
  textStyle,
}: BadgeProps) {
  return (
    <View
      style={[
        styles.base,
        styles[`${variant}Container`],
        styles[`${size}Container`],
        style,
      ]}
    >
      <Text
        style={[
          styles.baseText,
          styles[`${variant}Text`],
          styles[`${size}Text`],
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

interface CategoryBadgeProps {
  category: string;
  backgroundColor: string;
  textColor: string;
  style?: ViewStyle;
}

export function CategoryBadge({
  category,
  backgroundColor,
  textColor,
  style,
}: CategoryBadgeProps) {
  return (
    <View style={[styles.base, styles.mdContainer, { backgroundColor }, style]}>
      <Text style={[styles.baseText, styles.mdText, { color: textColor }]}>
        {category}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 100,
    alignSelf: "flex-start",
  },

  // Variants
  defaultContainer: {
    backgroundColor: "#f1f5f9",
  },
  successContainer: {
    backgroundColor: "#dcfce7",
  },
  warningContainer: {
    backgroundColor: "#fef3c7",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
  },
  infoContainer: {
    backgroundColor: "#dbeafe",
  },

  // Sizes
  smContainer: {
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  mdContainer: {
    paddingVertical: 4,
    paddingHorizontal: 12,
  },

  // Text
  baseText: {
    fontWeight: "500",
  },
  defaultText: {
    color: "#475569",
  },
  successText: {
    color: "#166534",
  },
  warningText: {
    color: "#92400e",
  },
  errorText: {
    color: "#b91c1c",
  },
  infoText: {
    color: "#1d4ed8",
  },

  smText: {
    fontSize: 11,
  },
  mdText: {
    fontSize: 12,
  },
});

export default Badge;
