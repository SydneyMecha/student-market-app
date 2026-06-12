import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';

interface SearchBarProps {
  placeholderText: string;
}

export default function SearchBar({ placeholderText }: SearchBarProps) {
  return (
    <View style={styles.searchBox}>
      {/* Fixed: Accessing the real color object value instead of a raw string */}
      <Icon source="magnify" size={20} color={C.subtext} />
      <TextInput
        placeholder={placeholderText} 
        placeholderTextColor={C.subtext}
        style={styles.searchInput}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white, 
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 50,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: C.text,
  },
});