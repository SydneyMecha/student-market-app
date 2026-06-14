import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { C } from '../styles/theme';
import { Icon } from 'react-native-paper';
import { Image } from 'expo-image';
import { fetchWooCommerce } from '../services/wooApi';
import { decodeHTMLEntities } from '../utils/stringUtils'; // Import decoder

interface WooCommerceCategory {
  id: number;
  name: string;
  slug: string;
  image?: { src: string } | null;
}

interface CategoryCirclesProps {
  onPressCategory: (id: number, name: string) => void;
}

// Fallback helper to map standard category slugs to icons if no image is uploaded
const getIconForCategory = (slug: string): string => {
  switch (slug) {
    case 'fashion':           return 'tshirt-crew';
    case 'others':            return 'folder-outline';
    case 'computing':         return 'laptop';
    case 'home-products':     return 'home-outline';
    case 'services':          return 'room-service-outline';
    case 'fashion-accessories': return 'cellphone';
    default:                  return 'tag-outline';
  }
};

export default function CategoryCircles({ onPressCategory }: CategoryCirclesProps) {
  const [categories, setCategories] = useState<WooCommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Queries only top-level parent categories (parent=0)
    fetchWooCommerce('products/categories?parent=0')
      .then((raw: any[]) => {
        const formatted = raw.map((c) => ({
          id: c.id,
          name: decodeHTMLEntities(c.name),
          slug: c.slug,
          image: c.image ? { src: c.image.src } : null,
        }));
        setCategories(formatted);
      })
      .catch((err) => {
        console.error('[CategoryCircles Fetch Error]:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color={C.primary} />
      </View>
    );
  }

  if (categories.length === 0) return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
    >
      {categories.map((cat) => {
        const hasImage = cat.image?.src;

        return (
          <TouchableOpacity 
            key={cat.id} 
            style={styles.categoryItem} 
            activeOpacity={0.8}
            onPress={() => onPressCategory(cat.id, cat.name)}
          >
            <View style={[styles.categoryCircle, { backgroundColor: C.primary }]}>
              {hasImage ? (
                <Image 
                  source={{ uri: cat.image!.src }} 
                  style={styles.categoryCircleImage} 
                  contentFit="cover"
                />
              ) : (
                <Icon source={getIconForCategory(cat.slug)} size={28} color={C.surface} />
              )}
            </View>
            
            <Text style={styles.categoryLabel} numberOfLines={2}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
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
    overflow: 'hidden',
  },
  categoryCircleImage: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  categoryLabel: {
    fontSize: 12,
    color: C.text,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 16,
  },
});