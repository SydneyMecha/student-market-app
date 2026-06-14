import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  Linking, 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { Image } from 'expo-image';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';
import { adaptWooProductToUI } from '../utils/adapters';
import { decodeHTMLEntities } from '../utils/stringUtils';
import CartButton from '../components/CartButton';
import ProductSection from '../components/ProductSection';

const formatDescription = (html: string) => {
  if (!html) return '';
  const stripped = html.replace(/<[^>]*>?/gm, '').trim(); 
  return decodeHTMLEntities(stripped);
};

interface CategoryOrTag {
  id: number;
  name: string;
}

interface WooProduct {
  whatsapp_debug: any;
  banner: any;
  id: number;
  name: string;
  price: string;
  regular_price: string;
  description: string;
  related_ids: number[];
  whatsapp_number?: string | null; // Resolved phone number
  whatsapp_message?: string | null; // Resolved custom message
  store?: { 
    id: number; 
    name: string; 
    address?: string; 
    city?: string; 
    phone?: string; 
    banner?: string | null; 
    gravatar?: string | null 
  } | null;
  categories: CategoryOrTag[];
  tags: CategoryOrTag[];
  attributes: Array<{ name: string; options: string[] }>;
  images: Array<{ id: number; src: string; alt?: string }>;
}

interface ProductDetailsProps {
  product: WooProduct;
  onNavigate: (screenName: string, params?: any) => void;
  onGoBack: () => void;
  onAddToCart: (product: any, qty: number) => void;
  cartItems: any[];
}

