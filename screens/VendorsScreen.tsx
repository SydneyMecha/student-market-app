import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import CartButton from '../components/CartButton';
import SearchBar from '../components/SearchBar';
import VendorCard from '../components/VendorCard';

// --- Mock Data ---
export interface Vendor {
  id: string;
  name: string;
  address: string;
  city: string;
}

const MOCK_VENDORS: Vendor[] = Array(8).fill(null).map((_, i) => ({
  id: `vendor-${i}`,
  name: "Vendor Name",
  address: "Address",
  city: "City/Town"
}));

export default function VendorsScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.safeArea}>
      
      {/* 1. Standard Header */}
      <View style={styles.header}>
        <TouchableOpacity style={globalStyles.iconBtn}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Vendors</Text>
        <CartButton onPress={() => {}} />
      </View>

      {/* 2. Filter & Search Bar Row */}
      <View style={styles.searchRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <Icon source="filter-variant" size={28} color={C.text} />
        </TouchableOpacity>
        
        <SearchBar 
            placeholderText='Search for vendors...'
        />
      </View>

      {/* 3. Vendor List */}
      <FlatList
        data={MOCK_VENDORS}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <VendorCard 
            vendor={item} 
            onPress={() => console.log("Navigate to Vendor ID:", item.id)} 
          />
        )}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.surface,
  },
  iconBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.text },
  
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
  searchInputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: C.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: C.text,
  },
  
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 8,
  },
});