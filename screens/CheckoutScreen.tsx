import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import CartButton from '../components/CartButton';

interface CheckoutScreenProps {
  onNavigate: (screenName: string) => void;
}

export default function CheckoutScreen({ onNavigate }: CheckoutScreenProps) {
  // State to track the selected payment method
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod'>('cod');
  const subtotal = 4500; 
  const discount = 0; 
  const shipping = 0; 
  const total = subtotal - discount + shipping;

  // Form states (matching your mockup placeholders)
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [townCity, setTownCity] = useState('');
  const [phone, setPhone] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} >
      
      {/* Header */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Checkout</Text>
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Address Section */}
        <View style={[globalStyles.featuredSectionFrame, { gap: 12, padding: 16 }]}>

          <Text style={styles.sectionHeading}>Shipping Address</Text>
          
          {/* <TouchableOpacity style={styles.addressSelector} activeOpacity={0.7}>
            <View style={styles.addressIconBox}>
              <Icon source="truck-outline" size={24} color="#759388" />
            </View>
            <View style={styles.addressTextContent}>
              <Text style={styles.addressTitle}>Address</Text>
              <Text style={styles.addressSubtitle}>City/Town</Text>
            </View>
            <Icon source="chevron-right" size={20} color={C.subtext} />
          </TouchableOpacity> */}

          {/* Form Grid */}
          <View style={styles.formGrid}>
            {/* Row 1 */}
            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>First Name</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="John"
                  placeholderTextColor={C.subtext}
                  value={firstName}
                  onChangeText={setFirstName}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="johndoe@gmail.com"
                  placeholderTextColor={C.subtext}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
            </View>

            {/* Row 2 */}
            <View style={styles.formRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Town/City</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="Athi river"
                  placeholderTextColor={C.subtext}
                  value={townCity}
                  onChangeText={setTownCity}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone</Text>
                <TextInput 
                  style={styles.textInput}
                  placeholder="+254 712 345 678"
                  placeholderTextColor={C.subtext}
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Payment Details Section */}
        <View style={[globalStyles.featuredSectionFrame, { gap: 12, padding: 16 }]}>
            
            <Text style={styles.sectionHeading}>Payment Details</Text>
            {/* M-Pesa Option */}
            {/* <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'mpesa' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('mpesa')}
                activeOpacity={0.8}
            >
                <View style={styles.paymentIconBox}>
                <Icon source="cash-fast" size={24} color="#52A569" />
                </View>
                <View style={styles.paymentTextContent}>
                <Text style={styles.paymentTitle}>M-Pesa</Text>
                <Text style={styles.paymentSubtitle}>Make sure you have enough money on your wallet</Text>
                </View>
                <Icon 
                source={paymentMethod === 'mpesa' ? "check-circle" : "circle-outline"} 
                size={24} 
                color={paymentMethod === 'mpesa' ? "#000000" : C.subtext} 
                />
            </TouchableOpacity> */}

            {/* Cash On Delivery Option */}
            <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'cod' && styles.paymentOptionActive]} 
                onPress={() => setPaymentMethod('cod')}
                activeOpacity={0.8}
            >
                <View style={styles.paymentIconBox}>
                <Icon source="cash" size={24} color="#759388" />
                </View>
                <View style={styles.paymentTextContent}>
                <Text style={styles.paymentTitle}>Cash On Delivery</Text>
                <Text style={styles.paymentSubtitle}>Pay with cash upon delivery.</Text>
                </View>
                <Icon 
                source={paymentMethod === 'cod' ? "check-circle" : "circle-outline"} 
                size={24} 
                color={paymentMethod === 'cod' ? "#000000" : C.subtext} 
                />
            </TouchableOpacity>

            {/* Add Payment Method Button */}
            {/* <TouchableOpacity style={styles.addPaymentBtn} activeOpacity={0.6}>
                <Text style={styles.addPaymentText}>Add Payment Method</Text>
            </TouchableOpacity> */}

        </View>

      </ScrollView>

        {/* Sticky Footing */}
        <View style={styles.stickyBottomBar}>
            <View>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                {/* Mpesa Input Box */}
                {/* <View style={styles.MpesaContainer}>
                    <TextInput 
                        style={styles.mpesaInput}
                        placeholder="MPESA Number"
                        placeholderTextColor={C.subtext}
                        value={firstName}
                        onChangeText={setFirstName}
                    />
                </View> */}

                {/* Pricing Ledger Rows */}
                <View style={styles.summaryLedger}>
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
                    
                    <View style={styles.summaryDivider} />

                    <View style={styles.ledgerRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>Ksh {total.toLocaleString()}</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.9} onPress={() => onNavigate('OrderConfirmation')}>
            <Text style={styles.checkoutBtnText}>Confirm</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg },
    
    scrollContent: { paddingBottom: 40},
    
    sectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: C.text,
    },

    addressSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.textBox,
        padding: 12,
        borderRadius: 12,
    },
    addressIconBox: {
        width: 40, height: 40,
        borderRadius: 8,
        backgroundColor: C.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: C.border,
    },
    addressTextContent: { flex: 1, marginLeft: 12 },
    addressTitle: { fontSize: 14, fontWeight: '600', color: C.text },
    addressSubtitle: { fontSize: 12, color: C.subtext, marginTop: 2 },

    /* Form Grid Styling */
    formGrid: { gap: 20 },
    formRow: { flexDirection: 'row', gap: 16 },
    inputGroup: { flex: 1 },
    inputLabel: { fontSize: 12, color: C.gray, fontWeight: '700', marginBottom: 4 },
    textInput: {
        fontSize: 14,
        color: C.text,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: 'C.charcoal',
    },

    /* Payment Options Styling */
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'C.lightGrey',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    paymentOptionActive: {
        borderColor: C.border,
        backgroundColor: 'C.white',
    },
    paymentIconBox: {
        width: 40, height: 40,
        borderRadius: 8,
        backgroundColor: 'C.white',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: C.border,
    },
    paymentTextContent: { flex: 1, marginLeft: 12, marginRight: 8 },
    paymentTitle: { fontSize: 14, fontWeight: '600', color: C.text },
    paymentSubtitle: { fontSize: 11, color: C.subtext, marginTop: 2, lineHeight: 16 },

  /* Outlined Button */
    addPaymentBtn: {
        marginTop: 8,
        paddingVertical: 14,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: C.subtext,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addPaymentText: {
        fontSize: 14,
        color: 'C.subtext',
        fontWeight: '500',
    },
  
    summaryTitle: { fontSize: 18, fontWeight: '600', color: C.text, paddingHorizontal: 16, marginBottom: 12 },
    MpesaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 16,
    },
    mpesaInput: { flex: 1, fontSize: 14, color: C.charcoal, width: '100%', backgroundColor: C.textBox, },
    
    summaryLedger: { paddingHorizontal: 16, gap: 12 },
    ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ledgerLabel: { fontSize: 13, color: C.subtext },
    ledgerValue: { fontSize: 13, color: C.text, fontWeight: '500' },
    summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
    totalLabel: { fontSize: 15, fontWeight: '700', color: C.text },
    totalValue: { fontSize: 16, fontWeight: '700', color: C.text },

    stickyBottomBar: {
        backgroundColor: C.white,
        gap: 16,
        padding: 16,
        borderRadius: 24,
    },

    checkoutBtn: {
        backgroundColor: C.primary,
        height: 40,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkoutBtnText: { color: C.white, fontSize: 16, fontWeight: '600' },
});