export default function ProductDetailsScreen({ 
  product, 
  onNavigate, 
  onGoBack, 
  onAddToCart,
  cartItems 
}: ProductDetailsProps) {
  const [qty, setQty] = useState(1);
  const [activeThumb, setActiveThumb] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [productHistory, setProductHistory] = useState<any[]>([]);

  const isAlreadyInCart = cartItems.some(item => item.id === product.id);

  const bannerSource = product?.banner 
    ? { uri: product.banner } 
    : require('../assets/default-store-banner.png');

  useEffect(() => {
    if (!product?.related_ids || product.related_ids.length === 0) return;

    setLoadingRelated(true);
    const endpoint = `products?include=${product.related_ids.slice(0, 10).join(',')}`;

    fetchWooCommerce(endpoint)
      .then((raw) => {
        setRelatedProducts(raw.map(adaptWooProductToUI));
      })
      .catch((err) => console.error('[Related Products Fetch Error]:', err))
      .finally(() => setLoadingRelated(false));

  }, [product?.id]);

  if (!product) {
    return (
      <SafeAreaView style={globalStyles.safe} edges={["top"]}>
        <View style={styles.centerStage}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const activeImageUri = product.images[activeThumb]?.src || null;

  const handleBackAction = () => {
    if (productHistory.length > 0) {
      const previousProduct = productHistory[productHistory.length - 1];
      setProductHistory(prev => prev.slice(0, -1));
      setActiveThumb(0);
      setQty(1);
    } else {
      onGoBack();
    }
  };

  const handleSelectRelatedProduct = (clickedProduct: any) => {
    onNavigate("ProductDetails", clickedProduct);
  };

  // 1. Upgraded dynamic checkout routing trigger
  const handleWhatsAppCheckout = () => {
    let phoneNumber = "254710417054"; // Final Fallback line

    // Resolve phone: Use resolved plugin number if present, otherwise fallback to global default
    if (product.whatsapp_number && product.whatsapp_number.trim().length > 0) {
      phoneNumber = product.whatsapp_number;
    }

    // Sanitize number: remove spaces, +, brackets, or dashes
    phoneNumber = phoneNumber.replace(/[\s\+\-\(\)]/g, '');

    // Resolve custom message: Use resolved plugin message if present, otherwise use standard fallback
    let message = `Hi, I am interested in ordering: \n\n*Product:* ${product.name}\n*Price:* Ksh ${product.price}\n*Qty:* ${qty}\n\nIs this item available?`;
    if (product.whatsapp_message && product.whatsapp_message.trim().length > 0) {
      message = product.whatsapp_message;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    Linking.openURL(url).catch((err) => console.error("Failed to open WhatsApp:", err));
  };

  return (
    <SafeAreaView style={globalStyles.safe} edges={["top"]}>
      
      {/* Header */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={onGoBack}>
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Gallery */}
        <View style={styles.galleryContainer}>
          <View style={styles.mainImageWrapper}>
            {activeImageUri ? (
              <Image source={{ uri: activeImageUri }} style={styles.mainImage} contentFit="contain" />
            ) : (
              <Icon source="image-outline" size={64} color={C.lightGray} />
            )}
          </View>
          
          {product.images.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
              {product.images.map((img, index) => (
                <TouchableOpacity 
                  key={img.id} 
                  onPress={() => setActiveThumb(index)}
                  style={[styles.thumbnail, activeThumb === index && styles.thumbnailActive]}
                >
                   <Image source={{ uri: img.src }} style={styles.thumbnailImg} contentFit="cover" />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Meta */}
        <View style={styles.section}>
          <Text style={styles.productTitle}>{product.name}</Text>
          
          {/* Interactive Vendor Store Redirection */}
          {product.store && (
            <Text style={styles.storeText}>
              Vendor:{" "}
              <Text 
                style={styles.storeName}
                onPress={() => {
                  onNavigate("VendorInfo", {
                    id: product.store!.id.toString(),
                    name: product.store!.name,
                    address: product.store!.address || "No address listed",
                    city: product.store!.city || "No City",
                    banner: product.store!.banner || null,
                    gravatar: product.store!.gravatar || null
                  });
                }}
              >
                {product.store.name}
              </Text>
            </Text>
          )}

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
            <Text style={styles.priceText}>Ksh {product.price}</Text>
          </View>
        </View>

        {/* Description */}
        {product.description.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.specHeading}>Description:</Text>
            <Text style={styles.bulletText}>{formatDescription(product.description)}</Text>
          </View>
        )}

        {/* Interactive Additional Info Table */}
        <View style={[globalStyles.featuredSectionFrame,  { padding: 12, }]}>
          <Text style={styles.sectionTitle}>Additional Information</Text>
          
          {/* Dynamic Attributes (Clothing Size, Color, etc.) */}
          {product.attributes?.map((attr, index) => (
            <React.Fragment key={index}>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>{attr.name}</Text>
                <Text style={styles.tableValueGreen}>{attr.options.join(', ')}</Text>
              </View>
              <View style={styles.divider} />
            </React.Fragment>
          ))}
          
          {/* Interactive Category Redirect Row */}
          {product.categories.length > 0 && (
            <>
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Category</Text>
                <View style={styles.clickableLinkContainer}>
                  {product.categories.map((cat, index) => (
                    <Text 
                      key={cat.id} 
                      style={styles.tableValueGreen}
                      onPress={() => {
                        onNavigate("ProductArchive", { type: 'category', id: cat.id, name: cat.name });
                      }}
                    >
                      {cat.name}{index < product.categories.length - 1 ? ', ' : ''}
                    </Text>
                  ))}
                </View>
              </View>
              <View style={styles.divider} />
            </>
          )}
          
          {/* Interactive Tags Redirect Row */}
          {product.tags.length > 0 && (
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Tags</Text>
              <View style={styles.clickableLinkContainer}>
                {product.tags.map((tag, index) => (
                  <Text 
                    key={tag.id} 
                    style={styles.tableValueGreen}
                    onPress={() => {
                      onNavigate("ProductArchive", { type: 'tag', id: tag.id, name: tag.name });
                    }}
                  >
                    {tag.name}{index < product.tags.length - 1 ? ', ' : ''}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Related Products */}
        {loadingRelated ? (
          <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 20 }} />
        ) : relatedProducts.length > 0 ? (
          <ProductSection 
              title="Related Products"
              products={relatedProducts}
              showViewMore={false} 
              onPressProduct={handleSelectRelatedProduct}
          />
        ) : null}

      </ScrollView>

      {/* Sticky Bottom Bar */}
      <View style={styles.stickyBottomBar}>
        <TouchableOpacity style={[styles.actionBtn, styles.btnWhatsapp]} onPress={handleWhatsAppCheckout}>
          <Text style={styles.btnTextWhite}>WhatsApp</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.actionBtn, 
            styles.btnCart,
            isAlreadyInCart && { backgroundColor: C.accent } // <-- Dynamically override color to accent
          ]}
          onPress={() => {
            if (isAlreadyInCart) {
              onNavigate("Cart");
            } else {
              onAddToCart(product, qty);
            }
          }}
        >
          <Text style={styles.btnTextWhite}>
            {isAlreadyInCart ? "View Cart" : "Add To Cart"}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

// Keep your styles identical...
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  centerStage: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scrollContent: { paddingBottom: 100 },
  galleryContainer: { padding: 16, backgroundColor: C.surface },
  
  mainImageWrapper: {
    width: '100%',
    height: 280,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  mainImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  thumbnailScroll: { gap: 8 },
  thumbnail: {
    width: 64,
    height: 64,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  thumbnailActive: { 
    borderWidth: 2,
    borderColor: C.primary,
  },
  
  section: { paddingHorizontal: 16, paddingVertical: 16 },
  productTitle: { fontSize: 20, fontWeight: '600', color: C.text, marginBottom: 8, lineHeight: 28 },
  storeText: { fontSize: 14, color: C.text, fontWeight: '500' },
  storeName: { color: C.primary, fontWeight: '600' },
  
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  qtyBox: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  qtyText: { fontSize: 16, fontWeight: '600', color: C.text },
  priceText: { fontSize: 20, fontWeight: '700', color: C.primary },
  
  sectionTitle: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 12 },
  specHeading: { fontSize: 14, color: C.text, fontWeight: '600', marginBottom: 4 },
  bulletText: { fontSize: 14, color: C.subtext, lineHeight: 22 },

  // Spacing helper wrapper to allow commas to wrap naturally
  clickableLinkContainer: {
    flex: 2,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tableRow: { flexDirection: 'row', paddingVertical: 12 },
  tableLabel: { flex: 1, fontSize: 14, color: C.text, fontWeight: '500' },
  tableValueGreen: { fontSize: 14, color: C.primary, fontWeight: '500' }, // Removed flex: 2 so links flow inline
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
  btnWhatsapp: { backgroundColor: '#10B981' }, 
  btnCart: { backgroundColor: '#1C4A3A' }, 
  btnTextWhite: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});