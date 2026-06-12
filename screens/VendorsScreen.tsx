import React, { useState, useEffect, useRef } from 'react';
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
import { Icon , Menu} from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { BASE_URL } from '../services/wooApi';
import CartButton from '../components/CartButton';
import VendorCard from '../components/VendorCard';
import SearchFilterRow from '../components/SearchFilterRow';


export interface Vendor {
  id: string;
  name: string;
  address: string;
  city: string;
  banner?: string | null;
  gravatar?: string | null;
}

interface VendorsScreenProps {
  onNavigate: (screenName: string) => void;
  onSelectVendor: (vendor: Vendor) => void;
}

export default function VendorsScreen({ onNavigate, onSelectVendor }: VendorsScreenProps) {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Sorting & Menu States
  const [menuVisible, setMenuVisible] = useState(false);
  const [sortBy, setSortBy] = useState('registered'); // 'registered' | 'popularity' | 'rand'
  const [sortLabel, setSortLabel] = useState('Most Recent');
  
  // Pagination & Loading States
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ─── 1. Centralized Fetch Logic ───────────────────────────────────────────
  const fetchVendors = (targetPage: number, searchString = '', sortOption = 'registered', isRefresh = false) => {
    let sortParams = '';

    if (sortOption === 'registered') {
      sortParams = '&orderby=registered&order=desc';
    } else if (sortOption === 'popularity') {
      sortParams = '&orderby=popularity&order=desc'; // Orders by review rating/sales
    } else if (sortOption === 'rand') {
      sortParams = '&orderby=rand'; // Random sorting
    }
    
    const searchParam = searchString ? `&search=${searchString}` : '';
    const url = `${BASE_URL}/wp-json/dokan/v1/stores?per_page=15&page=${targetPage}${searchParam}`;

      return fetch(url)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to retrieve vendors');
          
          // Read total pages headers dynamically
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
            // Append new page to previous state list
            setVendors((prev) => {
              const existingIds = new Set(prev.map(v => v.id));
              const uniqueNew = formatted.filter(v => !existingIds.has(v.id));
              return [...prev, ...uniqueNew];
            });
          }

          // Fallback: If we got fewer items than requested per page, we've reached the end
          if (raw.length < 15) {
            setHasMore(false);
          }
        })
        .catch((err) => {
          console.error('[Dokan Fetch Error]:', err);
          setError(err.message);
      });
  };

  // ─── 2. Initial Fetch (Page 1) ───────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    fetchVendors(1, searchQuery, sortBy).finally(() => setLoading(false));
  }, [sortBy]);

  // ─── 3. Server-Side Debounced Searching ──────────────────────────────────
  useEffect(() => {
    // Only run debounce routine after initial loading is complete
    if (loading && page === 1 && vendors.length === 0) return;

    // Wait 500ms after user stops typing to trigger server query (prevents lag)
    const delayDebounceFn = setTimeout(() => {
      setLoading(true);
      setPage(1);
      setHasMore(true);
      fetchVendors(1, searchQuery).finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // ─── 4. Endless Scroll Trigger ───────────────────────────────────────────
  const handleLoadMore = () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);

    fetchVendors(nextPage, searchQuery, sortBy).finally(() => setLoadingMore(false));
  };

  // ─── 5. Pull-To-Refresh Trigger ──────────────────────────────────────────
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
      
      <SearchFilterRow 
        placeholderText="Search for vendors..."
        searchQuery={searchQuery}
        onChangeSearch={setSearchQuery}
        onSelectSort={(sortByOption, labelOption) => {
          setSortBy(sortByOption);
          setSortLabel(labelOption);
        }}
      />

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
                onSelectVendor(item);      
                onNavigate("VendorInfo"); 
              }} 
            />
          )}

          // Pull to Refresh configuration
          refreshing={refreshing}
          onRefresh={handleRefresh}

          // Infinite Scroll configuration
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4} // Trigger load when user scrolls 40% close to the bottom
          
          // Show small loading spinner at the list footer during next-page queries
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
  },
  filterBtn: { padding: 4 },
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