import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, ActivityIndicator } from 'react-native';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';

// Interface representing the WooCommerce tag schema
interface WooCommerceTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface TagCloudsProps {
  activeTag: string;
  onSelectTag: (tag: string) => void;
}

export default function TagClouds({ activeTag, onSelectTag }: TagCloudsProps) {
  const [tags, setTags] = useState<WooCommerceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  // Fetch product tags dynamically on mount
  useEffect(() => {
    // Fetches top 50 tags, ordered by the number of products they contain
    fetchWooCommerce('products/tags?per_page=50&orderby=count&order=desc')
      .then((rawTags: any[]) => {
        const formatted = rawTags.map((t) => ({
          id: t.id,
          name: t.name,
          slug: t.slug,
          count: t.count,
        }));
        setTags(formatted);
      })
      .catch((err: any) => {
        console.error('[TagClouds fetch error]:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute true state boundaries using the dynamic tags array length
  const isAllShown = visibleCount >= tags.length;
  const visibleTags = tags.slice(0, visibleCount);

  const handleToggleLimit = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    
    if (isAllShown) {
      setVisibleCount(20);
    } else {
      setVisibleCount((prev) => prev + 20);
    }
  };

  if (loading) {
    return (
      <View style={{ padding: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (tags.length === 0) return null;

  return (
    <View style={globalStyles.tagCloud}>
      {visibleTags.map((tag) => {
        // Check if the current tag matches activeTag (using name or slug)
        const isSelected = activeTag === tag.name || activeTag === tag.slug;

        return (
          <TouchableOpacity
            key={tag.id} // Uses database ID as stable key
            onPress={() => onSelectTag(tag.name)} // Change to tag.slug if your tag routing matches slugs
            style={[
              globalStyles.tagChip,
              isSelected && { backgroundColor: '#E5E7EB' } // Optional highlight style for active tags
            ]}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.tagChipText}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      
      {/* Show more/less button only if there are more than 20 tags */}
      {tags.length > 20 && (
        <TouchableOpacity 
          style={[globalStyles.tagChip, {backgroundColor: C.primary}]} 
          onPress={handleToggleLimit}
          activeOpacity={0.8}
        >
          <Text style={[globalStyles.tagChipText, {color: C.white}]}>
            {isAllShown ? "Show Less  ▴" : "See More  ▾"}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}