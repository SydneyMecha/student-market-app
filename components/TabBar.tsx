import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { C } from '../styles/theme';

export default function TabBar({
  tabs,
  active,
  onSelect,
  variant = "pill",
}: {
  tabs: string[];
  active: string;
  onSelect: (t: string) => void;
  variant?: "pill" | "chip";
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabScroll}
    >
      {tabs.map((t) => {
        const isActive = t === active;
        const isPill = variant === "pill";
        return (
          <TouchableOpacity
            key={t}
            onPress={() => onSelect(t)}
            style={[
              isPill ? styles.tabPill : styles.chipTag,
              isActive && (isPill ? styles.tabPillActive : null),
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                isPill ? styles.tabPillText : styles.chipTagText,
                isActive && (isPill ? styles.tabPillTextActive : null),
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  tabScroll: { 
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  tabPill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: 'transparent', 
    backgroundColor: 'transparent',
  },
  tabPillActive: { 
    borderColor: C.primary,
  },
  tabPillText: { 
    fontSize: 14, 
    color: 'C:subtext',
    fontWeight: "400" 
  },
  tabPillTextActive: { 
    color: 'C:primary', 
    fontWeight: "500"
  },
  
  chipTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: C.tagBorder,
    backgroundColor: C.surface,
  },
  chipTagText: { fontSize: 13, color: C.subtext, fontWeight: "500" },
});