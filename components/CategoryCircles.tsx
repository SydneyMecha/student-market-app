import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { C } from '../styles/theme';
import { Icon } from 'react-native-paper';

// 1. Removed the color requirement since we are using a global theme color
interface Category {
  id: number;
  label: string;
  icon: string;
}

// 2. Cleaned up the data array
const CATEGORIES: Category[] = [
  { id: 1, label: "Fashion", icon: "tshirt-crew" },
  { id: 2, label: "Home Products", icon: "home" },
  { id: 3, label: "Services", icon: "room-service" },
  { id: 4, label: "Accessories", icon: "cellphone" },
  { id: 5, label: "Tv & Audio", icon: "television" },
];

export default function CategoryCircles() {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {CATEGORIES.map((cat) => (
        <TouchableOpacity key={cat.id} style={styles.categoryItem} activeOpacity={0.8}>
          
          {/* 3. Reverted back to your global C.primary color */}
          <View style={[styles.categoryCircle, { backgroundColor: C.primary }]}>
            <Icon source={cat.icon} size={28} color={C.surface} />
          </View>
          
          <Text style={styles.categoryLabel} numberOfLines={2}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16, 
  },
  categoryItem: { 
    alignItems: "center",
    width: 72, 
  },
  categoryCircle: {
    width: 60,
    height: 60,
    borderRadius: 30, 
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  categoryLabel: {
    fontSize: 12,
    color: C.text,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
});