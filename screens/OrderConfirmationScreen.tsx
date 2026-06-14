import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';

interface OrderConfirmationScreenProps {
  order: any; // Mapped WooCommerce order object passed from Checkout
  onNavigate: (screenName: string, params?: any) => void;
}

export default function OrderConfirmationScreen({ order, onNavigate }: OrderConfirmationScreenProps) {
  
  // Safe Guard: prevent crashing if order parameter is missing during transition
  if (!order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // Parse and extract WooCommerce order details dynamically
  const orderNumber = order.id || "N/A";
  
  // Format the WordPress ISO date created string (e.g. "2026-06-10T18:00:00" to "June 10, 2026")
  const orderDate = order.date_created 
    ? new Date(order.date_created).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : "N/A";

  const email = order.billing?.email || "N/A";
  const paymentMethod = order.payment_method_title || "Cash On Delivery";
  const lineItems = order.line_items || [];

  // Parse order summary pricing tallies
  const total = parseFloat(order.total || "0");
  const discount = parseFloat(order.discount_total || "0");
  const shipping = parseFloat(order.shipping_total || "0");
  const subtotal = total + discount - shipping;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header (On pressing back, resets back to Home) */}
      <View style={[globalStyles.headerRow]}>
        <TouchableOpacity 
          style={globalStyles.iconBtn} 
          onPress={() => onNavigate('Home')}
          activeOpacity={0.7}
        >
          <Icon source="chevron-left" size={24} color={C.text} />
        </TouchableOpacity>

        <Text style={globalStyles.headerTitle}>Thank You!</Text>

        <View style={{ width: 36 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
  
        {/* Order Meta Card */}
        <View style={[globalStyles.featuredSectionFrame, { padding: 16, marginBottom: 16 }]}>
          <Text style={styles.successMessage}>Your order has been received.</Text>
          
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>ORDER NUMBER:</Text>
            <Text style={styles.metaValue}>{orderNumber}</Text>
          </View>
          
          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>DATE</Text>
            <Text style={styles.metaValue}>{orderDate}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>EMAIL</Text>
            <Text style={styles.metaValue}>{email}</Text>
          </View>

          <View style={styles.metaBlock}>
            <Text style={styles.metaLabel}>PAYMENT METHOD</Text>
            <Text style={styles.metaValue}>{paymentMethod}</Text>
          </View>
        </View>

        {/* Itemized Invoice Details Card */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 16, marginBottom: 16 }]}>
          <Text style={styles.sectionHeading}>Order Details</Text>
          
          <View style={styles.itemList}>
            {lineItems.map((item: any) => (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemLeft}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
                </View>
                <Text style={styles.itemPrice}>Ksh {parseFloat(item.total).toLocaleString()}</Text>
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
              <Text style={styles.ledgerValue}>- Ksh {discount.toLocaleString()}</Text>
            </View>
            <View style={styles.ledgerRow}>
              <Text style={styles.ledgerLabel}>Shipping</Text>
              <Text style={styles.ledgerValue}>Ksh {shipping.toLocaleString()}</Text>
            </View>
            
            <View style={styles.divider} />

            <View style={[styles.ledgerRow, styles.totalRowSpacing]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>Ksh {total.toLocaleString()}</Text>
            </View>
          </View>
        </View>

        {/* Shipping Address Card */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 16, marginBottom: 16 }]}>
          <Text style={styles.sectionHeading}>Shipping Address</Text>
          <View style={styles.addressBlock}>
            <Text style={styles.addressText}>{order.billing?.first_name || "N/A"}</Text>
            <Text style={styles.addressText}>{order.billing?.city || "N/A"}</Text>
            <Text style={styles.addressText}>{order.billing?.phone || "N/A"}</Text>
            <Text style={styles.addressText}>{order.billing?.email || "N/A"}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg},
    centerStage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    scrollContent: { paddingBottom: 40 },
    
    // Section 1: Meta Blocks
    successMessage: { fontSize: 20, color: C.text, fontWeight: '600', marginBottom: 20 },
    metaBlock: { marginBottom: 16 },
    metaLabel: { fontSize: 13, color: C.primary, fontWeight: '600', textTransform: 'uppercase', marginBottom: 4 },
    metaValue: { fontSize: 13, color: C.subtext },

    // Section 2: Order Details
    sectionHeading: { fontSize: 18, fontWeight: '600', color: C.text, marginBottom: 16 },
    itemList: { marginBottom: 16 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, borderBottomWidth: 0.5, borderBottomColor: C.border, paddingBottom: 12 },
    itemLeft: { flex: 1, paddingRight: 16 },
    itemName: { fontSize: 14, color: C.text, fontWeight: '700', marginBottom: 4 },
    itemQty: { fontSize: 12, color: C.subtext },
    itemPrice: { fontSize: 14, color: C.text, fontWeight: '600', marginTop: 2 },
    
    // Ledger
    ledgerBlock: { gap: 10, marginTop: 8 },
    ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ledgerLabel: { fontSize: 13, color: C.subtext },
    ledgerValue: { fontSize: 13, color: C.text, fontWeight: '500' },
    divider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
    totalRowSpacing: { marginTop: 4 },
    totalLabel: { fontSize: 15, fontWeight: '700', color: C.text },
    totalValue: { fontSize: 15, fontWeight: '700', color: C.text },

    // Section 3: Address
    addressBlock: { gap: 8 },
    addressText: { fontSize: 13, color: C.text, lineHeight: 20, fontWeight: '500' },
});