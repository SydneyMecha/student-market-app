import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { useCartCount } from '../services/cartState';

interface CartButtonProps {
  onPress?: () => void;
}

export default function CartButton({ onPress }: CartButtonProps) {
  // Subscribe to the global cart count dynamically
  const cartCount = useCartCount();
  const showBadge = cartCount > 0;

  return (
    <TouchableOpacity style={globalStyles.iconBtn} onPress={onPress} activeOpacity={0.7}>
      <Icon source="cart" size={24} color={C.primary} />
      
      {/* Render the badge only if there are items in the cart */}
      {showBadge && (
        <View style={[styles.dotBadge, { backgroundColor: C.badge }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: C.bg,
  },
});