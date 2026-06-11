import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, globalStyles } from '../styles/theme';

interface OrderConfirmationScreenProps {
  onNavigate: (screenName: string) => void;
}

export default function OrderConfirmationScreen({ onNavigate }: OrderConfirmationScreenProps) {
  // --- Mock Data ---
  const orderInfo = {
    orderNumber: "10838",
    date: "June 10, 2026",
    email: "cmokeira09@gmail.com",
    paymentMethod: "Cash On Delivery"
  };

  const orderItems = [
    { id: 1, name: "Product Name x 1", vendor: "Admin", price: 500 },
    { id: 2, name: "Product Name x 3", vendor: "Admin", price: 300 },
    { id: 3, name: "Product Name x 1", vendor: "Admin", price: 700 },
  ];

  const subtotal = 1500;
  const discount = 0;
  const shipping = 0;
  const total = 1500;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      <View style={[globalStyles.headerRow, { justifyContent: 'center', alignItems: 'center',}]}>
        <Text style={globalStyles.headerTitle}>Thank You!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
  
        <View style={[globalStyles.featuredSectionFrame, { padding: 12, }]}>
          <Text style={styles.successMessage}>Your order has been received.</Text>
          
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>ORDER NUMBER:</Text>
            <Text style={styles.metaValue}>{orderInfo.orderNumber}</Text>
          </View>
          
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{orderInfo.date}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>EMAIL</Text>
            <Text style={styles.metaValue}>{orderInfo.email}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>PAYMENT METHOD</Text>
            <Text style={styles.metaValue}>{orderInfo.paymentMethod}</Text>
          </View>

        </View>

        {/* 3. Itemized Invoice Card */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 12, }]}>
          <Text style={styles.sectionHeading}>Order Details</Text>
          
          <View style={styles.itemList}>
            {orderItems.map((item) => (

              <View key={item.id} style={styles.itemRow}>

                <View style={styles.itemLeft}>

                  <Text style={styles.itemName}>{item.name}</Text>
                  
                  <TouchableOpacity 
                        onPress={() => console.log("Navigate to Vendor Storefront: Sydney's Closet")}
                        activeOpacity={0.6}
                        >
                        <Text style={styles.itemVendor}>
                            Store: <Text style={styles.vendorName}>Sydney's Closet</Text>
                        </Text>
                    </TouchableOpacity>
                    
                </View>
                <Text style={styles.itemPrice}>Ksh {item.price.toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Pricing Ledger */}
          <View style={styles.ledgerBlock}>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Subtotal</Text>
              <Text style={styles.ledgerValue}>Ksh {subtotal.toLocaleString()}</Text>
            </View>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Discount</Text>
              <Text style={styles.ledgerValue}>Ksh {discount.toLocaleString()}</Text>
            </View>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Shipping</Text>
              <Text style={styles.ledgerValue}>Ksh {shipping.toLocaleString()}</Text>
            </View>
            <View style={[styles.ledgerRow, styles.totalRowSpacing]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Ksh {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* 4. Shipping Address Card */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 12, }]}>
          <Text style={styles.sectionHeading}>Shipping Address</Text>
          <View style={styles.addressBlock}>
            <Text style={styles.addressText}>Cynthia</Text>
            <Text style={styles.addressText}>Athi River</Text>
            <Text style={styles.addressText}>0712 345 678</Text>
            <Text style={styles.addressText}>cmokeira09@gmail.com</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg},
    
    // Section 1: Meta Blocks
    successMessage: { fontSize: 20, color: C.text, marginBottom: 20 },
    metaBlock: { marginBottom: 16 },
    metaLabel: { fontSize: 13, color: C.primary, fontWeight: '500', textTransform: 'uppercase', marginBottom: 4 },
    metaValue: { fontSize: 13, color: C.subtext },

    // Section 2: Order Details
    sectionHeading: { fontSize: 18, fontWeight: '600', color: C.text, marginBottom: 16 },
    itemList: { marginBottom: 16 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    itemLeft: { flex: 1, paddingRight: 16 },
    itemName: { fontSize: 14, color: C.text, fontWeight: '700', marginBottom: 4 },
    itemVendor: { fontSize: 12, color: C.subtext },
    vendorName: { color: '#1C4A3A', fontWeight: '500' }, // Brand Green
    itemPrice: { fontSize: 13, color: C.text, fontWeight: '500', marginTop: 2 },
    
    // Ledger
    ledgerBlock: { gap: 10, marginTop: 8 },
    ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ledgerLabel: { fontSize: 13, color: C.subtext },
    ledgerValue: { fontSize: 13, color: C.text },
    totalRowSpacing: { marginTop: 8 },
    totalLabel: { fontSize: 15, fontWeight: '700', color: C.text },
    totalValue: { fontSize: 15, fontWeight: '700', color: C.text },

    // Section 3: Address
    addressBlock: { gap: 8 },
    addressText: { fontSize: 13, color: C.text, lineHeight: 20 },
});