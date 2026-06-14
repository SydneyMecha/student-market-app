import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';
import { Vendor } from '../screens/VendorsScreen';

interface VendorCardProps {
  vendor: Vendor;
  onPress: (screenName: string) => void;
}

export default function VendorCard({ vendor, onPress }: VendorCardProps) {
  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={() => onPress("VendorInfo")}
      activeOpacity={0.7}
    >
      <View style={styles.imagePlaceholder}>
        {vendor.gravatar ? (
            <ImageBackground source={{ uri: vendor.gravatar }} style={styles.avatarImage} imageStyle={{ borderRadius: 46 }} />
          ) : (
            <Icon source="storefront-outline" size={50} color={C.white} />
          )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.vendorName}>{vendor.name}</Text>
        <Text style={styles.addressText}>{vendor.address}</Text>
        <Text style={styles.cityText}>{vendor.city}</Text>
      </View>

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
    borderRadius: 100,
    backgroundColor: C.lightBlue,
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
    color: '#9CA3AF',
  },
  avatarImage: {
      width: '100%',
    height: '100%',
    },
});