import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import CartButton from '../components/CartButton';
// Assuming you have ProductGrid available for the "Related Products" section
import ProductGrid from '../components/ProductGrid'; 
import { PRODUCTS } from '../types';
import ProductSection from '../components/ProductSection';

// --- Mock Data for Layout ---
const PRODUCT = {
  name: "Black Ribbed Knit Wide-Leg Leggings (L)",
  store: "Sydney's Closet",
  price: "Ksh 1,500",
  specs: {
    size: ["US: 10 - 12", "International: L", "Waist (Inches): 30 - 32\"", "Hips (Inches): 40 - 42\"", "EU Numeric: 42 - 44"],
    length: ["Inseam: 31\"", "Outseam (Overall length): 42\""],
    fits: ["Heights 6'0\" to 6'2\" (Above the ankle)", "Heights 5'9\" to 5'11\" (Right at the ankle)", "Heights 5'6\" to 5'8\" (Below the ankle)"]
  }
};

const VARIATIONS = ["Variation 1", "Variation 2", "Variation 3", "Variation 4"];

interface ProductDetailsProps {
  onNavigate: (screenName: string) => void;
}

export default function ProductDetailsScreen({ onNavigate }: ProductDetailsProps) {
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);

  return (
    <SafeAreaView style={globalStyles.safe} edges={["top"]}>
      
      {/* Header */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>

        <Text style={globalStyles.headerTitle}>Product Details</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity style={globalStyles.iconBtn}>
            <Icon source="share-variant-outline" size={24} color={C.text} />
          </TouchableOpacity>
          <CartButton onPress={() => onNavigate("Cart")} />
        </View>
        
      </View>

      {/* Main Content */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <View style={styles.mainImagePlaceholder}>
            <Icon source="image-outline" size={64} color={C.lightGray} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
              <TouchableOpacity 
                key={index} 
                onPress={() => setActiveThumb(index)}
                style={[styles.thumbnail, activeThumb === index && styles.thumbnailActive]}
              >
                 <Icon source="image-outline" size={24} color={C.lightGray} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Product Meta: Title, Vendor, Price, Quantity */}
        <View style={styles.section}>
          <Text style={styles.productTitle}>{PRODUCT.name}</Text>
          <Text style={styles.storeText}>
            Store: <Text style={styles.storeName}>{PRODUCT.store}</Text>
          </Text>

          <View style={styles.priceRow}>
            <View style={styles.qtyBox}>
              <TouchableOpacity onPress={() => setQty(Math.max(1, qty - 1))}>
                <Icon source="minus-circle-outline" size={24} color={C.subtext} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity onPress={() => setQty(qty + 1)}>
                <Icon source="plus-circle-outline" size={24} color={C.subtext} />
              </TouchableOpacity>
            </View>
            <Text style={styles.priceText}>{PRODUCT.price}</Text>
          </View>
        </View>

        {/* Variations Block */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 12, }]}>
          <Text style={styles.sectionTitle}>Variations</Text>
          <View style={styles.variationGrid}>
            {VARIATIONS.map((v, i) => (
              <TouchableOpacity key={i} style={styles.variationPill}>
                <View style={styles.variationThumb} />
                <Text style={styles.variationText}>Variation</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Specifications Text Block */}
        <View style={styles.section}>
          <Text style={styles.specHeading}>Size:</Text>
          {PRODUCT.specs.size.map((s, i) => <Text key={i} style={styles.bulletText}>• {s}</Text>)}
          
          <Text style={[styles.specHeading, { marginTop: 12 }]}>Length:</Text>
          {PRODUCT.specs.length.map((l, i) => <Text key={i} style={styles.bulletText}>• {l}</Text>)}
          
          <Text style={[styles.specHeading, { marginTop: 12 }]}>Fits:</Text>
          {PRODUCT.specs.fits.map((f, i) => <Text key={i} style={styles.bulletText}>• {f}</Text>)}
        </View>

        {/* Additional Info Table */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 12, }]}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Clothing Size</Text>
            <Text style={styles.tableValueGreen}>L</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Category</Text>
            <Text style={styles.tableValueGreen}>Clothing</Text>
          </View>
          <View style={styles.divider} />
          
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Tags</Text>
            <Text style={styles.tableValueGreen}>ladies, Size-L, trousers</Text>
          </View>
        </View>

        {/* Related Products Wrapper (Reusing your grid) */}
        <ProductSection 
          title="Related Products" 
          products={PRODUCTS} 
          showViewMore={false}
        />

      </ScrollView>

      {/* 3. Sticky Bottom Action Bar */}
      <View style={styles.stickyBottomBar}>
        <TouchableOpacity style={[styles.actionBtn, styles.btnWhatsapp]}>
          <Text style={styles.btnTextWhite}>WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.btnCart]}>
          <Text style={styles.btnTextWhite}>Add To Cart</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  
  scrollContent: { paddingBottom: 100 }, // Leaves room for the sticky bottom bar
  
  galleryContainer: { padding: 16, backgroundColor: C.surface },
  mainImagePlaceholder: {
    width: '100%',
    height: 280,
    backgroundColor: C.primary,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  thumbnailScroll: { gap: 8 },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: C.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailActive: { backgroundColor: C.accent, },
  
  section: { paddingHorizontal: 16, paddingVertical: 16 },
  productTitle: { fontSize: 20, fontWeight: '600', color: C.text, marginBottom: 8, lineHeight: 28 },
  storeText: { fontSize: 14, color: C.text, fontWeight: '500' },
  storeName: { color: C.primary, fontWeight: '600' },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyText: { fontSize: 16, fontWeight: '600', color: C.text },
  priceText: { fontSize: 20, fontWeight: '700', color: C.primary },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  
  variationGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  variationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 30,
    paddingRight: 16,
    width: '48%', // Allows 2 per row
  },
  variationThumb: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#9FBEE0', margin: 4 },
  variationText: { fontSize: 13, fontWeight: '500', color: C.text, marginLeft: 8 },

  specHeading: { fontSize: 14, color: C.text, fontWeight: '600', marginBottom: 4 },
  bulletText: { fontSize: 14, color: C.subtext, lineHeight: 22 },

  tableRow: { flexDirection: 'row', paddingVertical: 12 },
  tableLabel: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },
  tableValueGreen: { flex: 2, fontSize: 14, color: C.primary, fontWeight: '500' },
  divider: { height: 1, backgroundColor: C.border },

  stickyBottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderColor: C.border,
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnWhatsapp: { backgroundColor: '#10B981' }, // Standard vibrant action green
  btnCart: { backgroundColor: '#1C4A3A' }, // Matching your dark brand green
  btnTextWhite: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});