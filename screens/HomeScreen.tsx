import React, { useState, useEffect, useRef } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Linking,
  RefreshControl,
  Animated,
  PanResponder
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "react-native-paper";
import { Image } from "expo-image";

import { C, globalStyles } from "../styles/theme";
import { adaptWooProductToUI } from "../utils/adapters";
import { fetchWooCommerce, BASE_URL } from "../services/wooApi";

import HeroBanner from "../components/HeroBanner";
import CategoryCircles from "../components/CategoryCircles";
import ProductGrid from "../components/ProductGrid";
import SearchBar from "../components/SearchBar";
import TabBar from "../components/TabBar";
import TagClouds from "../components/TagClouds";
import CartButton from "../components/CartButton";
import DynamicProductSection from "../components/DynamicProductSection";

interface SectionConfig {
  type: string;
  title: string;
  slug: string;
  id?: number | null;
}

type ArchiveType = 'category' | 'tag' | 'on_sale' | 'featured' | 'latest' | 'popular';

interface HomeScreenProps {
  onNavigate: (screenName: string, params?: any) => void;
}

const PRODUCT_TABS = ["Latest", "Popular", "Featured"];

const TAB_ENDPOINTS: Record<string, string> = {
  Latest:   "products?per_page=10&orderby=date&order=desc&stock_status=instock",
  Popular:  "products?orderby=popularity&order=desc&per_page=10&stock_status=instock",
  Featured: "products?featured=true&per_page=10&stock_status=instock",
};

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const flatListRef = useRef<FlatList>(null);  
  const [activeTab, setActiveTab] = useState("Latest");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [popularTags, setPopularTags] = useState<Array<{ id: number, name: string }>>([]);
  const [genderFilter, setGenderFilter] = useState('');

  useEffect(() => {
    fetchWooCommerce('products/tags?per_page=6&orderby=count&order=desc')
      .then((data: any[]) => {
        // Map to complete objects with stable IDs
        const formattedTags = data.map(tag => ({
          id: tag.id,
          name: tag.name,
        }));
        setPopularTags(formattedTags);
      })
      .catch((err) => {
        console.error('[Popular Tags Fetch Error]:', err);
      });
  }, []);

  const tabsToRender = [...popularTags.map(t => t.name), "See More ▾"];

  const [sectionConfig, setSectionConfig] = useState<SectionConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const [tabProducts, setTabProducts] = useState<any[]>([]);
  const [tabLoading, setTabLoading] = useState(true);

   const handleHomeRefresh = () => {
    setRefreshing(true);
    console.log("[HomeScreen] Refreshing layout feeds...");
    
    // Re-fetch homepage layout config first
    const fetchConfig = fetch(`${BASE_URL}/wp-json/studentmarket/v1/homepage-config`).then(r => r.json());
    const fetchTabs = fetchWooCommerce(TAB_ENDPOINTS[activeTab]);

    Promise.all([fetchConfig, fetchTabs])
      .then(([configData, rawProducts]) => {
        console.log("[HomeScreen] Layout refreshed successfully.");
        setSectionConfig(configData);
        setTabProducts(rawProducts.map(adaptWooProductToUI));
      })
      .catch((err) => {
        console.error('[HomeScreen Refresh Error]:', err);
      })
      .finally(() => {
        setRefreshing(false); // Guarantees spinner dismissal under all outcomes
      });
  };
  
  useEffect(() => {
    fetch(`${BASE_URL}/wp-json/studentmarket/v1/homepage-config`)
      .then((r) => {
        if (!r.ok) throw new Error(`Config fetch failed (${r.status})`);
        return r.json();
      })
      .then((data: SectionConfig[]) => setSectionConfig(data))
      .catch((err) => setConfigError(err.message))
      .finally(() => setConfigLoading(false));
  }, []);

  useEffect(() => {
    setTabLoading(true);
    fetchWooCommerce(TAB_ENDPOINTS[activeTab])
      .then((raw) => setTabProducts(raw.map(adaptWooProductToUI)))
      .catch(console.error)
      .finally(() => setTabLoading(false));
  }, [activeTab]);

  // Debounced Search suggestion fetcher
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
        .catch((err) => console.error('[Suggestions Fetch Error]:', err))
        .finally(() => setSearchLoading(false));
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Prepare dynamic home feed layout
  const virtualizedData: any[] = [];
  let inserted = false;

  sectionConfig.forEach((section) => {
    virtualizedData.push(section);
    if (section.type === 'on_sale') {
      virtualizedData.push({ type: 'category-circles', slug: 'category-circles-placeholder' });
      inserted = true;
    }
  });

  if (!inserted && sectionConfig.length > 0) {
    virtualizedData.unshift({ type: 'category-circles', slug: 'category-circles-placeholder' });
  }

  return (
    <SafeAreaView style={globalStyles.safe} edges={["top"]}>

      {/* Sticky Header Row */}
      <View style={[globalStyles.headerRow, styles.stickyHeaderWrapper]}>
        <SearchBar 
          placeholderText="Search for products..." 
          value={searchQuery}
          onChangeText={setSearchQuery}
          loading={searchLoading}
          onFocus={() => {
            // Re-open the suggestions dropdown if there is already active text in the search input
            if (searchQuery.trim().length > 0 && searchResults.length > 0) {
              setSearchActive(true);
            }
          }}
        />
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      {/* ── Interactive Dimmed Backdrop (Closes search on click) ── */}
      {searchActive && (
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={() => setSearchActive(false)} // Dismiss search
        />
      )}

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

      {configLoading ? (
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
          <Text style={styles.stateText}>Loading marketplace...</Text>
        </View>

      ) : configError ? (
        <View style={styles.centerStage}>
          <Icon source="alert-circle-outline" size={48} color="#EF4444" />
          <Text style={[styles.stateText, { color: "#EF4444" }]}>{configError}</Text>
        </View>

      ) : (
        <FlatList
          ref={flatListRef}
          style={[globalStyles.scroll, { flex: 1 }]}
          contentContainerStyle={[globalStyles.scrollContent, { flexGrow: 1 }]}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!searchActive}
          
          data={virtualizedData}
          keyExtractor={(item, index) => `${item.type}-${item.slug ?? index}`}
          renderItem={({ item }) => {
            if (item.type === 'category-circles') {
              return (
                <CategoryCircles 
                  onPressCategory={(id, name) => {
                    onNavigate("ProductArchive", { type: 'category', id, name });
                  }}
                />
              );
            }

            if (item.type === 'banner-image') {

              let resolvedImageUri = item.image || item.image_url || null;

              // ─── AUTO-CORRECTOR: Fixes missing /wp-content directory paths dynamically ───
              if (
                resolvedImageUri && 
                resolvedImageUri.includes('/uploads/') && 
                !resolvedImageUri.includes('/wp-content/')
              ) {
                resolvedImageUri = resolvedImageUri.replace('/uploads/', '/wp-content/uploads/');
              }

              return (
                <TouchableOpacity 
                  style={styles.inlineAdCard}
                  activeOpacity={0.9}
                  onPress={() => {
                    if (item.target_type === 'external' && item.target_url) {
                      Linking.openURL(item.target_url).catch(console.error);
                    } else if (item.target_type) {
                      onNavigate("ProductArchive", {
                        type: item.target_type,
                        id: item.target_id,
                        name: item.target_name,
                      });
                    }
                  }}
                >
                  {resolvedImageUri ? (
                    <Image 
                      source={{ uri: resolvedImageUri }} 
                      style={styles.inlineAdImage} 
                      contentFit="cover" 
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.inlineAdImage, { backgroundColor: C.border, justifyContent: 'center', alignItems: 'center' }]}>
                      <Icon source="image-outline" size={32} color={C.subtext} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }

            return (
              <DynamicProductSection
                type={item.type}
                title={item.title}
                id={item.id}
                onPressProduct={(product) => {
                  onNavigate("ProductDetails", product); 
                }}
                onPressCategory={(archiveParam) => {
                  onNavigate("ProductArchive", archiveParam); 
                }}
              />
            );
          }}

          ListHeaderComponent={
            <>
              {/* Hero Banner */}
              <HeroBanner onNavigate={onNavigate} />

              {/* Featured tabs */}
              <View style={globalStyles.featuredSectionFrame}>
                <TabBar
                  tabs={PRODUCT_TABS}
                  active={activeTab}
                  onSelect={(tabName) => setActiveTab(tabName)}
                  variant="pill"
                />
                {tabLoading ? (
                  <View style={styles.tabSpinner}>
                    <ActivityIndicator size="small" color={C.primary} />
                  </View>
                ) : (
                  <ProductGrid
                    products={tabProducts.slice(0, 10)}
                    showViewMore={true}
                    onPressProduct={(product) => {
                      onNavigate("ProductDetails", product); // Clean inline params
                    }}
                    onViewMore={() => {
                      let archiveType: 'on_sale' | 'featured' | 'latest' | 'popular' = 'latest';
                      let archiveName = 'Latest Products';

                      if (activeTab === 'Popular') {
                        archiveType = 'popular';
                        archiveName = 'Popular Products';
                      } else if (activeTab === 'Featured') {
                        archiveType = 'featured';
                        archiveName = 'Featured Products';
                      }

                      // Pass parameters inline directly to ProductArchive
                      onNavigate("ProductArchive", {
                        type: archiveType,
                        id: 0,
                        name: archiveName,
                      });
                    }}
                  />
                )}
              </View>

              {/* Dynamic Tag Chips */}
              {popularTags.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScrollWrapper} contentContainerStyle={styles.horizontalScrollContent}>
                  {tabsToRender.map((tab) => {
                    const isSelected = genderFilter === tab;
                    return (
                      <TouchableOpacity 
                        key={tab} 
                        onPress={() => {
                          if (tab === "See More ▾") {
                            flatListRef.current?.scrollToEnd({ animated: true });
                          } else {
                            // Find the correct tag matching this name
                            const matchedTag = popularTags.find(t => t.name === tab);
                            if (matchedTag) {
                              // Pass the correct tag parameters to the archive screen!
                              onNavigate("ProductArchive", { type: 'tag', id: matchedTag.id, name: matchedTag.name });
                            }
                          }
                        }} 
                        style={[globalStyles.tagChip, { marginRight: 8 }, isSelected && { backgroundColor: C.primary }]}
                      >
                        <Text style={[globalStyles.tagChipText, isSelected && { color: '#FFF' }]}>{tab}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </>
          }
          
          ListFooterComponent={
            <>
              {/* Tag cloud */}
              <TagClouds
                onPressTag={(id, name) => {
                  // Pass the clicked tag parameters to the archive screen!
                  onNavigate("ProductArchive", { type: 'tag', id, name });
                }}
              />
              <View style={{ height: 32 }} />
            </>
          }

          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={handleHomeRefresh} 
              colors={[C.primary]} 
              tintColor={C.primary} 
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  tabSpinner: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalScrollWrapper: {
    marginVertical: 12,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyHeaderWrapper: {
    zIndex: 9999, 
    position: 'relative',
    backgroundColor: C.bg,
  },
  dropdownCard: {
    position: 'absolute',
    top: 100,
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
  backdrop: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 9998,
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
  inlineAdCard: {
    height: 120, // Clean banner height
    marginHorizontal: 16,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  inlineAdImage: {
    ...StyleSheet.absoluteFill, 
  },
});