import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from '../styles/theme';

// 1. Update the interface to accept the visibility boolean
interface SectionHeaderProps {
  title: string;
  onViewMore: () => void;
  showViewMore?: boolean; // Made optional using '?'
}

export default function SectionHeader({ title, onViewMore, showViewMore = true }: SectionHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <Text style={styles.titleText}>{title}</Text>
      
      {/* 2. THE FIX: Only render this button if showViewMore evaluates to true! */}
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
  viewMoreText: { fontSize: 13, color: C.subtext, fontWeight: '500' },
});