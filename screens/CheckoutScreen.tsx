import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';
import CartButton from '../components/CartButton';

interface CheckoutParams {
  subtotal: number;
  discountAmount: number;
  total: number;
  cartItems: any[];
}

interface CheckoutScreenProps {
  routeParams: CheckoutParams; 
  currentUser: any; 
  onNavigate: (screenName: string, params?: any) => void;
  onLoginSuccess?: (user: any) => void; 
  onGoBack: () => void;
  onClearCart?: () => void;
}

export default function CheckoutScreen({ routeParams, currentUser, onNavigate, onLoginSuccess, onGoBack, onClearCart  }: CheckoutScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cod'>('cod');
  const [confirming, setConfirming] = useState(false);
  const [createAccount, setCreateAccount] = useState(false); // Controls guest auto-registration

  // Extract totals dynamically from routing parameters
  const subtotal = routeParams?.subtotal || 0; 
  const discount = routeParams?.discountAmount || 0; 
  const shipping = 0; 
  const total = routeParams?.total || 0;

  const hasSavedAddress = currentUser && 
    currentUser.billing?.first_name && 
    currentUser.billing?.first_name !== "NaN" &&
    currentUser.billing?.city && 
    currentUser.billing?.city !== "NaN";

  // Form states (Pre-filled automatically if currentUser session is active)
  const [firstName, setFirstName] = useState(currentUser?.billing?.first_name || currentUser?.fullName?.split(' ')[0] || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [townCity, setTownCity] = useState(currentUser?.billing?.city || '');
  const [phone, setPhone] = useState(currentUser?.billing?.phone || '');

  // Centralized Order Poster (Associates the order with a Customer ID if provided)
  const submitOrderToWooCommerce = (customerId = 0) => {
    const finalBilling = hasSavedAddress ? {
      first_name: currentUser.fullName?.split(' ')[0] || currentUser.username,
      email: currentUser.email,
      city: currentUser.billing?.city || currentUser.shipping?.city,
      phone: currentUser.billing?.phone || "",
    } : {
      first_name: firstName,
      email: email,
      city: townCity,
      phone: phone,
    };

    const orderData = {
      payment_method: paymentMethod,
      payment_method_title: paymentMethod === 'cod' ? 'Cash on Delivery' : 'M-Pesa Mobile Money',
      status: "processing", 
      set_paid: false,       
      customer_id: customerId, 
      billing: finalBilling,
      shipping: {
        first_name: finalBilling.first_name,
        city: finalBilling.city,
      },
      line_items: routeParams.cartItems.map(item => ({
        product_id: item.id,
        quantity: item.qty
      }))
    };

    fetchWooCommerce('orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => {
      if (onClearCart) {
        onClearCart();
      }
      onNavigate('OrderConfirmation', res); 
    })
    .catch((err) => {
      console.error('[WooCommerce Order Create Error]:', err);
      Alert.alert("Checkout Failed", "There was an issue submitting your order. Please try again.");
    })
    .finally(() => setConfirming(false));
  };

  // Click handler managing the dynamic order creation + registration + address saving pipeline
  const handleConfirmOrder = () => {
    // Standard validation only if we are using the form inputs (not using a saved address)
    if (!hasSavedAddress) {
      if (!firstName.trim() || !email.trim() || !townCity.trim() || !phone.trim()) {
        Alert.alert("Missing Details", "Please fill in all shipping address fields before confirming.");
        return;
      }
    }

    if (!routeParams?.cartItems || routeParams.cartItems.length === 0) {
      Alert.alert("Empty Cart", "Your cart is empty. Please add items before placing an order.");
      return;
    }

    setConfirming(true);

    const executeOrderPlacement = (customerId: number) => {
      submitOrderToWooCommerce(customerId);
    };

    // PIPELINE 1: If "Create account" is checked and the user is NOT logged in, register them first!
    if (createAccount && !currentUser) {
      const generatedUsername = email.split('@')[0] + Math.floor(100 + Math.random() * 900);
      
      const customerPayload = {
        email: email.trim().toLowerCase(),
        username: generatedUsername,
        first_name: firstName,
        billing: {
          first_name: firstName,
          city: townCity,
          phone: phone,
          email: email.trim().toLowerCase(),
        },
        shipping: {
          first_name: firstName,
          city: townCity,
          phone: phone,
        }
      };

      fetchWooCommerce('customers', {
        method: 'POST',
        body: JSON.stringify(customerPayload),
        headers: { 'Content-Type': 'application/json' }
      })
      .then((newCustomer) => {
        // Log them in on the client side automatically
        if (onLoginSuccess) {
          onLoginSuccess({
            id: newCustomer.id,
            username: newCustomer.display_name || newCustomer.username || "NaN",
            email: newCustomer.email || "NaN",
            fullName: `${newCustomer.first_name || ''} ${newCustomer.last_name || ''}`.trim() || "NaN",
            billing: {
              first_name: newCustomer.billing?.first_name || "NaN",
              city: newCustomer.billing?.city || "NaN",
              phone: newCustomer.billing?.phone || "NaN",
              email: newCustomer.billing?.email || "NaN",
            },
            shipping: {
              first_name: newCustomer.shipping?.first_name || "NaN",
              city: newCustomer.shipping?.city || "NaN",
              phone: newCustomer.shipping?.phone || "NaN",
            }
          });
        }
        executeOrderPlacement(newCustomer.id);
      })
      .catch((err) => {
        console.error('[WooCommerce Auto-Register Error]:', err);
        // Fallback: If registration fails, place order as guest
        executeOrderPlacement(0);
      });
    } 
    // PIPELINE 2: If logged in, but their address fields were previously empty -> Save them now!
    else if (currentUser && !hasSavedAddress) {
      const addressPayload = {
        shipping: {
          first_name: firstName,
          city: townCity,
          phone: phone,
        },
        billing: {
          first_name: firstName,
          city: townCity,
          phone: phone,
          email: email,
        }
      };

      fetchWooCommerce(`customers/${currentUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(addressPayload),
        headers: { 'Content-Type': 'application/json' }
      })
      .then((updatedCustomer) => {
        // Refresh our global session state with the newly saved addresses
        if (onLoginSuccess) {
          onLoginSuccess({
            id: updatedCustomer.id,
            username: updatedCustomer.display_name || updatedCustomer.username || "NaN",
            email: updatedCustomer.email || "NaN",
            fullName: `${updatedCustomer.first_name || ''} ${updatedCustomer.last_name || ''}`.trim() || "NaN",
            billing: {
              first_name: updatedCustomer.billing?.first_name || "NaN",
              city: updatedCustomer.billing?.city || "NaN",
              phone: updatedCustomer.billing?.phone || "NaN",
              email: updatedCustomer.billing?.email || "NaN",
            },
            shipping: {
              first_name: updatedCustomer.shipping?.first_name || "NaN",
              city: updatedCustomer.shipping?.city || "NaN",
              phone: updatedCustomer.shipping?.phone || "NaN",
            }
          });
        }
        executeOrderPlacement(updatedCustomer.id);
      })
      .catch((err) => {
        console.error('[WooCommerce Save Address On Checkout Error]:', err);
        executeOrderPlacement(currentUser.id); // Proceed even if metadata update failed
      });
    } 
    // PIPELINE 3: Standard flow (already logged in with address, or guest checkout)
    else {
      executeOrderPlacement(currentUser?.id || 0);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={onGoBack}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>Checkout</Text>
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      {/* Keyboard Avoiding Wrapper */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Address Section */}
          <View style={[globalStyles.featuredSectionFrame, { padding: 16, marginBottom: 16 }]}>
            <Text style={styles.sectionHeading}>Shipping Address</Text>
            
            {hasSavedAddress ? (
              // ─── CASE A: If logged in with address, render the static Address Card ───
              <View style={styles.addressSelector}>
                <View style={styles.addressIconBox}>
                  <Icon source="truck-outline" size={24} color="#759388" />
                </View>
                <View style={styles.addressTextContent}>
                  <Text style={styles.addressTitle}>{currentUser.fullName}</Text>
                  <Text style={styles.addressSubtitle}>
                    {currentUser.billing?.city || currentUser.shipping?.city}
                  </Text>
                </View>
                {/* Chevron redirects straight to EditProfile's address section if clicked */}
                <TouchableOpacity onPress={() => onNavigate("EditProfile", { mode: 'address' })} style={{ padding: 4 }}>
                  <Icon source="chevron-right" size={24} color={C.primary} />
                </TouchableOpacity>
              </View>
            ) : (
              // ─── CASE B: If not logged in (or address is empty), render the Form Fields ───
              <View style={styles.formGrid}>
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
                      editable={!currentUser} // Lock email input field if logged in
                    />
                  </View>
                </View>

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
            )}

            {/* Conditional Auto-Registration Checkbox (Only shown if guest user) */}
            {!currentUser && (
              <TouchableOpacity 
                style={styles.checkboxRow} 
                onPress={() => setCreateAccount(!createAccount)}
                activeOpacity={0.7}
              >
                <Icon 
                  source={createAccount ? "checkbox-marked" : "checkbox-blank-outline"} 
                  size={22} 
                  color={createAccount ? C.primary : C.subtext} 
                />
                <Text style={styles.checkboxText}>Create account</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Payment Details Section */}
          <View style={[globalStyles.featuredSectionFrame, { gap: 12, padding: 16, marginBottom: 16 }]}>
              <Text style={styles.sectionHeading}>Payment Details</Text>

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
                    color={paymentMethod === 'cod' ? C.primary : C.subtext} 
                  />
              </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Sticky Footing Summary */}
        <View style={styles.stickyBottomBar}>
            <View>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                {/* Pricing Ledger Rows */}
                <View style={styles.summaryLedger}>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Subtotal</Text>
                      <Text style={styles.ledgerValue}>Ksh {subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Discount</Text>
                      <Text style={[styles.ledgerValue, discount > 0 && { color: C.accent }]}>
                        - Ksh {discount.toLocaleString()}
                      </Text>
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

            <TouchableOpacity 
              style={[
                styles.checkoutBtn,
                confirming && { backgroundColor: C.lightGray }
              ]} 
              activeOpacity={0.9} 
              onPress={handleConfirmOrder}
              disabled={confirming}
            >
              {confirming ? (
                <ActivityIndicator size="small" color={C.secondary} />
              ) : (
                <Text style={styles.checkoutBtnText}>Confirm Order</Text>
              )}
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg },
    scrollContent: { paddingBottom: 40 },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: C.text,
        marginBottom: 12,
    },
    
    // Address selector layout styling
    addressSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Light gray background
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: C.border,
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
    addressTitle: { fontSize: 14, fontWeight: '700', color: C.text },
    addressSubtitle: { fontSize: 12, color: C.subtext, marginTop: 2, fontWeight: '500' },

    formGrid: { gap: 20 },
    formRow: { flexDirection: 'row', gap: 16 },
    inputGroup: { flex: 1 },
    inputLabel: { fontSize: 12, color: C.gray, fontWeight: '700', marginBottom: 4 },
    textInput: {
        fontSize: 14,
        color: C.text,
        paddingVertical: 8,
        borderBottomWidth: 0.5,
        borderColor: C.subtext,
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 16,
      paddingTop: 16,
      borderTopWidth: 0.5,
      borderTopColor: C.border,
    },
    checkboxText: {
      fontSize: 14,
      color: C.text,
      fontWeight: '500',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', 
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    paymentOptionActive: {
        borderColor: C.border,
        backgroundColor: C.white, 
    },
    paymentIconBox: {
        width: 40, height: 40,
        borderRadius: 8,
        backgroundColor: C.white, 
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: C.border,
    },
    paymentTextContent: { flex: 1, marginLeft: 12, marginRight: 8 },
    paymentTitle: { fontSize: 14, fontWeight: '600', color: C.text },
    paymentSubtitle: { fontSize: 11, color: C.subtext, marginTop: 2, lineHeight: 16 },
    summaryTitle: { fontSize: 18, fontWeight: '600', color: C.text, paddingHorizontal: 16, marginBottom: 12 },
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