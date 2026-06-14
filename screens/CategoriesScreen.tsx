import React, { useState, useEffect } from 'react';
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
import { Image } from 'expo-image';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';
import { adaptWooProductToUI } from '../utils/adapters';
import { decodeHTMLEntities } from '../utils/stringUtils';
import CartButton from '../components/CartButton';
import SearchBar from '../components/SearchBar';
import DynamicProductSection from '../components/DynamicProductSection';

// Category schema interface
interface WooCommerceCategory {
  id: number;
  name: string;
  parent: number;
  slug: string;
}

interface CategoriesScreenProps {
  onNavigate: (screenName: string, params?: any) => void;
}

export default function CategoriesScreen({ onNavigate }: CategoriesScreenProps) {
  const [categories, setCategories] = useState<WooCommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track the currently selected parent category object
  const [activeParent, setActiveParent] = useState<WooCommerceCategory | null>(null);

  // Search Suggestion States
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  // 1. Fetch Categories on mount
  useEffect(() => {
    fetchWooCommerce('products/categories?per_page=100&hide_empty=true')
      .then((raw: any[]) => {
        const formatted: WooCommerceCategory[] = raw.map(c => ({
          id: c.id,
          name: decodeHTMLEntities(c.name), 
          parent: c.parent,
          slug: c.slug,
        }));
        setCategories(formatted);

        const parents = formatted.filter(c => c.parent === 0);
        if (parents.length > 0) {
          setActiveParent(parents[0]);
        }
      })
      .catch((err) => {
        console.error('[Categories Screen Fetch Error]:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // 2. Debounced Search suggest fetcher (Matching HomeScreen logic)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSearchActive(false);
      return;
    }

    setSearchLoading(true);
    const delayDebounceFn = setTimeout(() => {
      fetchWooCommerce(`products?search=${searchQuery}&per_page=10`)
        .then((raw) => {
          const mapped = raw.map(adaptWooProductToUI);
          setSearchResults(mapped);
          setSearchActive(mapped.length > 0);
        })
        .catch((err) => console.error('[Search Suggestion Error]:', err))
        .finally(() => setSearchLoading(false));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const parentCategories = categories.filter(c => c.parent === 0);
  const childCategories = activeParent 
    ? categories.filter(c => c.parent === activeParent.id) 
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header Row */}
      <View style={[globalStyles.headerRow, styles.stickyHeaderWrapper]}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={() => onNavigate("Home")}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        
        {/* Connected search state value and onChangeText hooks */}
        <SearchBar 
          placeholderText='Search for products...' 
          value={searchQuery}
          onChangeText={setSearchQuery}
          loading={searchLoading}
          onFocus={() => {
            if (searchQuery.trim().length > 0 && searchResults.length > 0) {
              setSearchActive(true);
            }
          }}
        />

        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      {/* Dimmed Backdrop (Closes search on tap) */}
      {searchActive && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={() => setSearchActive(false)}
        />
      )}

      {/* Floating Suggestions Dropdown Card (Mounted on screen level) */}
      {searchActive && searchResults.length > 0 && (
        <View style={styles.dropdownCard}>
          <Text style={styles.dropdownLabel}>PRODUCT</Text>
          <ScrollView 
            style={styles.scrollableDropdown}
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}
          >
            {searchResults.map((product) => {
              const img = product.images[0]?.src;
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.resultRow}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSearchQuery(''); // Reset state
                    setSearchResults([]);
                    setSearchActive(false);
                    onNavigate("ProductDetails", product);
                  }}
                >
                  <View style={styles.thumbWrapper}>
                    {img ? (
                      <Image source={{ uri: img }} style={styles.thumb} contentFit="contain" />
                    ) : (
                      <View style={[styles.thumb, { backgroundColor: C.border }]} />
                    )}
                  </View>

                  <View style={styles.metaRow}>
                    <Text style={styles.productName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <View style={styles.priceContainer}>
                      {product.on_sale ? (
                        <>
                          <Text style={styles.originalPrice}>Ksh {product.regular_price}</Text>
                          <Text style={styles.salePrice}>Ksh {product.price}</Text>
                        </>
                      ) : (
                        <Text style={styles.normalPrice}>Ksh {product.price}</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading categories...</Text>
        </View>
      ) : (
        /* Two-Column Split Layout */
        <View style={styles.splitContainer}>
          
          {/* LEFT COLUMN: Sticky Parent Sidebar Navigation */}
          <View style={styles.sidebar}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sidebarScroll}>
              {parentCategories.map((cat) => {
                const isActive = activeParent?.id === cat.id;
                return (
                  <TouchableOpacity 
                    key={cat.id}
                    style={[styles.sidebarTab, isActive && styles.sidebarTabActive]}
                    onPress={() => setActiveParent(cat)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.sidebarTabText, isActive && styles.sidebarTabTextActive]}>
                      {cat.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* RIGHT COLUMN: Subcategory Products Content Blocks */}
          <View style={styles.mainContent}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mainContentScroll}>
              
              {childCategories.length > 0 ? (
                childCategories.map((subCat) => (
                  <DynamicProductSection 
                    key={subCat.id}
                    type="product-category"
                    title={subCat.name}
                    id={subCat.id}
                    onPressProduct={(product) => onNavigate("ProductDetails", product)}
                    onPressCategory={(param) => onNavigate("ProductArchive", param)}
                  />
                ))
              ) : (
                activeParent && (
                  <DynamicProductSection 
                    key={activeParent.id}
                    type="product-category"
                    title={activeParent.name}
                    id={activeParent.id}
                    onPressProduct={(product) => onNavigate("ProductDetails", product)}
                    onPressCategory={(param) => onNavigate("ProductArchive", param)}
                  />
                )
              )}

            </ScrollView>
          </View>

        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: C.bg },
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
    splitContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: C.bg,
    },
    sidebar: {
      width: 110,
      backgroundColor: C.white,
      borderRightWidth: 1,
      borderColor: C.border,
    },
    sidebarScroll: {
        paddingBottom: 40,
    },
    sidebarTab: {
      paddingVertical: 16,
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderColor: C.border,
      justifyContent: 'center',
    },
    sidebarTabActive: {
      backgroundColor: C.bg,
      borderLeftWidth: 4,
      borderLeftColor: C.primary,
      paddingLeft: 8,
    },
    sidebarTabText: {
      fontSize: 13,
      color: C.subtext,
      fontWeight: '500',
      lineHeight: 18,
    },
    sidebarTabTextActive: {
      color: C.secondary,
      fontWeight: '700',
    },
    mainContent: {
      flex: 1,
    },
    mainContentScroll: {
      paddingBottom: 40,
    },

    /* Search Dropdown & Backdrop Layout Styles */
    stickyHeaderWrapper: {
      zIndex: 9999, 
      position: 'relative',
      backgroundColor: C.bg,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
      zIndex: 9998, 
    },
    dropdownCard: {
      position: 'absolute',
      top: 110, // Sits exactly below the header
      left: 16,
      right: 16,
      backgroundColor: C.white,
      borderRadius: 20,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
      zIndex: 10000, 
    },
    dropdownLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#9CA3AF', 
      letterSpacing: 1,
      marginBottom: 10,
    },
    scrollableDropdown: {
      maxHeight: 240, 
    },
    resultRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6',
    },
    thumbWrapper: {
      width: 60,
      height: 60,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F9FAFB',
      marginRight: 12,
    },
    thumb: {
      width: 50,
      height: 50,
      borderRadius: 12,
    },
    metaRow: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    productName: {
      flex: 1,
      fontSize: 14,
      color: '#3B82F6', 
      fontWeight: '600',
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    normalPrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: C.text,
    },
    salePrice: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#111827', 
    },
    originalPrice: {
      fontSize: 12,
      color: '#9CA3AF', 
      textDecorationLine: 'line-through',
    },
});