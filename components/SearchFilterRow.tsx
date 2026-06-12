import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native'; // Added TextInput
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
          <Menu.Item 
            onPress={() => {
              onSelectSort('registered', 'Most Recent');
              setMenuVisible(false);
            }} 
            title="Most Recent" 
          />
          <Menu.Item 
            onPress={() => {
              onSelectSort('popularity', 'Most Popular');
              setMenuVisible(false);
            }} 
            title="Most Popular" 
          />
          <Menu.Item 
            onPress={() => {
              onSelectSort('rand', 'Random');
              setMenuVisible(false);
            }} 
            title="Random" 
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
            onChangeText={onChangeSearch} // Directly connected to parent's state setter
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