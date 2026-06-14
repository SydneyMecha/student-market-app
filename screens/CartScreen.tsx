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
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { Image } from 'expo-image';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';
import { adaptWooProductToUI } from '../utils/adapters';
import CartButton from '../components/CartButton';
import ProductSection from '../components/ProductSection';

interface CartScreenProps {
  cartItems: any[];
  onUpdateQty: (id: number, delta: number) => void;
  onRemoveItem: (id: number) => void;
  onClearCart: () => void;
  onNavigate: (screenName: string, params?: any) => void;
  onGoBack: () => void;
}

export default function CartScreen({ 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onClearCart, 
  onNavigate, 
  onGoBack 
}: CartScreenProps) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchWooCommerce('products?per_page=4')
      .then((raw) => {
        setRecommendations(raw.map(adaptWooProductToUI));
      })
      .catch((err) => console.error('[Cart Recommendations Error]:', err))
      .finally(() => setLoadingRecs(false));
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );

  // 1. Dynamic WooCommerce REST API Coupon Validator
  const handleApplyCoupon = () => {
    const cleanedCode = couponCode.trim().toLowerCase(); // WC queries codes in lowercase
    if (!cleanedCode) return;

    setApplyingCoupon(true);
    setCouponError(null);
    setCouponSuccess(null);

    // Query WooCommerce coupons database directly
    fetchWooCommerce(`coupons?code=${cleanedCode}`)
      .then((raw: any[]) => {
        if (raw.length === 0) {
          setCouponError("Invalid coupon code");
          setDiscountAmount(0);
          return;
        }

        const coupon = raw[0];
        const minAmount = parseFloat(coupon.minimum_amount || "0");

        // Validate minimum spend threshold
        if (subtotal < minAmount) {
          setCouponError(`Minimum spend is Ksh ${minAmount.toLocaleString()}`);
          setDiscountAmount(0);
          return;
        }

        const amount = parseFloat(coupon.amount || "0");
        const discountType = coupon.discount_type;

        // Calculate discount dynamically based on WooCommerce rules
        let calculatedDiscount = 0;
        if (discountType === 'percent') {
          calculatedDiscount = subtotal * (amount / 100); // e.g. 10% off
        } else {
          calculatedDiscount = Math.min(amount, subtotal); // e.g. flat Ksh discount
        }

        setDiscountAmount(calculatedDiscount);
        setCouponSuccess(`Coupon applied: -Ksh ${calculatedDiscount.toLocaleString()}`);
      })
      .catch((err) => {
        console.error('[WooCommerce Coupon Error]:', err);
        setCouponError("Failed to apply coupon");
        setDiscountAmount(0);
      })
      .finally(() => setApplyingCoupon(false));
  };

  // Re-calculate coupon discount if the subtotal changes (qty modified)
  useEffect(() => {
    if (couponSuccess && couponCode) {
      handleApplyCoupon();
    }
  }, [subtotal]);

  const shipping = 0;
  const total = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
      
        {/* Top Navigation Bar */}
        <View style={globalStyles.headerRow}>
            <TouchableOpacity style={globalStyles.iconBtn} onPress={onGoBack}>
                <Icon source="chevron-left" size={28} color={C.text} />
            </TouchableOpacity>

            <Text style={globalStyles.headerTitle}>Cart</Text>
            
            <TouchableOpacity style={globalStyles.iconBtn} onPress={onClearCart}>
                <Icon source="trash-can-outline" size={24} color={C.text} />
            </TouchableOpacity>
        </View>

        {/* Scrollable Body Content */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Item List */}
            <View style={styles.itemsWrapper}>
            {cartItems.map((item) => {
                const img = item.images[0]?.src || null;
                return (
                  <View key={item.id} style={styles.cartCard}>
                      <TouchableOpacity onPress={() => onNavigate("ProductDetails", item)} activeOpacity={0.7}>
                          <View style={styles.productImagePlaceholder}>
                              {img ? (
                                  <Image source={{ uri: img }} style={styles.cartItemImage} contentFit="cover" />
                              ) : (
                                  <Icon source="image-outline" size={24} color={C.subtext} />
                              )}
                          </View>                        
                      </TouchableOpacity>

                      <View style={styles.productMainDetailsButton}>
                        <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                        
                        {item.categories.length > 0 && (
                          <Text style={styles.categoryBadgeText}>
                            {item.categories.map((c: any) => c.name).join(', ')}
                          </Text>
                        )}
                        
                        {item.store && (
                          <TouchableOpacity onPress={() => onNavigate("VendorInfo", item.store)} activeOpacity={0.6} style={styles.storeHitbox}>
                              <Text style={styles.storeText}>
                                  Store: <Text style={styles.storeName}>{item.store.name}</Text>
                              </Text>
                          </TouchableOpacity>
                        )}

                        <Text style={styles.priceText}>
                            Ksh {parseFloat(item.price).toLocaleString('en-US')}
                        </Text>
                        
                        <View style={styles.actionRow}>
                            <View style={styles.counterBox}>
                                <TouchableOpacity onPress={() => onUpdateQty(item.id, -1)}>
                                    <Icon source="minus-circle-outline" size={22} color={C.subtext} />
                                </TouchableOpacity>
                                <Text style={styles.counterValue}>{item.qty || 1}</Text>
                                <TouchableOpacity onPress={() => onUpdateQty(item.id, 1)}>
                                    <Icon source="plus-circle-outline" size={22} color={C.subtext} />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => onRemoveItem(item.id)} style={styles.itemDeleteBtn}>
                                <Icon source="trash-can-outline" size={20} color={C.subtext} />
                            </TouchableOpacity>
                        </View>
                      </View>
                  </View>
                );
            })}
            
            {cartItems.length === 0 && (
                <Text style={styles.emptyText}>Your shopping basket is empty</Text>
            )}
            </View>

            {/* Recommendations */}
            {loadingRecs ? (
              <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 24 }} />
            ) : recommendations.length > 0 ? (
              <ProductSection 
                title="Products you may like" 
                products={recommendations} 
                showViewMore={false}
                onPressProduct={(p) => onNavigate("ProductDetails", p)}
              />
            ) : null}

        </ScrollView>

        {/* Sticky Footing Summary */}
        <View style={styles.stickyBottomBar}>
            <View>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                {/* Coupon Input Box */}
                <View style={styles.couponContainer}>
                    <Icon source="ticket-percent-outline" size={20} color={C.subtext} />
                    <TextInput
                        placeholder="Coupon code"
                        placeholderTextColor={C.subtext}
                        style={styles.couponInput}
                        value={couponCode}
                        onChangeText={(text) => {
                          setCouponCode(text);
                          // Clear statuses when user is re-typing
                          setCouponError(null);
                          setCouponSuccess(null);
                        }}
                        autoCapitalize="characters"
                    />
                    
                    {/* Render a spinner while calling WooCommerce REST API */}
                    <TouchableOpacity onPress={handleApplyCoupon} style={{ padding: 4 }}>
                      {applyingCoupon ? (
                        <ActivityIndicator size="small" color={C.primary} />
                      ) : (
                        <Icon source="chevron-right" size={24} color={C.primary} />
                      )}
                    </TouchableOpacity>
                </View>

                {/* 2. Interactive Status Messages below the coupon input */}
                {couponError && <Text style={styles.couponErrorText}>{couponError}</Text>}
                {couponSuccess && <Text style={styles.couponSuccessText}>{couponSuccess}</Text>}

                {/* Pricing Ledger Rows */}
                <View style={styles.summaryLedger}>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Subtotal</Text>
                      <Text style={styles.ledgerValue}>Ksh {subtotal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Discount</Text>
                      <Text style={[styles.ledgerValue, discountAmount > 0 && { color: C.accent }]}>
                        - Ksh {discountAmount.toLocaleString()}
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
              activeOpacity={0.9} 
              onPress={() => onNavigate('Checkout', { subtotal, discountAmount: discountAmount, total, cartItems })} // Passes data forward
              disabled={cartItems.length === 0} 
              style={[styles.checkoutBtn, cartItems.length === 0 && { backgroundColor: C.lightGray }]}
            >
                <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg },
    scrollContent: { paddingBottom: 40 },
    cartCard: {
        backgroundColor: C.white, 
        borderRadius: 16,
        padding: 12, 
        alignItems: 'center',
        flexDirection: 'row',
        gap: 24,
        marginBottom: 24
    },
    productMainDetailsButton: {
        flex: 1,
    },
    productImagePlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    cartItemImage: {
        width: '100%',
        height: '100%',
    },
    categoryBadgeText: {
        fontSize: 12,
        color: C.subtext,
        marginTop: 2,
    },
    storeHitbox: { paddingVertical: 2, },
    storeText: { fontSize: 12, color: C.subtext,},
    storeName: { color: '#1C4A3A', fontWeight: '600', },
    priceText: { fontSize: 14, fontWeight: '700', color: '#1C4A3A', marginTop: 4, },
    itemsWrapper: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
    productName: { fontSize: 15, fontWeight: '600', color: C.text },
    variationText: { fontSize: 13, color: C.subtext, marginTop: 2 },
    
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    counterBox: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    counterValue: { fontSize: 14, fontWeight: '600', color: C.text, minWidth: 16, textAlign: 'center' },
    itemDeleteBtn: { padding: 2 },
    emptyText: { textAlign: 'center', color: C.subtext, marginVertical: 32, fontSize: 15 },

    recommendationSection: { marginTop: 24, paddingLeft: 16 },
    sectionHeadingTitle: { fontSize: 15, fontWeight: '600', color: C.text, marginBottom: 12 },
    recommendScrollContainer: { gap: 12, paddingRight: 16 },
    recommendCard: {
        width: 120,
        height: 85,
        borderRadius: 12,
        backgroundColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },

    summaryTitle: { fontSize: 18, fontWeight: '600', color: C.text, paddingHorizontal: 16, marginBottom: 12 },
    couponContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.textBox,
        borderRadius: 12,
        marginHorizontal: 16,
        paddingHorizontal: 12,
        height: 46,
        marginBottom: 8, // Slightly smaller margin to leave room for error text
    },
    couponInput: { flex: 1, marginLeft: 8, fontSize: 14, color: C.text },
    
    // Status text styles
    couponErrorText: {
      color: '#EF4444', // Red text
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    couponSuccessText: {
      color: C.accent, // Dynamic theme accent green text
      fontSize: 12,
      fontWeight: '600',
      paddingHorizontal: 16,
      marginBottom: 12,
    },

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