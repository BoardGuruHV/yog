import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'md',
}: CardProps) {
  const cardStyles = [
    styles.base,
    styles[`${variant}Variant`],
    styles[`${padding}Padding`],
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },

  // Variants
  defaultVariant: {
    backgroundColor: '#ffffff',
  },
  elevatedVariant: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlinedVariant: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  // Padding
  nonePadding: {
    padding: 0,
  },
  smPadding: {
    padding: 12,
  },
  mdPadding: {
    padding: 16,
  },
  lgPadding: {
    padding: 24,
  },
});

export default Card;
