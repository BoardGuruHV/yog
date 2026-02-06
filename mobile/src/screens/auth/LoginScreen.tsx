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

export function LoginScreen({ navigation }: AuthStackScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const { login, isLoading } = useAuthStore();

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password");
      return;
    }

    const result = await login({ email, password });

    if (!result.success) {
      setError(result.error || "Login failed");
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
            <Text style={styles.title}>Welcome to Yog</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your practice
            </Text>
          </View>

          <Card variant="elevated" padding="lg" style={styles.formCard}>
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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
              placeholder="Enter your password"
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

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              style={styles.loginButton}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </Card>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.signUpLink}>Sign up</Text>
            </TouchableOpacity>
          </View>
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
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    fontSize: 64,
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
  loginButton: {
    marginTop: 8,
  },
  forgotPassword: {
    alignItems: "center",
    marginTop: 16,
  },
  forgotPasswordText: {
    color: "#6366f1",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  footerText: {
    color: "#64748b",
    fontSize: 14,
  },
  signUpLink: {
    color: "#6366f1",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default LoginScreen;
