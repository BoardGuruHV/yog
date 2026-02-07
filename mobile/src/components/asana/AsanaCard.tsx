import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Asana, CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { Card, CategoryBadge } from '@/components/common';
import { AsanaSvg, AsanaSvgPlaceholder } from './AsanaSvg';
import { useFavoriteStore } from '@/store';

interface AsanaCardProps {
  asana: Asana;
  onPress: () => void;
  showFavorite?: boolean;
  compact?: boolean;
}

export function AsanaCard({
  asana,
  onPress,
  showFavorite = true,
  compact = false,
}: AsanaCardProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStore();
  const isFav = isFavorite(asana.id);

  const categoryColor = CATEGORY_COLORS[asana.category];

  const handleFavoritePress = () => {
    toggleFavorite(asana.id, asana);
  };

  if (compact) {
    return (
      <Card onPress={onPress} variant="elevated" padding="sm" style={styles.compactCard}>
        <View style={styles.compactContent}>
          {asana.svgPath ? (
            <AsanaSvg svgPath={asana.svgPath} width={60} height={60} />
          ) : (
            <AsanaSvgPlaceholder width={60} height={60} />
          )}
          <View style={styles.compactInfo}>
            <Text style={styles.compactName} numberOfLines={1}>
              {asana.nameEnglish}
            </Text>
            <Text style={styles.compactSanskrit} numberOfLines={1}>
              {asana.nameSanskrit}
            </Text>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Card onPress={onPress} variant="elevated" padding="none" style={styles.card}>
      <View style={styles.imageContainer}>
        {asana.svgPath ? (
          <AsanaSvg svgPath={asana.svgPath} width={140} height={140} />
        ) : (
          <AsanaSvgPlaceholder width={140} height={140} />
        )}
        {showFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.favoriteIcon}>{isFav ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <CategoryBadge
          category={CATEGORY_LABELS[asana.category]}
          backgroundColor={categoryColor.bg}
          textColor={categoryColor.text}
        />

        <Text style={styles.name} numberOfLines={1}>
          {asana.nameEnglish}
        </Text>
        <Text style={styles.sanskrit} numberOfLines={1}>
          {asana.nameSanskrit}
        </Text>

        <View style={styles.meta}>
          <View style={styles.difficulty}>
            {Array.from({ length: 10 }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.difficultyDot,
                  i < asana.difficulty && styles.difficultyDotFilled,
                ]}
              />
            ))}
          </View>
          <Text style={styles.duration}>{Math.floor(asana.durationSeconds / 60)}m</Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
  },
  compactCard: {
    marginBottom: 8,
  },
  imageContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingHorizontal: 16,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
  },
  sanskrit: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  difficulty: {
    flexDirection: 'row',
    gap: 2,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e2e8f0',
  },
  difficultyDotFilled: {
    backgroundColor: '#6366f1',
  },
  duration: {
    fontSize: 12,
    color: '#64748b',
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
  },
  compactSanskrit: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default AsanaCard;
