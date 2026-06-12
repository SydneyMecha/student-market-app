import React, { useState, useEffect, useRef  } from "react";
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  FlatList,
  ScrollView, 
  TouchableOpacity
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Icon } from "react-native-paper";

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

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionConfig {
  type: string;
  title: string;
  slug: string;
  id?: number | null;
}

interface HomeScreenProps {
  onNavigate: (screenName: string) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRODUCT_TABS = ["Latest", "Featured", "Popular"];

// Map each tab name to its WooCommerce query params
const TAB_ENDPOINTS: Record<string, string> = {
  Latest:   "products?per_page=10&orderby=date&order=desc",
  Featured: "products?featured=true&per_page=10",
  Popular:  "products?orderby=popularity&order=desc&per_page=10",
};

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  // Create a reference to the main vertical FlatList
  const flatListRef = useRef<FlatList>(null);
  
  const [activeTab, setActiveTab] = useState("Latest");

  // States for fetching the top 6 tags
  const [popularTags, setPopularTags] = useState<string[]>([]);
  const [genderFilter, setGenderFilter] = useState('');
  const [activeTag, setActiveTag] = useState('');

  // Fetch the 6 most popular tags on mount
  useEffect(() => {
    fetchWooCommerce('products/tags?per_page=6&orderby=count&order=desc')
      .then((data: any[]) => {
        // Map to string names for the TabBar component
        const tagNames = data.map(tag => tag.name);
        setPopularTags(tagNames);
      })
      .catch((err) => {
        console.error('[Popular Tags Fetch Error]:', err);
      });
  }, []);

  const tabsToRender = [...popularTags, "See More ▾"];

  // Homepage layout config — fetched from WordPress, controls which sections render
  const [sectionConfig, setSectionConfig] = useState<SectionConfig[]>([]);
  const [configLoading, setConfigLoading] = useState(true);
  const [configError, setConfigError]     = useState<string | null>(null);

  // Featured tabs — own isolated fetch, swaps when tab changes
  const [tabProducts, setTabProducts]     = useState<any[]>([]);
  const [tabLoading, setTabLoading]       = useState(true);
  
  // ── Fetch homepage layout config from WordPress ──────────────────────────
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

  // ── Fetch tab products whenever the active tab changes ───────────────────
  useEffect(() => {
    setTabLoading(true);
    fetchWooCommerce(TAB_ENDPOINTS[activeTab])
      .then((raw) => setTabProducts(raw.map(adaptWooProductToUI)))
      .catch(console.error)
      .finally(() => setTabLoading(false));
  }, [activeTab]);

  // ─── Prepare the data for FlatList ──────────────────────────────────────────

  const virtualizedData: any[] = [];
  let inserted = false;

  sectionConfig.forEach((section) => {
    virtualizedData.push(section);
    
    // If we just added the "Offers" (on_sale) section, insert the Category Circles placeholder right after it
    if (section.type === 'on_sale') {
      virtualizedData.push({ 
        type: 'category-circles', 
        slug: 'category-circles-placeholder' 
      });
      inserted = true;
    }
  });

  // Fallback: If "Offers" isn't present in your WordPress config, place the circles at the top of the list
  if (!inserted && sectionConfig.length > 0) {
    virtualizedData.unshift({ 
      type: 'category-circles', 
      slug: 'category-circles-placeholder' 
    });
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={globalStyles.safe} edges={["top"]}>

      <View style={globalStyles.headerRow}>
        <SearchBar placeholderText="Search for products..." />
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

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
          
          // 1. Pass the virtualized data array
          data={virtualizedData} 
          
          keyExtractor={(item, index) => `${item.type}-${item.slug ?? index}`}
          
          // 2. Render either CategoryCircles or the standard DynamicProductSection
          renderItem={({ item }) => {
            if (item.type === 'category-circles') {
              return <CategoryCircles />;
            }
            return (
              <DynamicProductSection
                type={item.type}
                title={item.title}
                id={item.id}
              />
            );
          }}
          
          ListHeaderComponent={
            <>
              {/* ── Hero ──────────────────────────────────────────────────────── */}
              <HeroBanner />

              {/* ── Featured tabs ────────────────────────────────────────────── */}
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
                  />
                )}
              </View>

              {/* ── Dynamic Tag Chips (Horizontally Scrollable) ────────────────── */}
              {popularTags.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={globalStyles.horizontalScrollWrapper}
                  contentContainerStyle={globalStyles.horizontalScrollContent}
                >
                  {tabsToRender.map((tab) => {
                    const isSelected = genderFilter === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        onPress={() => {
                          if (tab === "See More ▾") {
                            flatListRef.current?.scrollToEnd({ animated: true });
                          } else {
                            setGenderFilter(tab);
                          }
                        }}
                        style={[
                          globalStyles.tagChip,
                          { marginRight: 8 },
                        ]}
                        activeOpacity={0.8}
                      >
                        <Text style={[globalStyles.tagChipText]}>
                          {tab}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}

              {/* Note: <CategoryCircles /> has been successfully removed from here */}
            </>
          }
          ListFooterComponent={
            <>
              {/* ── Tag cloud ────────────────────────────────────────────────── */}
              <TagClouds
                activeTag={activeTag}
                onSelectTag={setActiveTag}
              />
              <View style={{ height: 32 }} />
            </>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  centerStage: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "500",
  },
  tabSpinner: {
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
});