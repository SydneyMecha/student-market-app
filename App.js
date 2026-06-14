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
import CategoriesScreen from './screens/CategoriesScreen';
import VendorInfoScreen from './screens/VendorInfoScreen';
import ProductArchiveScreen from './screens/ProductArchiveScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import AuthScreen from './screens/AuthScreen';

import BottomNav from "./components/BottomNav";

const screensWithoutBottomNav = ["Cart", "Checkout", "OrderConfirmation", "EditProfile", "Auth"];

export default function App() {
  // 1. Single source of truth for all routing, parameters, and history stacks
  const [history, setHistory] = useState([{ screen: "Home", params: null }]);

  // 2. Dynamically calculate active tabs and params (prevents out-of-sync loops)
  const currentRoute = history[history.length - 1];
  const activeTab = currentRoute.screen;
  const params = currentRoute.params;

  // Cart States (Global Marketplace Basket)
  const [cartItems, setCartItems] = useState([]);  

  const [currentUser, setCurrentUser] = useState(null);

  // Navigation Forward (Push)
  const navigateTo = (screen, params = null) => {
    setHistory((prev) => [...prev, { screen, params }]); // Shorthand for { screen: screen, params: params }
  };

  // Navigation Backward (Pop)
  const navigateBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return [{ screen: "Home", params: null }]; // Don't pop past Home
      const updated = [...prev];
      updated.pop(); // Safely pop the top screen off the stack
      return updated;
    });
  };

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return null; // Handled by permanent background mount
      case "ProductDetails":
        return (
          <ProductDetailsScreen 
            product={params} 
            onNavigate={navigateTo} 
            onGoBack={navigateBack} 
            onAddToCart={addToCart}
            cartItems={cartItems}
          />
        );
      case "Categories":
        return <CategoriesScreen onNavigate={navigateTo} />;
      case "Cart":
        return (
          <CartScreen 
            cartItems={cartItems}
            onUpdateQty={updateCartQty}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onNavigate={navigateTo} 
            onGoBack={navigateBack}
          />
        );
      case "Checkout":
        return (
          <CheckoutScreen 
            routeParams={params} 
            currentUser={currentUser} // Pass active user state down
            onNavigate={navigateTo} 
            onLoginSuccess={(user) => setCurrentUser(user)} // Pass setter down
          />
        );
      case "OrderConfirmation":
        return (
          <OrderConfirmationScreen 
            order={params}
            onNavigate={navigateTo} 
          />
        );
      case "Vendors":
        return (
          <VendorsScreen 
            onNavigate={navigateTo}
          />
        );
      case "VendorInfo":
        return (
          <VendorInfoScreen 
            vendor={params} 
            onNavigate={navigateTo}
            onGoBack={navigateBack}
          />
        );
      case "ProductArchive":
        return (
          <ProductArchiveScreen 
            archiveParam={params} 
            onNavigate={navigateTo}
            onGoBack={navigateBack}
          />
        );
      case "Profile":
        return (
          <ProfileScreen 
            currentUser={currentUser} 
            onNavigate={navigateTo} 
            onLogout={() => {
              // Clear session and return to Home
              setCurrentUser(null);
              setHistory([{ screen: "Home", params: null }]);
            }}
          />
        );
      case "EditProfile":
        return (
          <EditProfileScreen 
            routeParams={params} // Holds { mode: 'personal' | 'address' }
            currentUser={currentUser} // Pass the active logged-in customer down
            onNavigate={navigateTo} 
            onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)} // Pass state updater down
          />
        );
      case "Auth":
        return (
          <AuthScreen 
            onNavigate={navigateTo} 
            onLoginSuccess={(customer) => {
              setCurrentUser(customer); // Save resolved customer profile
              setHistory([{ screen: "Profile", params: null }]); // Redirect instantly to Profile
            }}
          />
        );
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  // ─── Global Basket State Handlers ───
  const addToCart = (product, qty) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].qty += qty;
        return updated;
      } else {
        return [...prev, { ...product, qty }];
      }
    });
  };

  const updateCartQty = (id, delta) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCartItems([]);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.appContainer}>
          <View style={styles.mainContentWindow}>
            
            {/* Permanent background mount for Home screen */}
            <View style={activeTab !== "Home" ? { display: "none", height: 0, width: 0 } : { flex: 1 }}>
              <HomeScreen 
                onNavigate={navigateTo} 
              />
            </View>

            {activeTab !== "Home" && renderScreen()}
          </View>

          {/* BottomNav */}
          {!screensWithoutBottomNav.includes(activeTab) && (
            <BottomNav 
              activeTab={activeTab} 
              onTabPress={(tabName) => {
                // If user taps Profile and is NOT logged in, redirect them to Auth!
                if (tabName === "Profile" && !currentUser) {
                  navigateTo("Auth");
                } else {
                  setHistory([{ screen: tabName, params: null }]);
                }
              }} 
            />
          )}
          
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appContainer: { flex: 1, backgroundColor: C.bg },
  mainContentWindow: { flex: 1 }
});