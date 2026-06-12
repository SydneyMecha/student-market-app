import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { WooProduct } from '../types';
import { C } from '../styles/theme';
import ProductCard from './ProductCard';

// Grab the total width of the user's phone screen dynamically
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductGrid({
  products,
  showViewMore = true,
}: {
  products: WooProduct[];
  showViewMore?: boolean;
}) {
  return (
    <View style={styles.container}>
      {/* We swap the standard View wrapper for a horizontal ScrollView.
        - horizontal={true}: Enables side-to-side swiping.
        - showsHorizontalScrollIndicator={false}: Hides the ugly native scrollbar at the bottom.
        - contentContainerStyle: Applies padding to the inside scroll container so items don't clip.
      */}
      <ScrollView 
        horizontal={true} 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {products.map((p) => (
          // To ensure a max of 3 products fit perfectly on the screen with their spacing,
          // we wrap each card in a container that has a calculated responsive width.
          <View key={p.id} style={styles.cardWrapper}>
            <ProductCard product={p} />
          </View>
        ))}
      </ScrollView>
      
      {showViewMore && (
        <TouchableOpacity style={styles.viewMoreBtn} activeOpacity={0.7}>
          <Text style={styles.viewMoreText}>View More</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
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
    marginTop: 8 
  },
  viewMoreText: { 
    fontSize: 16, 
    color: C.primary, 
    fontWeight: "500" 
  },
});