import React from 'react';
import { View, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme'; // Adjust path as needed

interface SearchBarProps {
  placeholderText: string;
  value: string;
  onChangeText: (text: string) => void;
  loading?: boolean;
  onFocus?: () => void;
  onProductSelect?: (product: any) => void;
}

export default function SearchBar({ placeholderText, value, onChangeText, loading, onFocus }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <Icon source="magnify" size={20} color={C.subtext} />
      <TextInput
        placeholder={placeholderText}
        placeholderTextColor={C.subtext}
        style={styles.textInput}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus} // 2. Connected focus listener
      />
      {loading && <ActivityIndicator size="small" color={C.primary} style={{ marginLeft: 8 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 24,
    paddingHorizontal: 15,
    height: 50,
  },
  textInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: C.text,
  },
});