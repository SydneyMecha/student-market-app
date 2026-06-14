import React from 'react';
import { View } from 'react-native';
import { globalStyles } from '../styles/theme';
import SectionHeader from './SectionHeader';
import { FlatList } from 'react-native';
import ProductCard from './ProductCard';

interface ProductSectionProps {
  title: string;
  products: any[];
  showViewMore?: boolean;
  onPressProduct: (product: any) => void;
  onViewMore?: () => void;
}

export default function ProductSection({ title, products, showViewMore, onPressProduct, onViewMore  }: ProductSectionProps) {
   return (
    <View style={globalStyles.featuredSectionFrame}>
      <SectionHeader 
        title={title} 
        onViewMore={onViewMore ?? (() => {})} 
        showViewMore={showViewMore} 
      />
      
      <FlatList
        data={products}
        horizontal
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProductCard 
            product={item} 
            onPress={() => onPressProduct(item)} 
          />
        )}
      />
    </View>
  );
}
