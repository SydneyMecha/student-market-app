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
import VendorsScreen from './screens/VendorsScreen';

import BottomNav from "./components/BottomNav";

export default function App() {
  const [activeTab, setActiveTab] = useState("Home");

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return <HomeScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Categories":
        return <ProductDetailsScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Cart":
        return <CartScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Checkout":
        return <CheckoutScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "OrderConfirmation":
        return <OrderConfirmationScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Vendors":
        return <VendorsScreen onNavigate={(screen) => setActiveTab(screen)} />;
      case "Profile":
        return <HomeScreen onNavigate={(screen) => setActiveTab(screen)} />;
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

          {/* Keep the bottom nav synced */}
          <BottomNav 
            activeTab={activeTab === "Cart" ? "Shop" : activeTab} // Keeps shop highlighted if checking out
            onTabPress={(tabName) => setActiveTab(tabName)} 
          />
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
  },
  fallbackCentering: {
    flex: 1,
  }
});