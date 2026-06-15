import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { C } from './styles/theme';
import { updateGlobalCartCount } from './services/cartState';
import { BackHandler } from 'react-native';

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
import OrdersScreen from './screens/OrdersScreen';

import BottomNav from "./components/BottomNav";

const screensWithoutBottomNav = ["Cart", "Checkout", "OrderConfirmation", "EditProfile", "Auth", "ProductDetails", "VendorInfo" ];

export default function App() {
  const [history, setHistory] = useState([{ screen: "Home", params: null }]);
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  React.useEffect(() => {
    const onHardwareBackPress = () => {
      // If we have history to pop, go back step-by-step
      if (history.length > 1) {
        navigateBack();
        return true;
      }
      return false;
    };

    BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => BackHandler.removeEventListener('hardwareBackPress', onHardwareBackPress);
  }, [history]);

  const currentRoute = history[history.length - 1];
  const activeTab = currentRoute.screen;
  const params = currentRoute.params;

  // Automatically broadcast any additions, subtractions, or cart clears
  useEffect(() => {
    updateGlobalCartCount(cartItems.length);
  }, [cartItems]);

  // Navigation Forward (Push)
  const navigateTo = (screen, screenParams = null) => {
    setHistory((prev) => [...prev, { screen, params: screenParams }]);
  };

  // Navigation Backward (Pop)
  const navigateBack = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return [{ screen: "Home", params: null }];
      const updated = [...prev];
      updated.pop();
      return updated;
    });
  };

  // Global Basket State Handlers
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

  const renderScreen = () => {
    switch (activeTab) {
      case "Home":
        return null;
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
            currentUser={currentUser}
            onNavigate={navigateTo} 
            onLoginSuccess={(user) => setCurrentUser(user)}
            onGoBack={navigateBack}
            onClearCart={clearCart}
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
            onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
            onLogout={() => {
              setCurrentUser(null);
              setHistory([{ screen: "Auth", params: null }]);
            }}
          />
        );
      case "EditProfile":
        return (
          <EditProfileScreen 
            routeParams={params} 
            currentUser={currentUser}
            onNavigate={navigateTo} 
            onProfileUpdate={(updatedUser) => setCurrentUser(updatedUser)}
          />
        );
      case "OrdersList":
        return (
          <OrdersScreen 
            currentUser={currentUser} // Passes active user session
            onNavigate={navigateTo} 
            onGoBack={navigateBack}
          />
        );
      case "Auth":
        return (
          <AuthScreen 
            onNavigate={navigateTo} 
            onLoginSuccess={(customer) => {
              setCurrentUser(customer); 
              setHistory([{ screen: "Profile", params: null }]); 
            }}
            onGoBack={navigateBack}
          />
        );
      default:
        return <HomeScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <View style={styles.appContainer}>
          <View style={styles.mainContentWindow}>
            
            {/* ── Permanent background mount for Home screen ── */}
            <View style={activeTab !== "Home" ? { display: "none", height: 0, width: 0 } : { flex: 1 }}>
              <HomeScreen 
                onNavigate={navigateTo} 
              />
            </View>

            {/* ── Permanent background mount for Categories screen (PRESERVES STATE) ── */}
            <View style={activeTab !== "Categories" ? { display: "none", height: 0, width: 0 } : { flex: 1 }}>
              <CategoriesScreen 
                onNavigate={navigateTo} 
              />
            </View>

            {/* Render other temporary screens dynamically */}
            {activeTab !== "Home" && activeTab !== "Categories" && renderScreen()}
          </View>

          {/* BottomNav */}
          {!screensWithoutBottomNav.includes(activeTab) && (
            <BottomNav 
              activeTab={activeTab} 
              onTabPress={(tabName) => {
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