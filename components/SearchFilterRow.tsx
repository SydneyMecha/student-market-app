import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Icon, Menu } from 'react-native-paper';
import { C } from '../styles/theme'; // Adjust path if needed

interface SearchFilterRowProps {
  searchQuery: string;
  onChangeSearch: (text: string) => void;
  placeholderText?: string;
  onSelectSort?: (sortBy: string, label: string) => void; 
}

export default function SearchFilterRow({
  searchQuery,
  onChangeSearch,
  placeholderText = 'Search...',
  onSelectSort,
}: SearchFilterRowProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.searchRow}>
      
      {/* Menu Wrapper for Filter Button */}
      {onSelectSort && (
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <TouchableOpacity 
              style={styles.filterBtn}
              onPress={() => setMenuVisible(true)}
              activeOpacity={0.7}
            >
              <Icon source="filter-variant" size={28} color={C.text} />
            </TouchableOpacity>
          }
        >
          {/* Updated menu items to support all 5 product sorting metrics */}
          <Menu.Item 
            onPress={() => {
              onSelectSort('popularity', 'Sort by popularity');
              setMenuVisible(false);
            }} 
            title="Sort by popularity" 
          />
          <Menu.Item 
            onPress={() => {
              onSelectSort('rating', 'Sort by average rating');
              setMenuVisible(false);
            }} 
            title="Sort by average rating" 
          />
          <Menu.Item 
            onPress={() => {
              onSelectSort('date_desc', 'Sort by latest');
              setMenuVisible(false);
            }} 
            title="Sort by latest" 
          />
          <Menu.Item 
            onPress={() => {
              onSelectSort('price_asc', 'Sort by price: low to high');
              setMenuVisible(false);
            }} 
            title="Sort by price: low to high" 
          />
          <Menu.Item 
            onPress={() => {
              onSelectSort('price_desc', 'Sort by price: high to low');
              setMenuVisible(false);
            }} 
            title="Sort by price: high to low" 
          />
        </Menu>
      )}
      
      {/* Integrated Working Search Input Box */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBarInputRow}>
          <Icon source="magnify" size={20} color={C.subtext} />
          <TextInput
            placeholder={placeholderText}
            placeholderTextColor={C.subtext}
            style={styles.textInput}
            value={searchQuery}
            onChangeText={onChangeSearch} 
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    zIndex: 9999,       
    position: 'relative', 
  },
  filterBtn: {
    padding: 4,
  },
  searchBarContainer: {
    flex: 1,
    height: 50
  },
  searchBarInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 15,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: C.text,
  },
});