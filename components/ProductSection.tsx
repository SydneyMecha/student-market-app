import React from 'react';
import { View } from 'react-native';
import { WooProduct } from '../types';
import { globalStyles } from '../styles/theme';
import SectionHeader from './SectionHeader';
import ProductGrid from './ProductGrid';
import { FlatList } from 'react-native';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: string;
  products: WooProduct[];
  showViewMore?: boolean;
}

export default function ProductSection({ title, products, showViewMore }: ProductSectionProps) {
  // If no products exist for this category yet, return nothing to keep the screen clean
  if (!products || products.length === 0) return null;

  return (
  <View style={globalStyles.featuredSectionFrame}>
    <SectionHeader 
      title={title} 
      onViewMore={() => {}} 
      showViewMore={showViewMore}
    />

    <FlatList
      data={products}
      horizontal
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item: { id: { toString: () => any; }; }) => item.id.toString()}
      renderItem={({ item }) => <ProductCard product={item} />}

      initialNumToRender={3}
      maxToRenderPerBatch={3}
      windowSize={5}
      removeClippedSubviews={true}
    />
    
  </View>
);
}
