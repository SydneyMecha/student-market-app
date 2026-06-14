import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';
import CartButton from '../components/CartButton';

// Enable LayoutAnimation on Android natively
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OrdersScreenProps {
  currentUser: any;
  onNavigate: (screenName: string, params?: any) => void;
  onGoBack: () => void;
}

export default function OrdersScreen({ currentUser, onNavigate, onGoBack }: OrdersScreenProps) {
  const [orders, setOrders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Accordion State: Tracks which order ID's details are currently expanded
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  const fetchCustomerOrders = (targetPage: number, isRefresh = false) => {
    if (!currentUser?.id) return Promise.resolve();

    const endpoint = `orders?customer=${currentUser.id}&per_page=10&page=${targetPage}`;

    return fetchWooCommerce(endpoint)
      .then((raw: any[]) => {
        if (isRefresh || targetPage === 1) {
          setOrders(raw);
        } else {
          setOrders((prev) => [...prev, ...raw]);
        }

        if (raw.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      })
      .catch((err) => {
        console.error('[Orders Screen Fetch Error]:', err);
        setError(err.message);
      });
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchCustomerOrders(1).finally(() => setLoading(false));
  }, [currentUser?.id]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    fetchCustomerOrders(nextPage).finally(() => setLoadingMore(false));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchCustomerOrders(1, true).finally(() => setRefreshing(false));
  };

  // 2. Click handler to toggle the active expanded card with smooth easing transitions
  const toggleExpandOrder = (orderId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return { bg: '#E0F2FE', text: '#0284C7' }; 
      case 'processing':
        return { bg: '#D1FAE5', text: '#059669' }; 
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706' }; 
      case 'cancelled':
      case 'failed':
        return { bg: '#FEE2E2', text: '#DC2626' }; 
      default:
        return { bg: '#F3F4F6', text: '#4B5563' }; 
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={onGoBack}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>

        <Text style={globalStyles.headerTitle}>My Orders</Text>

        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      {/* Main List Layout States */}
      {loading && page === 1 ? (
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerStage}>
          <Icon source="alert-circle-outline" size={44} color="#EF4444" />
          <Text style={[styles.stateText, { color: "#EF4444" }]}>{error}</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerStage}>
          <Icon source="basket-outline" size={48} color={C.subtext} />
          <Text style={styles.stateText}>You haven't placed any orders yet.</Text>
          <TouchableOpacity 
            style={[globalStyles.tagChip, { marginTop: 12, backgroundColor: C.primary }]} 
            onPress={() => onNavigate("Home")}
          >
            <Text style={[globalStyles.tagChipText, { color: C.white }]}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const date = item.date_created 
              ? new Date(item.date_created).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric' // E.g., June 14, 2026
                })
              : "N/A";

            const status = getStatusStyle(item.status);
            const isExpanded = expandedOrderId === item.id;
            const itemsSummary = item.line_items?.map((li: any) => `${li.name} x ${li.quantity}`).join(', ');

            // Pricing totals
            const totalVal = parseFloat(item.total || "0");
            const discountVal = parseFloat(item.discount_total || "0");
            const shippingVal = parseFloat(item.shipping_total || "0");
            const subtotalVal = totalVal + discountVal - shippingVal;

            return (
              <View style={styles.orderCard}>
                
                {/* Top Row: Order Number & Status Badge */}
                <View style={styles.cardHeader}>
                  <Text style={styles.orderNumber}>Order #{item.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                    <Text style={[styles.statusText, { color: status.text }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Middle Section: Items Summary (Hidden if card is expanded) */}
                {!isExpanded && (
                  <Text style={styles.itemsText} numberOfLines={2}>
                    {itemsSummary || "No items listed"}
                  </Text>
                )}

                {/* ─── 3. Dynamic Expanded Details Dropdown (Web Invoice Replica) ─── */}
                {isExpanded && (
                  <View style={styles.expandedDetails}>
                    
                    {/* Prompt Header */}
                    <Text style={styles.expandedPromptText}>
                      Order <Text style={{ fontWeight: '700' }}>#{item.id}</Text> was placed on <Text style={{ fontWeight: '700' }}>{date}</Text> and is currently <Text style={{ fontWeight: '700' }}>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</Text>.
                    </Text>

                    {/* Table Title */}
                    <Text style={styles.detailSectionTitle}>Order details</Text>

                    {/* Invoice Table Headers */}
                    <View style={styles.tableHeaderRow}>
                      <Text style={styles.tableHeaderLabel}>Product</Text>
                      <Text style={styles.tableHeaderValue}>Total</Text>
                    </View>
                    <View style={styles.tableDivider} />

                    {/* Itemized Line Rows */}
                    {item.line_items?.map((li: any) => (
                      <View key={li.id} style={styles.detailItemRow}>
                        <View style={{ flex: 1, paddingRight: 16 }}>
                          <Text style={styles.detailItemName}>{li.name} × {li.quantity}</Text>
                          {item.stores && item.stores[0] && (
                            <Text style={styles.detailItemVendor}>
                              Vendor: <Text style={styles.detailVendorName}>{item.stores[0].name}</Text>
                            </Text>
                          )}
                        </View>
                        <Text style={styles.detailItemPrice}>Ksh {parseFloat(li.total).toLocaleString()}</Text>
                      </View>
                    ))}
                    <View style={styles.tableDivider} />

                    {/* Pricing Ledger rows */}
                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Subtotal:</Text>
                      <Text style={styles.ledgerValue}>Ksh {subtotalVal.toLocaleString()}</Text>
                    </View>
                    <View style={styles.tableDivider} />

                    {/* Discount row (Only shown if a discount exists) */}
                    {discountVal > 0 && (
                      <>
                        <View style={styles.ledgerRow}>
                          <Text style={styles.ledgerLabel}>Discount:</Text>
                          <Text style={[styles.ledgerValue, { color: C.accent }]}>- Ksh {discountVal.toLocaleString()}</Text>
                        </View>
                        <View style={styles.tableDivider} />
                      </>
                    )}

                    <View style={styles.ledgerRow}>
                      <Text style={styles.ledgerLabel}>Payment method:</Text>
                      <Text style={styles.ledgerValue}>{item.payment_method_title}</Text>
                    </View>
                    <View style={styles.tableDivider} />

                    <View style={styles.ledgerRow}>
                      <Text style={styles.totalLabel}>Total:</Text>
                      <Text style={styles.totalValueBold}>Ksh {totalVal.toLocaleString()}</Text>
                    </View>

                    {/* Dynamic Billing Address Box */}
                    <Text style={[styles.detailSectionTitle, { marginTop: 24 }]}>Billing address</Text>
                    <View style={styles.billingCard}>
                      <Text style={styles.billingText}>{item.billing?.first_name || "N/A"}</Text>
                      <Text style={styles.billingText}>{item.billing?.city || "N/A"}</Text>
                      
                      {item.billing?.phone && (
                        <View style={styles.billingIconRow}>
                          <Icon source="phone-outline" size={16} color={C.subtext} />
                          <Text style={styles.billingIconText}>{item.billing.phone}</Text>
                        </View>
                      )}
                      
                      {item.billing?.email && (
                        <View style={styles.billingIconRow}>
                          <Icon source="email-outline" size={16} color={C.subtext} />
                          <Text style={styles.billingIconText}>{item.billing.email}</Text>
                        </View>
                      )}
                    </View>

                  </View>
                )}

                <View style={styles.cardDivider} />

                {/* Bottom Row: Timestamp, Price, and Expand Trigger Button */}
                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{date}</Text>
                  
                  {!isExpanded && (
                    <Text style={styles.totalPrice}>
                      Ksh {parseFloat(item.total).toLocaleString()}
                    </Text>
                  )}

                  {/* Dynamic Trigger Button */}
                  <TouchableOpacity 
                    style={styles.seeMoreBtn} 
                    onPress={() => toggleExpandOrder(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.seeMoreText}>
                      {isExpanded ? "See Less ▴" : "See More ▾"}
                    </Text>
                  </TouchableOpacity>
                </View>

              </View>
            );
          }}

          refreshing={refreshing}
          onRefresh={handleRefresh}

          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}

          ListFooterComponent={
            loadingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={C.primary} />
              </View>
            ) : null
          }
        />
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 12,
  },
  
  orderCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemsText: {
    fontSize: 13,
    color: C.subtext,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardDivider: {
    height: 0.5,
    backgroundColor: C.border,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: C.subtext,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: C.primary,
  },
  seeMoreBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    backgroundColor: '#F9FAFB',
  },
  seeMoreText: {
    fontSize: 12,
    color: C.primary,
    fontWeight: '700',
  },
  expandedDetails: {
    marginTop: 4,
    marginBottom: 16,
  },
  expandedPromptText: {
    fontSize: 13,
    color: C.text,
    lineHeight: 20,
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
    marginBottom: 16,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tableHeaderLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  tableHeaderValue: {
    fontSize: 13,
    fontWeight: '700',
    color: C.text,
  },
  tableDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 12,
  },
  detailItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItemName: {
    fontSize: 14,
    color: C.text,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailItemVendor: {
    fontSize: 12,
    color: C.subtext,
  },
  detailVendorName: {
    color: '#1C4A3A',
    fontWeight: '600',
  },
  detailItemPrice: {
    fontSize: 13,
    color: C.text,
    fontWeight: '600',
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ledgerLabel: {
    fontSize: 13,
    color: C.text,
    fontWeight: '600',
  },
  ledgerValue: {
    fontSize: 13,
    color: C.text,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: C.text,
  },
  totalValueBold: {
    fontSize: 15,
    fontWeight: '700',
    color: C.text,
  },
  billingCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: C.border,
    gap: 8,
  },
  billingText: {
    fontSize: 13,
    color: C.text,
    fontWeight: '500',
  },
  billingIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  billingIconText: {
    fontSize: 13,
    color: C.subtext,
    fontWeight: '500',
  },

  centerStage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  stateText: {
    fontSize: 14,
    color: C.subtext,
  },
});