import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "@/store";
import { Button, Input, Card } from "@/components/common";
import { AuthStackScreenProps } from "@/navigation/types";

export function RegisterScreen({ navigation }: AuthStackScreenProps<"Register">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { register, isLoading } = useAuthStore();

  const handleRegister = async () => {
    setError("");

    if (!email || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    const result = await register({ email, password, name: name || undefined });

    if (!result.success) {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.logo}>🧘</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Start your yoga journey today
            </Text>
          </View>

          <Card variant="elevated" padding="lg" style={styles.formCard}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              label="Name (optional)"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCorrect={false}
            />

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              rightIcon={
                <Text style={styles.eyeIcon}>
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Text>
              }
              onRightIconPress={() => setShowPassword(!showPassword)}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
            />

            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={isLoading}
              style={styles.registerButton}
            />
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
              <Text style={styles.signInLink}>Sign in</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.terms}>
            By creating an account, you agree to our Terms of Service and
            Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  logo: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#64748b",
  },
  formCard: {
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: "#fef2f2",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#b91c1c",
    fontSize: 14,
    textAlign: "center",
  },
  eyeIcon: {
    fontSize: 18,
  },
  registerButton: {
    marginTop: 8,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginBottom: 16,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  signInLink: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "600",
  },
  terms: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 18,
  },
});

export default RegisterScreen;
