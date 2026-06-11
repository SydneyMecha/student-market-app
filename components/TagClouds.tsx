import React, { useState } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation } from 'react-native';
import { globalStyles } from '../styles/theme';

const TAG_FILTERS = [
  "Outerwears", "Ladies", "Fragrance", "Electronics", "Jewelries", 
  "Dresses", "Home", "Trousers", "Shoes", "Bags", 
  "Watches", "Sports", "Beauty", "Groceries", "Books", 
  "Stationery", "Games", "Fitness", "Unisex", "Vintage",
  "Hoodies", "Sneakers", "Belts", "Caps", "Socks",
  "Skirts", "Shorts", "Suits", "Activewear", "Coats",
  "Jewelry Boxes", "Perfumes", "Skin Care", "Hair Care", "Tech Tools"
];

interface TagCloudsProps {
  activeTag: string;
  onSelectTag: (tag: string) => void;
}

export default function TagClouds({ activeTag, onSelectTag }: TagCloudsProps) {
  // 1. Set the initial visibility state to show exactly 20 tags first
  const [visibleCount, setVisibleCount] = useState(20);

  // 2. Compute true state boundaries
  const isAllShown = visibleCount >= TAG_FILTERS.length;
  
  // Use .slice(0, visibleCount) to dynamically grab the visible window slice of tags
  const visibleTags = TAG_FILTERS.slice(0, visibleCount);

  // 3. Handle the toggle action loop smoothly
  const handleToggleLimit = () => {
    // Configures native LayoutAnimation so items animate or fade into place elegantly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (isAllShown) {
      // If everything is displayed, compress it back down to the first 20
      setVisibleCount(20);
    } else {
      // Otherwise, unfold the next block of 20 items
      setVisibleCount(prev => prev + 20);
    }
  };

  return (
    <View style={globalStyles.tagCloud}>
      {/* Render only the currently sliced window array */}
      {visibleTags.map((tag) => (
        <TouchableOpacity
          key={tag}
          onPress={() => onSelectTag(tag)}
          style={globalStyles.tagChip}
          activeOpacity={0.8}
        >
          <Text 
            style={[globalStyles.tagChipText]}
          >
            {tag}
          </Text>
        </TouchableOpacity>
      ))}
      
      {/* 4. Dynamic Action Control Trigger Button */}
      <TouchableOpacity 
        style={globalStyles.tagChip} 
        onPress={handleToggleLimit}
        activeOpacity={0.8}
      >
        <Text style={globalStyles.tagChipText}>
          {isAllShown ? "Show Less  ▴" : "See More  ▾"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}