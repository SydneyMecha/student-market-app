import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';
import { Vendor } from '../screens/VendorsScreen';

interface VendorCardProps {
  vendor: Vendor;
  onPress: () => void;
}

export default function VendorCard({ vendor, onPress }: VendorCardProps) {
  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Left: Image Placeholder */}
      <View style={styles.imagePlaceholder}>
        <Icon source="storefront-outline" size={28} color="rgba(255,255,255,0.7)" />
      </View>

      {/* Middle: Vendor Details */}
      <View style={styles.infoContainer}>
        <Text style={styles.vendorName}>{vendor.name}</Text>
        <Text style={styles.addressText}>{vendor.address}</Text>
        <Text style={styles.cityText}>{vendor.city}</Text>
      </View>

      {/* Right: Navigation Indicator */}
      <Icon source="chevron-right" size={20} color={C.subtext} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent', 
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E2E8F0', // Light grey matching the mockup
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  vendorName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 4,
  },
  addressText: {
    fontSize: 13,
    color: C.subtext,
    marginBottom: 2,
  },
  cityText: {
    fontSize: 11,
    color: '#9CA3AF', // Slightly lighter grey for the tertiary town text
  },
});