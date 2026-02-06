import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useAsanaStore, useFavoriteStore } from "@/store";
import { AsanaList, AsanaFilter } from "@/components/asana";
import { ExploreStackScreenProps } from "@/navigation/types";

export function AsanaBrowserScreen({
  navigation,
}: ExploreStackScreenProps<"AsanaBrowser">) {
  const {
    asanas,
    filters,
    isLoading,
    hasMore,
    fetchAsanas,
    setFilters,
    resetFilters,
  } = useAsanaStore();
  const { fetchFavorites } = useFavoriteStore();

  useEffect(() => {
    fetchAsanas(true);
    fetchFavorites();
  }, []);

  const handleRefresh = () => {
    fetchAsanas(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      fetchAsanas();
    }
  };

  const handleAsanaPress = (asana: typeof asanas[0]) => {
    navigation.navigate("AsanaDetail", { asanaId: asana.id, asana });
  };

  return (
    <View style={styles.container}>
      <AsanaFilter
        filters={filters}
        onFiltersChange={setFilters}
        onReset={resetFilters}
      />
      <AsanaList
        asanas={asanas}
        onAsanaPress={handleAsanaPress}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        isLoading={isLoading}
        hasMore={hasMore}
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

export default AsanaBrowserScreen;
