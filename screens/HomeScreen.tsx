import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  StatusBar,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PRODUCTS } from '../types';
import { globalStyles } from '../styles/theme';

import HeroBanner from '../components/HeroBanner';
import SectionHeader from '../components/SectionHeader';
import CategoryCircles from '../components/CategoryCircles';
import ProductGrid from '../components/ProductGrid';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import TabBar from '../components/TabBar';
import ProductSection from "../components/ProductSections";
import TagClouds from '../components/TagClouds';
import CartButton from '../components/CartButton';

const PRODUCT_TABS = ["Latest", "Offers", "Featured"];
const GENDER_FILTERS = ["Ladies", "Men", "Jewelries", "Fragrance", "Accessories"];

interface HomeScreenProps {
  onNavigate: (screenName: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [genderFilter, setGenderFilter] = useState("Ladies");
  const [activeTag, setActiveTag] = useState("Outerwears");
  const [activeTab, setActiveTab] = useState("Latest");

  const filteredProducts = PRODUCTS.filter(
    (product) => product.category === activeTab
  );

  return (
    <SafeAreaView style={globalStyles.safe} edges={["top"]}>
      <View style={globalStyles.headerRow}>
        <SearchBar 
         placeholderText='Search for products...'
        />
        <CartButton onPress={() => onNavigate("Cart")} />
      </View>

      <ScrollView
        style={globalStyles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={globalStyles.scrollContent}
        nestedScrollEnabled={true}
      >
        {/* Hero */}
        <HeroBanner />

        {/* Latest / Offers / Featured */}
        <View style={globalStyles.featuredSectionFrame}>
            
          <TabBar 
            tabs={PRODUCT_TABS} 
            active={activeTab} 
            onSelect={(tabName) => setActiveTab(tabName)} 
            variant="pill" 
          />

          <ProductGrid products={filteredProducts} showViewMore={true} />

        </View>

        {/* Gender filter chips */}
        <TabBar
          tabs={GENDER_FILTERS}
          active={genderFilter}
          onSelect={setGenderFilter}
          variant="chip"
        />
    
        {/* Featured */}
        <ProductSection 
          title="Featured" 
          products={PRODUCTS} 
        />
        
        {/* Categories circles */}
        <CategoryCircles />

        <ProductSection 
          title="Clothing" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Home Products" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Fashion Accessories" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Men's Products" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Beauty & Grooming" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Electronics" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Footwear" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Jewelries" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Food and Snacks" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Services" 
          products={PRODUCTS} 
        />

        <ProductSection 
          title="Tech Products" 
          products={PRODUCTS} 
        />

        {/* Tag cloud */}
        <TagClouds 
          activeTag={activeTag} 
          onSelectTag={(tag) => setActiveTag(tag)} 
        />

        <View style={{ height: 32 }} />
      </ScrollView>
      
    </SafeAreaView>
  );
}
