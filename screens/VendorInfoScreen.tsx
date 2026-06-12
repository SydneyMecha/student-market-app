import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  ActivityIndicator,
  RefreshControl, // 1. Import RefreshControl
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { BASE_URL } from '../services/wooApi';
import { adaptWooProductToUI } from '../utils/adapters';
import { Vendor } from './VendorsScreen';

import CartButton from '../components/CartButton';
import ProductCard from '../components/ProductCard';

function SearchBar({
  placeholderText,
  value,
  onChangeText,
}: {
  placeholderText: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: C.white,
        borderRadius: 24,
        paddingHorizontal: 15,
        height: 50,
      }}
    >
      <Icon source="magnify" size={20} color={C.subtext} />
      <TextInput
        placeholder={placeholderText}
        placeholderTextColor={C.subtext}
        style={{ flex: 1, marginLeft: 10, fontSize: 16, color: C.text }}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

interface VendorInfoScreenProps {
  vendor: Vendor; // The clicked vendor object passed from VendorsScreen
  onNavigate: (screenName: string) => void;
}

export default function VendorInfoScreen({ vendor, onNavigate }: VendorInfoScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activePage, setActivePage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [products, setProducts] = useState<any[]>([]);
  const [storeCategories, setStoreCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // 2. Add refreshing state

  const bannerSource = vendor?.banner 
    ? { uri: vendor.banner } 
    : require('../assets/default-store-banner.png');

  // 3. Centralized fetch function for reusability
  const fetchVendorData = () => {
    if (!vendor?.id) return Promise.resolve();
    
    const searchParam = searchQuery ? `&search=${searchQuery}` : '';
    const url = `${BASE_URL}/wp-json/dokan/v1/stores/${vendor.id}/products?per_page=30&page=${activePage}${searchParam}`;

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        
        const pagesHeader = res.headers.get('X-WP-TotalPages') || res.headers.get('x-wp-totalpages');
        setTotalPages(pagesHeader ? parseInt(pagesHeader, 10) : 1);

        return res.json();
      })
      .then((raw: any[]) => {
        const mapped = raw.map(adaptWooProductToUI);
        setProducts(mapped);

        const uniqueCats = new Set<string>();
        mapped.forEach(product => {
          product.categories?.forEach((catName: string) => uniqueCats.add(catName));
        });
        setStoreCategories(Array.from(uniqueCats));
      })
      .catch((err) => {
        console.error('[Vendor Products Fetch Error]:', err);
      });
  };

  // 4. Trigger standard loading indicator fetch
  useEffect(() => {
    setLoading(true);
    fetchVendorData().finally(() => setLoading(false));
  }, [vendor?.id, activePage, searchQuery]);

  // 5. Trigger pull-to-refresh fetch
  const onRefresh = () => {
    setRefreshing(true);
    fetchVendorData().finally(() => setRefreshing(false));
  };

  if (!vendor) {
    return (
      <SafeAreaView style={styles.mainContainer} edges={["top"]}>
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading store details...</Text>
          <TouchableOpacity style={[globalStyles.tagChip, { marginTop: 12 }]} onPress={() => onNavigate("Vendors")}>
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

            <TouchableOpacity style={styles.backButton} onPress={() => onNavigate("Vendors")}>
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

      {/* 6. Attach RefreshControl to ScrollView */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[C.primary]} // Android visual color
            tintColor={C.primary} // iOS visual color
          />
        }
      >
          
        {/* Store Categories list */}
        {storeCategories.length > 0 && (
          <View style={styles.categoriesCard}>
            <Text style={styles.sectionHeading}>Store Categories</Text>
            <View style={styles.categoriesList}>
              {storeCategories.map((cat, index) => (
                <View key={index} style={styles.categoryBulletRow}>
                  <View style={styles.bulletPoint} />
                  <TouchableOpacity activeOpacity={0.6}>
                    <Text style={styles.categoryLinkText}>{cat}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Filter & Search Bar Row */}
        <View style={styles.searchRow}>
          {/* <TouchableOpacity style={styles.filterBtn}>
            <Icon source="filter-variant" size={28} color={C.text} />
          </TouchableOpacity> */}
          
          <SearchBar placeholderText='Search in store...' value={searchQuery} onChangeText={setSearchQuery} />
        </View>

        {/* Loading & Grid States */}
        {loading && !refreshing ? ( // Prevents double spinner overlap during pull-to-refresh
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
                <View key={item.id}>
                  <ProductCard product={item} />
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
                onPress={() => setActivePage(page)}
                style={[styles.pageBubble, activePage === page && styles.pageBubbleActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.pageText, activePage === page && styles.pageTextActive]}>{page}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.nextPageBtn} activeOpacity={0.7} onPress={() => setActivePage(prev => Math.min(prev + 1, totalPages))}>
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
        color: '#FFFFFF',
        marginBottom: 4,
    },
    vendorDetail: {
        fontSize: 14,
        color: '#FFFFFF',
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
    },
    filterBtn: {
        padding: 4,
    },
    productGridWrapper: {
        paddingHorizontal: 16,
    },
    inlineGridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        rowGap: 16,
        marginBottom: 24,
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