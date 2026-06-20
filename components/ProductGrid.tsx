import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { WooProduct } from '../types';
import { C } from '../styles/theme';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: WooProduct[];
  showViewMore?: boolean;
  onPressProduct: (product: WooProduct) => void;
  onViewMore?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductGrid({
  products,
  showViewMore = true,
  onPressProduct,
  onViewMore,
}: ProductGridProps) { 
  return (
    <View>
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {products.map((p) => (
          <View key={p.id} style={styles.cardWrapper}>
            <ProductCard product={p as any} onPress={() => onPressProduct(p)} />
          </View>
        ))}
      </ScrollView>
      
      {showViewMore && (
        <TouchableOpacity 
          style={styles.viewMoreBtn} 
          activeOpacity={0.7} 
          onPress={onViewMore}
        >
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 8,                
  },
  cardWrapper: {
    width: (SCREEN_WIDTH - 32 - 16) / 3, 
  },
  viewMoreBtn: { 
    alignItems: "flex-end", 
    paddingHorizontal: 16, 
    marginTop: 16 
  },
  viewMoreText: { 
    fontSize: 16, 
    color: C.primary, 
    fontWeight: "500" 
  },
});