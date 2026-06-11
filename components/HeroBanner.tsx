import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, LayoutAnimation } from 'react-native';
import { C } from '../styles/theme';
import { Icon } from 'react-native-paper';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CAROUSEL_WIDTH = SCREEN_WIDTH - 32;

const HERO_SLIDES = [
  { id: 1, label: "New Arrivals", bg: C.primary },
  { id: 2, label: "Summer Sale", bg: C.primary },
  { id: 3, label: "Trending Now", bg: C.primary },
];

export default function HeroBanner() {
  const [active, setActive] = useState(0);
  
  // 1. Create a remote control reference for our FlatList
  const flatListRef = useRef<FlatList>(null);

  // 2. Setup the Auto-Scroll Timer Loop
  useEffect(() => {
    const timer = setInterval(() => {
      // Calculate what the next slide index should be
      // MATH: If we are on the last slide, loop back to 0. Otherwise, add 1.
      const nextIndex = active === HERO_SLIDES.length - 1 ? 0 : active + 1;
      
      // Tell the native layout engine to animate the dot stretch smoothly
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      
      // Update our active state index tracking
      setActive(nextIndex);
      
      // Use our reference to programmatically scroll the FlatList to the next card position
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, 2000); // 2000ms = 2 seconds interval loop time

    // CRITICAL CLEANUP: When the user leaves this screen, kill the timer 
    // so it doesn't run in the background and drain the user's phone battery.
    return () => clearInterval(timer);
  }, [active]); // Re-run the effect layout listener whenever the active index changes

  // 3. Keep manual finger swipes in sync with our automated state
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollOffset = event.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(scrollOffset / CAROUSEL_WIDTH);
    
    if (currentIndex !== active && currentIndex >= 0 && currentIndex < HERO_SLIDES.length) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setActive(currentIndex);
    }
  };

  return (
    <View style={styles.heroWrapper}>
      <FlatList
        ref={flatListRef} // 4. Connect our remote control ref to the FlatList
        data={HERO_SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.heroCard, { backgroundColor: item.bg }]}>
            <View style={styles.heroContent}>
              <Icon source="image-outline" size={64} color="rgba(255,255,255,0.6)" />
              <Text style={styles.heroPromptText}>{item.label}</Text>
            </View>
          </View>
        )}
      />

      {/* Pagination Dots */}
      <View style={styles.dotRow}>
        {HERO_SLIDES.map((_, i) => (
          <View 
            key={i} 
            style={[styles.dot, i === active && styles.dotActive]} 
          />
        ))}
      </View>
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
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  heroContent: { 
    alignItems: "center", 
    gap: 12 
  },
  heroPromptText: { 
    fontSize: 13, 
    color: '#FFFFFF',
    fontWeight: "500" 
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