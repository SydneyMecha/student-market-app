import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon, Menu } from 'react-native-paper'; 
import { C, globalStyles } from '../styles/theme';
import { BASE_URL } from '../services/wooApi';
import CartButton from '../components/CartButton';
import VendorCard from '../components/VendorCard';

export interface Vendor {
  id: string;
  name: string;
  address: string;
  city: string;
  banner?: string | null;
  gravatar?: string | null;
}

interface VendorsScreenProps {
  onNavigate: (screenName: string, params?: any) => void;
}

export default function VendorsScreen({ onNavigate }: VendorsScreenProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting & Menu States
  const [menuVisible, setMenuVisible] = useState(false);
  
  const [sortBy, setSortBy] = useState('oldest'); 
  const [sortLabel, setSortLabel] = useState('Oldest First');
  
  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── Centralized Fetch Logic ───────────────────────────────────────────
  const fetchVendors = (targetPage: number, searchString = '', sortOption = 'oldest', isRefresh = false) => {
    let sortParams = '';

    // Updated parameter mapping to handle both 'oldest' (asc) and 'registered' (desc)
    if (sortOption === 'oldest') {
      sortParams = '&orderby=registered&order=asc';
    } else if (sortOption === 'registered') {
      sortParams = '&orderby=registered&order=desc';
    } else if (sortOption === 'rating') {
      sortParams = '&orderby=rating&order=desc'; 
    } else if (sortOption === 'rand') {
      sortParams = '&orderby=rand'; 
    }
    
    const searchParam = searchString ? `&search=${searchString}` : '';
    const url = `${BASE_URL}/wp-json/dokan/v1/stores?per_page=15&page=${targetPage}${searchParam}${sortParams}`;

    return fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to retrieve vendors');
        
        const totalPagesHeader = res.headers.get('X-WP-TotalPages') || res.headers.get('x-wp-totalpages');
        if (totalPagesHeader) {
          const totalPages = parseInt(totalPagesHeader, 10);
          setHasMore(targetPage < totalPages);
        }
        return res.json();
      })
      .then((raw: any[]) => {
        const formatted: Vendor[] = raw.map((v) => ({
          id: v.id.toString(),
          name: v.store_name || "Unknown Vendor",
          address: v.address?.street_1 || "No physical address listed",
          city: v.address?.city || "No City",
          banner: v.banner || null,
          gravatar: v.gravatar || null,
        }));

        if (isRefresh || targetPage === 1) {
          setVendors(formatted);
        } else {
          setVendors((prev) => {
            const existingIds = new Set(prev.map(v => v.id));
            const uniqueNew = formatted.filter(v => !existingIds.has(v.id));
            return [...prev, ...uniqueNew];
          });
        }

        if (raw.length < 15) {
          setHasMore(false);
        }
      })
      .catch((err) => {
        console.error('[Dokan Fetch Error]:', err);
        setError(err.message);
      });
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchVendors(1, searchQuery, sortBy).finally(() => setLoading(false));
  }, [sortBy]);

  useEffect(() => {
    if (loading && page === 1 && vendors.length === 0) return;

    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      fetchVendors(1, searchQuery, sortBy).finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    fetchVendors(nextPage, searchQuery, sortBy).finally(() => setLoadingMore(false));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    fetchVendors(1, searchQuery, sortBy, true).finally(() => setRefreshing(false));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header Row */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={() => onNavigate("Home")}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Vendors</Text>
        
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      {/* Filter & Search Bar Row */}
      <View style={styles.searchRow}>
        
        {/* Localized Dokan Vendor Filter Menu */}
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
              setSortBy('oldest');
              setSortLabel('Oldest First');
              setMenuVisible(false);
            }} 
            title="Oldest First" 
          />
          <Menu.Item 
            onPress={() => {
              setSortBy('registered');
              setSortLabel('Most Recent');
              setMenuVisible(false);
            }} 
            title="Most Recent" 
          />
          <Menu.Item 
            onPress={() => {
              setSortBy('rating');
              setSortLabel('Most Popular');
              setMenuVisible(false);
            }} 
            title="Most Popular" 
          />
          <Menu.Item 
            onPress={() => {
              setSortBy('rand');
              setSortLabel('Random');
              setMenuVisible(false);
            }} 
            title="Random" 
          />
        </Menu>

        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarInputRow}>
            <Icon source="magnify" size={20} color={C.subtext} />
            <TextInput
              placeholder="Search for vendors..."
              placeholderTextColor={C.subtext}
              style={styles.textInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>
      </View>

      {/* Main List Layout States */}
      {loading && page === 1 ? (
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Searching stores...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerStage}>
          <Icon source="alert-circle-outline" size={44} color="#EF4444" />
          <Text style={[styles.stateText, { color: "#EF4444" }]}>{error}</Text>
        </View>
      ) : vendors.length === 0 ? (
        <View style={styles.centerStage}>
          <Icon source="store-search-outline" size={44} color={C.subtext} />
          <Text style={styles.stateText}>No stores match your search</Text>
        </View>
      ) : (
        <FlatList
          data={vendors}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <VendorCard 
              vendor={item}
              onPress={() => {
                onNavigate("VendorInfo", item); 
              }} 
            />
          )}

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
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
  searchBarContainer: {
    flex: 1,
    height: 50,
  },
  searchBarInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: C.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
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