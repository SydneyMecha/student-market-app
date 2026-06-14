import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from '../styles/theme';

interface SectionHeaderProps {
  title: string;
  onViewMore: () => void;
  showViewMore?: boolean;
}

export default function SectionHeader({ title, onViewMore, showViewMore = true }: SectionHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.titleText}>{title}</Text>
      
      {showViewMore && (
        <TouchableOpacity onPress={onViewMore} activeOpacity={0.7}>
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  titleText: { fontSize: 16, fontWeight: '700', color: C.text },
  viewMoreText: { fontSize: 16, color: C.primary, fontWeight: '500' },
});