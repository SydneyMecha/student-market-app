import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { C } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3;

interface WooProduct {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  on_sale: boolean;
  images: Array<{ id: number; src: string; alt?: string }>;
}

interface ProductCardProps {
  product: WooProduct;
  onPress?: () => void;
}

export default function ProductCard({ product, onPress }: ProductCardProps): React.JSX.Element {
  const img = product.images[0]?.src;
  
  return (
    <TouchableOpacity 
      style={styles.productCard} 
      activeOpacity={0.85}
      onPress={onPress}
    >
      <View style={styles.productImgWrapper}>
        {img ? (
          <Image source={{ uri: img }} style={styles.productImg} contentFit="cover" />
        ) : (
          <View style={[styles.productImg, { backgroundColor: C.border }]} />
        )}
      </View>
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
      
      <View style={styles.priceRow}>
        {product.on_sale ? (
          <>
            <Text style={styles.salePrice}>Ksh {product.price}</Text>
            <Text style={styles.originalPrice}>Ksh {product.regular_price}</Text>
          </>
        ) : (
          <Text style={styles.productPrice}>Ksh {product.price}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export const ProductCardComponent = memo(ProductCard);

const styles = StyleSheet.create({
  productCard: {
    width: CARD_WIDTH, 
    padding: 4,
  },
  productImgWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: C.border,
    marginBottom: 6,
  },
  productImg: { width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 12 },
  productName: { 
    fontSize: 12, 
    color: C.text, 
    fontWeight: "600" 
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  salePrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: C.primary,
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 12,
    color: C.subtext,
    textDecorationLine: 'line-through',
  },
});