import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useAuthStore } from "@/store";
import { updateProfile } from "@/api/endpoints/auth";
import { Card, Button, Input } from "@/components/common";

export function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const [name, setName] = useState(user?.name || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);

    const response = await updateProfile({ name: name || null });

    setIsSaving(false);

    if (response.success && response.data) {
      setUser(response.data);
      Alert.alert("Success", "Profile updated successfully");
    } else {
      Alert.alert("Error", response.error?.message || "Failed to update profile");
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {name?.charAt(0) || user?.email?.charAt(0) || "?"}
          </Text>
        </View>
        <Text style={styles.avatarHint}>
          Profile picture can be changed in the web app
        </Text>
      </View>

      {/* Form */}
      <Card variant="outlined" padding="md" style={styles.formCard}>
        <Input
          label="Name"
          placeholder="Your display name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        <View style={styles.emailSection}>
          <Text style={styles.emailLabel}>Email</Text>
          <Text style={styles.emailValue}>{user?.email}</Text>
          <Text style={styles.emailHint}>
            Email cannot be changed from the mobile app
          </Text>
        </View>
      </Card>

      {/* Save Button */}
      <Button
        title="Save Changes"
        onPress={handleSave}
        loading={isSaving}
        style={styles.saveButton}
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
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#6366f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "600",
    color: "#fff",
  },
  avatarHint: {
    fontSize: 13,
    color: "#64748b",
  },
  formCard: {
    marginBottom: 24,
  },
  emailSection: {
    marginTop: 8,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#334155",
    marginBottom: 6,
  },
  emailValue: {
    fontSize: 16,
    color: "#64748b",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
  },
  emailHint: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  saveButton: {
    marginTop: 8,
  },
});

export default EditProfileScreen;
