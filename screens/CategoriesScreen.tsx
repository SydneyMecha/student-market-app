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
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';
import CartButton from '../components/CartButton';
import SearchBar from '../components/SearchBar';
import DynamicProductSection from '../components/DynamicProductSection';
import { decodeHTMLEntities } from '../utils/stringUtils';

// Category schema interface
interface WooCommerceCategory {
  id: number;
  name: string;
  parent: number;
  slug: string;
}

interface CategoriesScreenProps {
  onNavigate: (screenName: string) => void;
}

export default function CategoriesScreen({ onNavigate }: CategoriesScreenProps) {
  const [categories, setCategories] = useState<WooCommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Track the currently selected parent category object
  const [activeParent, setActiveParent] = useState<WooCommerceCategory | null>(null);

  // 1. Fetch categories dynamically on mount
  useEffect(() => {
    // hide_empty=true to hide categories that don't have products assigned yet
    fetchWooCommerce('products/categories?per_page=100&hide_empty=true')
      .then((raw: any[]) => {
        const formatted: WooCommerceCategory[] = raw.map(c => ({
          id: c.id,
          name: decodeHTMLEntities(c.name), 
          parent: c.parent,
          slug: c.slug,
        }));
        setCategories(formatted);

        // Auto-select the first parent category as the initial sidebar tab
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

  // 2. Filter parents and dynamic children relative to active parent selection
  const parentCategories = categories.filter(c => c.parent === 0);
  const childCategories = activeParent 
    ? categories.filter(c => c.parent === activeParent.id) 
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header Row */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={() => onNavigate("Home")}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        
        <SearchBar placeholderText='Search for products...' />

        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

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
                // If there are child subcategories, render each one with its own ProductSection
                childCategories.map((subCat) => (
                  <DynamicProductSection 
                    key={subCat.id}
                    type="product-category"
                    title={subCat.name}
                    id={subCat.id}
                  />
                ))
              ) : (
                // Fallback: If a parent category has no subcategories, render the parent category itself
                activeParent && (
                  <DynamicProductSection 
                    key={activeParent.id}
                    type="product-category"
                    title={activeParent.name}
                    id={activeParent.id}
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

    /* Split Layout Containers */
    splitContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: C.bg,
    },

    /* Sidebar Styles */
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

    /* Main Content Styles */
    mainContent: {
      flex: 1,
    },
    mainContentScroll: {
      paddingBottom: 40,
    },
});