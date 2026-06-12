import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';

import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

interface AuthScreenProps {
  onNavigate: (screenName: string) => void;
}

export default function AuthScreen({ onNavigate }: AuthScreenProps) {
  // State controls which form is rendered
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const handleAuthSuccess = () => {
    // In the future, this is where you'll save tokens from WooCommerce
    onNavigate('Home'); 
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* 1. Deep Green Brand Hero Block */}
        <View style={styles.heroHeader}>
            <SafeAreaView style={styles.heroSafeArea}>
                <View style={styles.heroContent}>
                
                <Image 
                    source={require('../assets/Logo.png')} 
                    style={styles.brandLogo} 
                    resizeMode="contain"
                />
                
                <Text style={styles.welcomeText}>
                    {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                </Text>
                </View>
            </SafeAreaView>
        </View>

        {/* 2. White Content Canvas */}
        <View style={styles.contentArea}>
          
          {/* Mode Toggle Pill */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity 
              style={[styles.toggleBtn, authMode === 'login' && styles.toggleBtnActive]}
              onPress={() => setAuthMode('login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, authMode === 'login' && styles.toggleTextActive]}>
                Log In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.toggleBtn, authMode === 'signup' && styles.toggleBtnActive]}
              onPress={() => setAuthMode('signup')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, authMode === 'signup' && styles.toggleTextActive]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>

          {/* Conditional Form Rendering */}
          <View style={styles.formWrapper}>
            {authMode === 'login' ? (
              <LoginForm onLogin={handleAuthSuccess} />
            ) : (
              <SignUpForm onRegister={handleAuthSuccess} />
            )}
          </View>

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: C.bg },
  
  /* Hero Section */
  heroHeader: {
    backgroundColor: '#184233', // Deep signature brand green
    height: 320,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  heroSafeArea: { flex: 1 },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
    brandLogo: {
        width: 90,        // Fixed layout bounds to prevent the asset from bleeding out
        height: 90,
        marginBottom: 16, // Matches the exact breathing room parameter from your mockup
    },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },

  /* White Content Section */
  contentArea: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  
  /* Toggle Pill Container */
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', // Light gray background pill
    borderRadius: 30,
    padding: 4,
    marginBottom: 32,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActive: {
    backgroundColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280', // Inactive gray
  },
  toggleTextActive: {
    color: C.primary,
  },

  formWrapper: { flex: 1 },
});