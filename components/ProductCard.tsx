import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { WooProduct } from '../types';
import { C } from '../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 3;

export default function ProductCard({ product }: { product: WooProduct }): React.JSX.Element {
  const img = product.images[0]?.src;
  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.85}>
      <View style={styles.productImgWrapper}>
        {img ? (
          <Image source={{ uri: img }} style={styles.productImg} resizeMode="cover" />
        ) : (
          <View style={[styles.productImg, { backgroundColor: C.border }]} />
        )}
      </View>
      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
      <Text style={styles.productPrice}>${product.price}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // productRow: {
  //   flexDirection: "row",
  //   paddingHorizontal: 16,
  //   gap: 8,
  //   marginTop: 4,
  // },
  productCard: { width: CARD_WIDTH },
  productImgWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: C.border,
    marginBottom: 6,
  },
  productImg: { width: CARD_WIDTH, height: CARD_WIDTH, borderRadius: 12 },
  productName: { fontSize: 13, color: C.text, fontWeight: "600" },
  productPrice: { fontSize: 12, color: C.subtext, marginTop: 2 },
  // viewMoreBtn: { alignItems: "flex-end", paddingHorizontal: 16, marginTop: 8 },
  // viewMoreText: { fontSize: 13, color: C.subtext, fontWeight: "500" },
});