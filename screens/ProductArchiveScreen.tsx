import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Menu } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { BASE_URL, fetchWooCommerce } from '../services/wooApi';
import { adaptWooProductToUI } from '../utils/adapters';
import CartButton from '../components/CartButton';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

export interface ArchiveParam {
  type: 'category' | 'tag' | 'on_sale' | 'featured' | 'latest' | 'popular';
  id: number;
  name: string;
}

interface ProductArchiveScreenProps {
  archiveParam: ArchiveParam;
  onNavigate: (screenName: string, params?: any) => void;
  onGoBack: () => void;
}

export default function ProductArchiveScreen({
  archiveParam,
  onNavigate,
  onGoBack
}: ProductArchiveScreenProps) {
  const flatListRef = useRef<FlatList>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting & Menu States
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortOption, setSortOption] = useState('date_desc');
  const [sortLabel, setSortLabel] = useState('Sort by latest');

  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Page Title
  const pageTitle = archiveParam ? archiveParam.name : 'Products';

  // ─── Fetch Products dynamically ──────────────────────────────────────────
  const fetchArchiveProducts = (targetPage: number, searchString = '', sortType = 'date_desc', isRefresh = false) => {
    let sortTypeToUse = sortType;
    if (archiveParam.type === 'popular' && sortType === 'date_desc') {
      sortTypeToUse = 'popularity';
    }
    
    // Map dropdown filter options to WooCommerce orderby parameters
    let sortParams = '';
    switch (sortTypeToUse) {
      case 'popularity':
        sortParams = '&orderby=popularity&order=desc';
        break;
      case 'rating':
        sortParams = '&orderby=rating&order=desc';
        break;
      case 'price_asc':
        sortParams = '&orderby=price&order=asc';
        break;
      case 'price_desc':
        sortParams = '&orderby=price&order=desc';
        break;
      case 'date_desc':
      default:
        sortParams = '&orderby=date&order=desc';
        break;
    }

    // Filter by category ID or tag ID
    let filterParam = '';
    if (archiveParam.type === 'tag') {
      filterParam = `&tag=${archiveParam.id}`;
    } else if (archiveParam.type === 'category') {
      filterParam = `&category=${archiveParam.id}`;
    } else if (archiveParam.type === 'on_sale') {
      filterParam = `&on_sale=true`;
    } else if (archiveParam.type === 'featured') {
      filterParam = `&featured=true`;
    }

    const searchParam = searchString ? `&search=${searchString}` : '';
    const endpoint = `products?per_page=12&page=${targetPage}${filterParam}${searchParam}${sortParams}&stock_status=instock`;

    return fetchWooCommerce(endpoint)
      .then((raw) => {
        const mapped = raw.map(adaptWooProductToUI);

        if (isRefresh || targetPage === 1) {
          setProducts(mapped);
        } else {
          setProducts((prev) => {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNew = mapped.filter((p: { id: any; }) => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
        }

        // If returned items count is less than 12 (requested per_page), there are no more pages
        if (raw.length < 12) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      })
      .catch((err) => {
        console.error('[Archive Fetch Error]:', err);
        setError(err.message);
      });
  };

  // ─── Initial Page Load ───
  useEffect(() => {
    if (!archiveParam) return;
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchArchiveProducts(1, searchQuery, sortOption).finally(() => setLoading(false));
  }, [archiveParam?.type, archiveParam?.id, sortOption]);

  // ─── Server-Side Debounced Searching ───
  useEffect(() => {
    if (loading && page === 1 && products.length === 0) return;

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      fetchArchiveProducts(1, searchQuery, sortOption).finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // ─── Endless Scroll Pagination trigger ───
  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    fetchArchiveProducts(nextPage, searchQuery, sortOption).finally(() => setLoadingMore(false));
  };

  // ─── Pull-To-Refresh trigger ───
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchArchiveProducts(1, searchQuery, sortOption, true).finally(() => setRefreshing(false));
  };

  // Guard loading transition screen
  if (!archiveParam) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Dynamic Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={onGoBack}>
          <Icon source="chevron-left" size={24} color={C.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>{pageTitle}</Text>
        
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      {/* Filter Menu & Search Row */}
      <View style={styles.searchRow}>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={styles.filterBtn}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Icon source="filter-variant" size={28} color={C.text} />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            onPress={() => {
              setSortOption('popularity');
              setSortLabel('Sort by popularity');
              setMenuVisible(false);
            }} 
            title="Sort by popularity" 
          />
          <Menu.Item 
            onPress={() => {
              setSortOption('rating');
              setSortLabel('Sort by average rating');
              setMenuVisible(false);
            }} 
            title="Sort by average rating" 
          />
          <Menu.Item 
            onPress={() => {
              setSortOption('date_desc');
              setSortLabel('Sort by latest');
              setMenuVisible(false);
            }} 
            title="Sort by latest" 
          />
          <Menu.Item 
            onPress={() => {
              setSortOption('price_asc');
              setSortLabel('Sort by price: low to high');
              setMenuVisible(false);
            }} 
            title="Sort by price: low to high" 
          />
          <Menu.Item 
            onPress={() => {
              setSortOption('price_desc');
              setSortLabel('Sort by price: high to low');
              setMenuVisible(false);
            }} 
            title="Sort by price: high to low" 
          />
        </Menu>
        
        <SearchBar 
          placeholderText='Search products...'
          value={searchQuery}
          onChangeText={setSearchQuery} 
        />
      </View>

      {/* Main Grid View rendering */}
      {loading && page === 1 ? (
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading products...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerStage}>
          <Icon source="alert-circle-outline" size={44} color="#EF4444" />
          <Text style={[styles.stateText, { color: "#EF4444" }]}>{error}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerStage}>
          <Icon source="tag-search-outline" size={44} color={C.subtext} />
          <Text style={styles.stateText}>No products found under this tag</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={products}
          keyExtractor={(item) => item.id.toString()}
          numColumns={3}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.gridCardWrapper}>
              {/* Connected inline navigation parameter passing */}
              <ProductCard 
                product={item as any} 
                onPress={() => {
                  onNavigate("ProductDetails", item);
                }}
              />
            </View>
          )}

          // Refresh triggers
          refreshing={refreshing}
          onRefresh={handleRefresh}

          // Lazy load triggers
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.text, flex: 1, marginHorizontal: 8 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    zIndex: 9999,       
    position: 'relative', 
  },
  filterBtn: { padding: 4 },
  
  listContent: {
    paddingBottom: 40,
    paddingTop: 8,
  },
  columnWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  gridCardWrapper: {
    width: '30.5%',
    marginHorizontal: '1.4%',
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