import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAsanaStore, useFavoriteStore } from '@/store';
import { AsanaSvg, AsanaSvgPlaceholder } from '@/components/asana';
import { Card, Badge, CategoryBadge, Loading } from '@/components/common';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/types';
import { ExploreStackScreenProps } from '@/navigation/types';

export function AsanaDetailScreen({ route }: ExploreStackScreenProps<'AsanaDetail'>) {
  const { asanaId, asana: initialAsana } = route.params;
  const { fetchAsanaById, selectedAsana } = useAsanaStore();
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const [isLoading, setIsLoading] = useState(!initialAsana);
  const asana = selectedAsana || initialAsana;

  useEffect(() => {
    if (!initialAsana) {
      setIsLoading(true);
      fetchAsanaById(asanaId).finally(() => setIsLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asanaId]);

  if (isLoading) {
    return <Loading fullScreen message="Loading pose..." />;
  }

  if (!asana) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Pose not found</Text>
      </View>
    );
  }

  const isFav = isFavorite(asana.id);
  const categoryColor = CATEGORY_COLORS[asana.category];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Pose Image */}
      <View style={styles.imageContainer}>
        {asana.svgPath ? (
          <AsanaSvg svgPath={asana.svgPath} width={280} height={280} />
        ) : (
          <AsanaSvgPlaceholder width={280} height={280} />
        )}
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(asana.id, asana)}
        >
          <Text style={styles.favoriteIcon}>{isFav ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <CategoryBadge
          category={CATEGORY_LABELS[asana.category]}
          backgroundColor={categoryColor.bg}
          textColor={categoryColor.text}
        />
        <Text style={styles.name}>{asana.nameEnglish}</Text>
        <Text style={styles.sanskrit}>{asana.nameSanskrit}</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Difficulty</Text>
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
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>
            {Math.floor(asana.durationSeconds / 60)} min
          </Text>
        </View>
      </View>

      {/* Description */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>{asana.description}</Text>
      </Card>

      {/* Benefits */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Benefits</Text>
        {asana.benefits.map((benefit, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.bulletPoint}>•</Text>
            <Text style={styles.listText}>{benefit}</Text>
          </View>
        ))}
      </Card>

      {/* Target Body Parts */}
      <Card variant="outlined" padding="md" style={styles.section}>
        <Text style={styles.sectionTitle}>Target Areas</Text>
        <View style={styles.bodyParts}>
          {asana.targetBodyParts.map((part) => (
            <Badge
              key={part}
              label={part.charAt(0).toUpperCase() + part.slice(1)}
              variant="info"
            />
          ))}
        </View>
      </Card>

      {/* Contraindications */}
      {asana.contraindications && asana.contraindications.length > 0 && (
        <Card variant="outlined" padding="md" style={styles.section}>
          <Text style={styles.sectionTitle}>Contraindications</Text>
          {asana.contraindications.map((contra, index) => (
            <View key={index} style={styles.contraItem}>
              <Badge
                label={contra.severity}
                variant={
                  contra.severity === 'avoid'
                    ? 'error'
                    : contra.severity === 'caution'
                      ? 'warning'
                      : 'info'
                }
                size="sm"
              />
              <Text style={styles.contraText}>
                {contra.condition?.name || 'Unknown condition'}
              </Text>
              {contra.notes && <Text style={styles.contraNotes}>{contra.notes}</Text>}
            </View>
          ))}
        </Card>
      )}

      {/* Modifications */}
      {asana.modifications && asana.modifications.length > 0 && (
        <Card variant="outlined" padding="md" style={styles.section}>
          <Text style={styles.sectionTitle}>Modifications</Text>
          {asana.modifications.map((mod, index) => (
            <View key={index} style={styles.modItem}>
              {mod.forAge && (
                <Badge label={`Age: ${mod.forAge}`} variant="info" size="sm" />
              )}
              {mod.condition && (
                <Badge label={mod.condition.name} variant="info" size="sm" />
              )}
              <Text style={styles.modDescription}>{mod.description}</Text>
            </View>
          ))}
        </Card>
      )}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#64748b',
  },
  imageContainer: {
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 24,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  favoriteIcon: {
    fontSize: 24,
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 12,
  },
  sanskrit: {
    fontSize: 18,
    color: '#64748b',
    fontStyle: 'italic',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#e2e8f0',
  },
  difficulty: {
    flexDirection: 'row',
    gap: 3,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  difficultyDotFilled: {
    backgroundColor: '#6366f1',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 24,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  bulletPoint: {
    color: '#6366f1',
    marginRight: 8,
    fontSize: 15,
  },
  listText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  bodyParts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  contraItem: {
    marginBottom: 12,
  },
  contraText: {
    fontSize: 15,
    color: '#475569',
    marginTop: 4,
  },
  contraNotes: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 2,
    fontStyle: 'italic',
  },
  modItem: {
    marginBottom: 12,
  },
  modDescription: {
    fontSize: 15,
    color: '#475569',
    marginTop: 4,
  },
  bottomPadding: {
    height: 32,
  },
});

export default AsanaDetailScreen;
