import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutAnimation, ActivityIndicator } from 'react-native';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';

interface WooCommerceTag {
  id: number;
  name: string;
  slug: string;
  count: number;
}

interface TagCloudsProps {
  onPressTag: (id: number, name: string) => void; // Updated callback prop
}

export default function TagClouds({ onPressTag }: TagCloudsProps) {
  const [tags, setTags] = useState<WooCommerceTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
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
        return (
          <TouchableOpacity
            key={tag.id} 
            onPress={() => onPressTag(tag.id, tag.name)} // Passes back ID and Name
            style={globalStyles.tagChip}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.tagChipText}>
              {tag.name}
            </Text>
          </TouchableOpacity>
        );
      })}
      
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