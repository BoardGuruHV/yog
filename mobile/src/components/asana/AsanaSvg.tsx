import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { SvgUri, SvgXml } from "react-native-svg";

interface AsanaSvgProps {
  svgPath: string;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export function AsanaSvg({
  svgPath,
  width = 200,
  height = 200,
  style,
}: AsanaSvgProps) {
  // Check if it's a URL or inline SVG
  const isUrl =
    svgPath.startsWith("http://") ||
    svgPath.startsWith("https://") ||
    svgPath.startsWith("/");

  // For relative paths, construct full URL
  const fullUrl = svgPath.startsWith("/")
    ? `${__DEV__ ? "http://localhost:3000" : "https://yog.app"}${svgPath}`
    : svgPath;

  return (
    <View style={[styles.container, { width, height }, style]}>
      {isUrl ? (
        <SvgUri uri={fullUrl} width={width} height={height} />
      ) : (
        <SvgXml xml={svgPath} width={width} height={height} />
      )}
    </View>
  );
}

// Placeholder SVG for when image fails to load
export function AsanaSvgPlaceholder({
  width = 200,
  height = 200,
  style,
}: Omit<AsanaSvgProps, "svgPath">) {
  const placeholderSvg = `
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <rect width="200" height="200" fill="#f1f5f9" rx="8"/>
      <circle cx="100" cy="70" r="25" fill="#cbd5e1"/>
      <path d="M100 100 L100 150" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 110 L70 130" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 110 L130 130" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 150 L75 190" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
      <path d="M100 150 L125 190" stroke="#cbd5e1" stroke-width="8" stroke-linecap="round"/>
    </svg>
  `;

  return (
    <View style={[styles.container, { width, height }, style]}>
      <SvgXml xml={placeholderSvg} width={width} height={height} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
});

export default AsanaSvg;
