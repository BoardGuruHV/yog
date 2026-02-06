import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFavoriteStore } from "@/store";
import { AsanaList } from "@/components/asana";
import { Asana } from "@/types";

export function FavoritesScreen() {
  const navigation = useNavigation();
  const { favorites, isLoading, fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const asanas: Asana[] = favorites
    .filter((f) => f.asana)
    .map((f) => f.asana as Asana);

  const handleAsanaPress = (asana: Asana) => {
    navigation.navigate("ExploreTab", {
      screen: "AsanaDetail",
      params: { asanaId: asana.id, asana },
    } as never);
  };

  const handleRefresh = () => {
    fetchFavorites();
  };

  return (
    <View style={styles.container}>
      <AsanaList
        asanas={asanas}
        onAsanaPress={handleAsanaPress}
        onRefresh={handleRefresh}
        isLoading={isLoading}
        showFavorites={true}
        emptyTitle="No favorites yet"
        emptyDescription="Tap the heart icon on any pose to add it to your favorites"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
});

export default FavoritesScreen;
