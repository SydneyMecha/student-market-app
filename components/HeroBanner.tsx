import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Dimensions, 
  NativeSyntheticEvent, 
  NativeScrollEvent, 
  LayoutAnimation, 
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import { C } from '../styles/theme';
import { BASE_URL } from '../services/wooApi';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

interface BannerSlide {
  id: number;
  image: string;
  target: {
    type: 'category' | 'tag' | 'on_sale' | 'featured' | 'latest' | 'popular' | 'external';
    id: number;
    name: string;
    external_url?: string;
  };
}

interface HeroBannerProps {
  onNavigate: (screenName: string, params?: any) => void;
}

export default function HeroBanner({ onNavigate }: HeroBannerProps) {
  const [slides, setSlides] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetch(`${BASE_URL}/wp-json/studentmarket/v1/hero-banners`)
      .then(res => res.json())
      .then((data) => setSlides(data))
      .catch((err) => console.error('[HeroBanner Fetch Error]:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (slides.length <= 1 || loading) return;

    const timer = setInterval(() => {
      const nextIndex = active === slides.length - 1 ? 0 : active + 1;
      
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActive(nextIndex);
      
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 4000); 

    return () => clearInterval(timer);
  }, [active, slides.length, loading]); 

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (slides.length === 0) return;
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / CAROUSEL_WIDTH);
    
    if (currentIndex !== active && currentIndex >= 0 && currentIndex < slides.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActive(currentIndex);
    }
  };

  const handleBannerPress = (slide: BannerSlide) => {
    const target = slide.target;
    if (!target) return;

    // If the target type is 'external', open the custom link in their phone's native browser
    if (target.type === 'external' && target.external_url) {
      Linking.openURL(target.external_url)
        .catch((err) => console.error("[External Link Redirect Error]:", err));
    } 
    // Otherwise, route standard internal queries to the catalog archive page
    else {
      onNavigate("ProductArchive", target);
    }
  };

  if (loading) {
    return (
      <View style={[styles.heroCard, { backgroundColor: '#F3F4F6', justifyContent: 'center' }]}>
        <ActivityIndicator size="small" color={C.primary} />
      </View>
    );
  }

  if (slides.length === 0) return null;

  return (
    <View style={styles.heroWrapper}>
      <FlatList
        ref={flatListRef} 
        data={slides}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.heroCard}
            activeOpacity={0.9}
            onPress={() => handleBannerPress(item)}
          >
            <Image 
              source={{ uri: item.image }} 
              style={styles.heroCardImage} 
              contentFit="cover" 
            />
          </TouchableOpacity>
        )}
      />

      {/* Pagination Dots */}
      {slides.length > 1 && (
        <View style={styles.dotRow}>
          {slides.map((_, i) => (
            <View 
              key={i} 
              style={[styles.dot, i === active && styles.dotActive]} 
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroWrapper: { 
    marginTop: 12,
    marginBottom: 8
  },
  heroCard: {
    width: CAROUSEL_WIDTH,
    height: 160,
    borderRadius: 16,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  heroCardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  dotRow: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 10, 
    gap: 6 
  },
  dot: { 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: C.border,
  },
  dotActive: { 
    width: 24,
    backgroundColor: C.primary 
  },
});