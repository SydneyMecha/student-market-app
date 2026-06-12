import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { C } from './styles/theme';

import HomeScreen from "./screens/HomeScreen";
import ProductDetailsScreen from "./screens/ProductDetailsScreen";
import CartScreen from "./screens/CartScreen";
import CheckoutScreen from "./screens/CheckoutScreen";
import OrderConfirmationScreen from "./screens/OrderConfirmationScreen";
import VendorsScreen, { Vendor } from './screens/VendorsScreen'; // Imported Vendor interface
import CategoriesScreen from './screens/CategoriesScreen';
import VendorInfoScreen from './screens/VendorInfoScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AuthScreen from './screens/AuthScreen';

import BottomNav from "./components/BottomNav";

const screensWithoutBottomNav = ["Cart", "Checkout", "OrderConfirmation", "EditProfile", "Auth", "VendorInfoScreen"];

export default function App() {
  // 1. All state hooks are now declared correctly inside the component body
  const [activeTab, setActiveTab] = useState("Home");
  const [selectedVendor, setSelectedVendor] = useState(null); 

  // 2. Render screen using the unified routing state (activeTab)
  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return <HomeScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "ProductDetails":
        return <ProductDetailsScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Categories":
        return <CategoriesScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Cart":
        return <CartScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Checkout":
        return <CheckoutScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "OrderConfirmation":
        return <OrderConfirmationScreen onNavigate={(screen) => setActiveTab(screen)} />;
      
      // 3. Render VendorsScreen inside the case path and pass down the active vendor setter
      case "Vendors":
        return (
          <VendorsScreen 
            onNavigate={(screen) => setActiveTab(screen)}
            onSelectVendor={(vendor) => setSelectedVendor(vendor)}
          />
        );
      
      // 4. Render VendorInfoScreen with the saved vendor data object
      case "VendorInfo":
        return (
          <VendorInfoScreen 
            vendor={selectedVendor} 
            onNavigate={(screen) => setActiveTab(screen)}
          />
        );
        
      case "Profile":
        return <ProfileScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "EditProfile":
        return <EditProfileScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Auth":
        return <AuthScreen onNavigate={(screen) => setActiveTab(screen)} />;
      default:
        return <HomeScreen onNavigate={(screen) => setActiveTab(screen)} />;
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.appContainer}>
          <View style={styles.mainContentWindow}>
            {renderScreen()}
          </View>

          {/* Render BottomNav only if the activeTab is not in the hidden list */}
          {!screensWithoutBottomNav.includes(activeTab) && (
            <BottomNav 
              activeTab={activeTab} 
              onTabPress={(tabName) => setActiveTab(tabName)} 
            />
          )}
          
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: C.bg,
  },
  mainContentWindow: {
    flex: 1, // Forces the screen content window to fill all available space above the navbar
  }
});