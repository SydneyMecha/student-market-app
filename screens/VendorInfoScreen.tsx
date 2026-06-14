import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { BASE_URL } from '../services/wooApi';
import { adaptWooProductToUI } from '../utils/adapters';
import { Vendor } from './VendorsScreen';

import CartButton from '../components/CartButton';
import ProductCard from '../components/ProductCard';
import SearchFilterRow from '../components/SearchFilterRow';

interface StoreCategory {
  id: number;
  name: string;
}

interface VendorInfoScreenProps {
  vendor: Vendor;
  onNavigate: (screenName: string, params?: any) => void;
  onGoBack: () => void;
}

export default function VendorInfoScreen({ 
  vendor, 
  onNavigate,
  onGoBack 
}: VendorInfoScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [products, setProducts] = useState<any[]>([]);
  const [storeCategories, setStoreCategories] = useState<StoreCategory[]>([]); // Handles category objects
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [sortBy, setSortBy] = useState('date_desc');
  const [sortLabel, setSortLabel] = useState('Sort by latest');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const bannerSource = vendor?.banner 
    ? { uri: vendor.banner } 
    : require('../assets/default-store-banner.png');

  const getSortParams = (sortType: string) => {
    switch (sortType) {
      case 'popularity':
        return '&orderby=popularity&order=desc';
      case 'rating':
        return '&orderby=rating&order=desc';
      case 'price_asc':
        return '&orderby=price&order=asc';
      case 'price_desc':
        return '&orderby=price&order=desc';
      case 'date_desc':
      default:
        return '&orderby=date&order=desc';
    }
  };

  // Centralized fetch function
  const fetchVendorData = (targetPage = 1, isRefresh = false) => {
    if (!vendor?.id) return Promise.resolve();
    
    const searchParam = searchQuery ? `&search=${searchQuery}` : '';
    const sortParams = getSortParams(sortBy);
    const categoryParam = selectedCategoryId ? `&category=${selectedCategoryId}` : '';
    const url = `${BASE_URL}/wp-json/dokan/v1/stores/${vendor.id}/products?per_page=30&page=${targetPage}${searchParam}${sortParams}${categoryParam}`;

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const pagesHeader = res.headers.get('X-WP-TotalPages') || res.headers.get('x-wp-totalpages');
        setTotalPages(pagesHeader ? parseInt(pagesHeader, 10) : 1);

        return res.json();
      })
      .then((raw: any[]) => {
        const mapped = raw.map(adaptWooProductToUI);
        
        if (isRefresh || targetPage === 1) {
          setProducts(mapped);
        } else {
          setProducts((prev) => [...prev, ...mapped]);
        }

        // Extract and map store categories with unique IDs
         if (!selectedCategoryId && storeCategories.length === 0) {
          const catsMap = new Map<number, string>();
          mapped.forEach(product => {
            product.categories?.forEach((cat: { id: number; name: string }) => {
              if (cat && cat.id && cat.name) {
                catsMap.set(cat.id, cat.name);
              }
            });
          });
          const formattedCats = Array.from(catsMap.entries()).map(([id, name]) => ({ id, name }));
          setStoreCategories(formattedCats);
        }
      })
      .catch((err) => {
        console.error('[Vendor Products Fetch Error]:', err);
      });
  };

  // Re-fetch products whenever page, search query, sorting menu, or store category filter changes
  useEffect(() => {
    if (!vendor?.id) return;

    setLoading(true);
    fetchVendorData(activePage).finally(() => setLoading(false));
  }, [vendor?.id, activePage, searchQuery, sortBy, selectedCategoryId]);

  const onRefresh = () => {
    setRefreshing(true);
    setPageAndReset(1);
    fetchVendorData(1, true).finally(() => setRefreshing(false));
  };

  const setPageAndReset = (newPage: number) => {
    setActivePage(newPage);
  };

  if (!vendor) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={["top"]}>
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading store details...</Text>
          <TouchableOpacity style={[globalStyles.tagChip, { marginTop: 12 }]} onPress={onGoBack}>
            <Text style={globalStyles.tagChipText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const pageList = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <SafeAreaView style={styles.mainContainer} edges={["top"]}>

      {/* Hero Header */}
      <ImageBackground source={bannerSource} style={styles.heroHeaderBackground} imageStyle={styles.heroHeaderImageRadius} >
        <View style={styles.greenOverlayTint} />
        <SafeAreaView style={styles.foregroundLayer}>
          <View style={styles.navRow}>

            <TouchableOpacity style={styles.backButton} onPress={onGoBack}>
              <Icon source="chevron-left" size={24} color={C.white} />
            </TouchableOpacity>

            <CartButton onPress={() => onNavigate("Cart")} />
                
          </View>
          <View style={styles.vendorIdentity}>

            <View style={styles.avatarContainer}>
              {vendor.gravatar ? (
                <ImageBackground source={{ uri: vendor.gravatar }} style={styles.avatarImage} imageStyle={{ borderRadius: 46 }} />
              ) : (
                <Icon source="storefront-outline" size={50} color={C.white} />
              )}
            </View>

            <Text style={styles.vendorName}>{vendor.name}</Text>
            <Text style={styles.vendorDetail}>{vendor.address}, {vendor.city}</Text>
            
          </View>
        </SafeAreaView>
      </ImageBackground>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[C.primary]} 
            tintColor={C.primary} 
          />
        }
      >
          
        {/* Dynamic Store Categories list */}
        {storeCategories.length > 0 && (
          <View style={styles.categoriesCard}>
            <Text style={styles.sectionHeading}>Store Categories</Text>
            <View style={styles.categoriesList}>
              {storeCategories.map((cat) => {
                const isSelected = selectedCategoryId === cat.id;

                return (
                  <View key={cat.id} style={styles.categoryBulletRow}>
                    <View style={[styles.bulletPoint, isSelected && { backgroundColor: C.primary }]} />
                    <TouchableOpacity 
                      activeOpacity={0.6}
                      onPress={() => {
                        // Toggle category filter: if clicking the same one, clear filter, otherwise set it
                        setSelectedCategoryId(prev => prev === cat.id ? null : cat.id);
                        setPageAndReset(1); // Reset back to page 1 on filter change
                      }}
                    >
                      <Text style={[
                        styles.categoryLinkText, 
                        isSelected && { color: C.primary, fontWeight: '700' } // Highlight active category
                      ]}>
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Dynamic Search & Sort Row (Integrated modular component) */}
        <SearchFilterRow 
          placeholderText='Search in store...' 
          searchQuery={searchQuery} 
          onChangeSearch={setSearchQuery} 
          onSelectSort={(sortByOption, labelOption) => {
            setSortBy(sortByOption);
            setSortLabel(labelOption);
            setPageAndReset(1); // Reset back to page 1 on sort change
          }}
        />

        {/* Loading & Grid States */}
        {loading && !refreshing ? ( 
          <View style={styles.centerStage}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={styles.stateText}>Fetching products...</Text>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centerStage}>
            <Text style={styles.stateText}>No products found in this store.</Text>
          </View>
        ) : (
          <View style={styles.productGridWrapper}>
            <View style={styles.inlineGridContainer}>
              {products.map((item) => (
                <View key={item.id} style={styles.gridCardWrapper}>
                  {/* Pass product directly inside navigation parameters */}
                  <ProductCard 
                    product={item as any} 
                    onPress={() => {
                      onNavigate("ProductDetails", item); 
                    }}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pagination */}
        {products.length > 0 && totalPages > 1 && (
          <View style={styles.paginationContainer}>
            {pageList.map((page) => (
              <TouchableOpacity 
                key={page} 
                onPress={() => setPageAndReset(page)}
                style={[styles.pageBubble, activePage === page && styles.pageBubbleActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pageText, activePage === page && styles.pageTextActive]}>{page}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.nextPageBtn} activeOpacity={0.7} onPress={() => setPageAndReset(Math.min(activePage + 1, totalPages))}>
              <Icon source="chevron-right" size={20} color="#1C4A3A" />
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: C.bg },
    heroHeaderBackground: {
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
    },
    heroHeaderImageRadius: {
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    greenOverlayTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(28, 74, 58, 0.75)',
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
    },
    foregroundLayer: {
        zIndex: 2,
        paddingBottom: 24,
    },
    navRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: C.white,
        alignItems: 'center',
        justifyContent: 'center',
    },
    vendorIdentity: {
        alignItems: 'center',
        marginTop: 8,
    },
    avatarContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: C.white,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    avatarImage: {
      width: 92,
      height: 92,
      borderRadius: 46,
    },
    vendorName: {
        fontSize: 22,
        fontWeight: '700',
        color: C.white,
        marginBottom: 4,
    },
    vendorDetail: {
        fontSize: 14,
        color: C.white,
        fontWeight: '500',
        marginTop: 4,
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 40,
    },
    categoriesCard: {
        paddingHorizontal: 24,
        marginBottom: 20,
    },
    sectionHeading: {
        fontSize: 16,
        fontWeight: '700',
        color: C.text,
        marginBottom: 12,
    },
    categoriesList: {
        gap: 8,
    },
    categoryBulletRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    bulletPoint: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: C.subtext,
        marginRight: 8,
    },
    categoryLinkText: {
        fontSize: 14,
        color: C.subtext,
        textDecorationLine: 'underline',
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 24,
        gap: 16,
        zIndex: 9999,
        position: 'relative',
    },
    productGridWrapper: {
        paddingHorizontal: 16,
    },
    inlineGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        rowGap: 16,
        marginBottom: 24,
    },
    gridCardWrapper: {
        width: '30.5%',
        marginHorizontal: '1.4%',
    },
    paginationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 16,
        gap: 12,
    },
    pageBubble: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pageBubbleActive: {
        backgroundColor: C.secondary,
    },
    pageText: {
        fontSize: 14,
        color: C.primary,
        fontWeight: '500',
    },
    pageTextActive: {
        color: C.white,
    },
    nextPageBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: C.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerStage: {
      paddingVertical: 40,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    stateText: {
      fontSize: 14,
      color: C.subtext,
    },
});