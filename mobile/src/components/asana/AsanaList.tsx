import React from 'react';
import { FlatList, View, StyleSheet, RefreshControl, ListRenderItem } from 'react-native';
import { Asana } from '@/types';
import { AsanaCard } from './AsanaCard';
import { Loading, EmptyState } from '@/components/common';

interface AsanaListProps {
  asanas: Asana[];
  onAsanaPress: (asana: Asana) => void;
  onRefresh?: () => void;
  onEndReached?: () => void;
  isLoading?: boolean;
  isRefreshing?: boolean;
  hasMore?: boolean;
  numColumns?: 1 | 2;
  showFavorites?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AsanaList({
  asanas,
  onAsanaPress,
  onRefresh,
  onEndReached,
  isLoading = false,
  isRefreshing = false,
  hasMore = false,
  numColumns = 2,
  showFavorites = true,
  emptyTitle = 'No poses found',
  emptyDescription = 'Try adjusting your filters or search terms',
}: AsanaListProps) {
  const renderItem: ListRenderItem<Asana> = ({ item, index }) => {
    const isLastInRow = (index + 1) % numColumns === 0;

    return (
      <View
        style={[
          styles.itemContainer,
          numColumns === 2 && styles.halfWidth,
          numColumns === 2 && !isLastInRow && styles.marginRight,
        ]}
      >
        <AsanaCard
          asana={item}
          onPress={() => onAsanaPress(item)}
          showFavorite={showFavorites}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore || !isLoading) {
      return null;
    }
    return (
      <View style={styles.footer}>
        <Loading size="small" />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return <Loading fullScreen message="Loading poses..." />;
    }

    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  };

  const keyExtractor = (item: Asana) => item.id;

  return (
    <FlatList
      data={asanas}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      key={numColumns} // Force re-render when columns change
      contentContainerStyle={[styles.list, asanas.length === 0 && styles.emptyList]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor="#6366f1"
          />
        ) : undefined
      }
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyList: {
    flex: 1,
  },
  itemContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
  },
  marginRight: {
    marginRight: '4%',
  },
  footer: {
    paddingVertical: 20,
  },
});

export default AsanaList;
