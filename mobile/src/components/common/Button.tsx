import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyles = [
    styles.base,
    styles[`${variant}Container`],
    styles[`${size}Container`],
    isDisabled && styles.disabledContainer,
    style,
  ];

  const textStyles = [
    styles.baseText,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={containerStyles}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? "#fff" : "#6366f1"}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    gap: 8,
  },

  // Variants
  primaryContainer: {
    backgroundColor: "#6366f1",
  },
  secondaryContainer: {
    backgroundColor: "#f1f5f9",
  },
  outlineContainer: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#6366f1",
  },
  ghostContainer: {
    backgroundColor: "transparent",
  },

  // Sizes
  smContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mdContainer: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  lgContainer: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },

  // Disabled
  disabledContainer: {
    opacity: 0.5,
  },

  // Text base
  baseText: {
    fontWeight: "600",
  },

  // Text variants
  primaryText: {
    color: "#ffffff",
  },
  secondaryText: {
    color: "#334155",
  },
  outlineText: {
    color: "#6366f1",
  },
  ghostText: {
    color: "#6366f1",
  },

  // Text sizes
  smText: {
    fontSize: 14,
  },
  mdText: {
    fontSize: 16,
  },
  lgText: {
    fontSize: 18,
  },

  // Disabled text
  disabledText: {
    opacity: 0.7,
  },
});

export default Button;
