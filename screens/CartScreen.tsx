import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { PRODUCTS } from '../types';
import ProductSection from '../components/ProductSection';

const RECOMMENDATIONS = [1, 2, 3, 4];

interface CartScreenProps {
  onNavigate: (screenName: string) => void;
}

export default function CartScreen({ onNavigate }: CartScreenProps) {
    const [cartItems, setCartItems] = useState([
        { ...PRODUCTS[0], qty: 1 },
        { ...PRODUCTS[1], qty: 1 },
        { ...PRODUCTS[2], qty: 2 }
    ]);

  // Helper actions to manipulate checkout counts
  const updateQty = (id: number, delta: number) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  // Dynamic calculations for the Order Summary box
  const subtotal = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * item.qty,
    0
  );
  const discount = 0;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
        {/* 1. Top Navigation Bar */}
        <View style={globalStyles.headerRow}>
            <TouchableOpacity style={globalStyles.iconBtn}>
                <Icon source="chevron-left" size={28} color={C.text} />
            </TouchableOpacity>

            <Text style={globalStyles.headerTitle}>Cart</Text>
            
            <TouchableOpacity style={globalStyles.iconBtn} onPress={() => setCartItems([])}>
                <Icon source="trash-can-outline" size={24} color={C.text} />
            </TouchableOpacity>
        </View>

        {/* 2. Scrollable Body Content */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            
            {/* Item List */}
            <View style={styles.itemsWrapper}>
            {cartItems.map((item) => (
                <View key={item.id} style={styles.cartCard}>
                
                {/* Product Image Placeholder */}
                    <TouchableOpacity
                        onPress={() => console.log("Navigate to Product details for id:", item.id)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.productImagePlaceholder}>
                            {item.images && item.images.length > 0 ? (
                                <Image 
                                source={{ uri: item.images[0].src }} 
                                style={styles.cartItemImage} 
                                />
                            ) : (
                                <Icon source="image-outline" size={24} color="C.charcoal" />
                            )}
                        </View>                        
                    </TouchableOpacity>

                {/* Product Main Details */}
                <View style={styles.productMainDetailsButton}>
                   <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    <TouchableOpacity 
                        onPress={() => console.log("Navigate to Vendor Storefront: Sydney's Closet")}
                        activeOpacity={0.6}
                        style={styles.storeHitbox}
                        >
                        <Text style={styles.storeText}>
                            Store: <Text style={styles.storeName}>Sydney's Closet</Text>
                        </Text>
                    </TouchableOpacity>

                    <Text style={styles.priceText}>
                            Ksh {parseFloat(item.price).toLocaleString('en-US')}
                    </Text>
                    <View style={styles.actionRow}>
                        <View style={styles.counterBox}>
                            <TouchableOpacity onPress={() => updateQty(item.id, -1)}>
                                <Icon source="minus-circle-outline" size={22} color={C.subtext} />
                            </TouchableOpacity>
                            {/* Fallback count handling if your backend objects don't contain a mutable count key */}
                            <Text style={styles.counterValue}>{item.qty || 1}</Text>
                            <TouchableOpacity onPress={() => updateQty(item.id, 1)}>
                                <Icon source="plus-circle-outline" size={22} color={C.subtext} />
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => removeItem(item.id)} style={styles.itemDeleteBtn}>
                            <Icon source="trash-can-outline" size={20} color={C.subtext} />
                        </TouchableOpacity>
                    </View>
                </View>
                

                </View>
            ))}
            
            {cartItems.length === 0 && (
                <Text style={styles.emptyText}>Your shopping basket is empty</Text>
            )}
            </View>

            {/* Horizontal Upsell Product Recommendations */}
            <ProductSection 
            title="Products you may like" 
            products={PRODUCTS} 
            showViewMore={false}
            />

        </ScrollView>

        {/* Sticky Footing */}
        <View style={styles.stickyBottomBar}>
            <View>
                <Text style={styles.summaryTitle}>Order Summary</Text>

                {/* Coupon Code Input Box */}
                <View style={styles.couponContainer}>
                    <Icon source="ticket-percent-outline" size={20} color={C.subtext} />
                    <TextInput
                        placeholder="Coupon code"
                        placeholderTextColor={C.subtext}
                        style={styles.couponInput}
                    />
                    <Icon source="chevron-right" size={20} color={C.subtext} />
                </View>

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

            <TouchableOpacity style={styles.checkoutBtn} activeOpacity={0.9} onPress={() => onNavigate('Checkout')}>
                <Text style={styles.checkoutBtnText}>Checkout</Text>
            </TouchableOpacity>
        </View>

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
        resizeMode: 'cover',
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
        marginBottom: 16,
    },
    couponInput: { flex: 1, marginLeft: 8, fontSize: 14, color: C.text },
    
    summaryLedger: { paddingHorizontal: 16, gap: 12 },
    ledgerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ledgerLabel: { fontSize: 13, color: C.subtext },
    ledgerValue: { fontSize: 13, color: C.text, fontWeight: '500' },
    summaryDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
    totalLabel: { fontSize: 15, fontWeight: '700', color: C.text },
    totalValue: { fontSize: 16, fontWeight: '700', color: C.text },

    stickyBottomBar: {
        // position: 'absolute',
        // bottom: 0, left: 0, right: 0,
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