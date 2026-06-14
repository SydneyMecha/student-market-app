import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Linking
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi';

import LoginForm from '../components/LoginForm';
import SignUpForm from '../components/SignUpForm';

interface AuthScreenProps {
  onNavigate: (screenName: string, params?: any) => void;
  onLoginSuccess: (customer: any) => void; 
  onGoBack?: () => void;
}

export default function AuthScreen({ onNavigate, onLoginSuccess, onGoBack }: AuthScreenProps) {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  // ─── Live WooCommerce LOGIN session resolver ───
  const handleLogin = (emailAddress: string) => {
    if (!emailAddress || emailAddress.trim().length === 0) {
      Alert.alert("Input Required", "Please enter your email address to log in.");
      return;
    }

    setLoading(true);

    fetchWooCommerce(`customers?email=${emailAddress.trim().toLowerCase()}`)
      .then((raw: any[]) => {
        if (raw.length === 0) {
          Alert.alert(
            "Account Not Found", 
            "No customer account exists for this email. Please check your spelling or Sign Up. \n\nIf it's a vendor account, please use the website.",
            [
              { 
                text: "Dismiss", 
                style: "cancel" 
              },
              { 
                text: "Go to Website", 
                onPress: () => Linking.openURL('https://studentmarket.co.ke/my-account/') 
              }
            ]
          );
          return;
        }

        const customer = raw[0];

        onLoginSuccess({
          id: customer.id,
          username: customer.display_name || customer.username || "NaN",
          email: customer.email || "NaN",
          fullName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || "NaN",
          autologin_url: customer.edit_account_autologin_url || "https://studentmarket.co.ke/my-account/edit-account/",
          
          billing: {
            first_name: customer.billing?.first_name || "NaN",
            city: customer.billing?.city || "NaN",
            phone: customer.billing?.phone || "NaN",
            email: customer.billing?.email || "NaN",
          },
          shipping: {
            first_name: customer.shipping?.first_name || "NaN",
            city: customer.shipping?.city || "NaN",
            phone: customer.shipping?.phone || "NaN",
          }
        });
      })
      .catch((err) => {
        console.error('[Customer Auth Fetch Error]:', err);
        Alert.alert("Login Failed", "There was an issue connecting to the database. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  // ─── Live WooCommerce SIGN UP creator ───
  const handleRegister = (emailAddress: string) => {
    if (!emailAddress || emailAddress.trim().length === 0) {
      Alert.alert("Input Required", "Please enter an email address to register.");
      return;
    }

    setLoading(true);

    const generatedUsername = emailAddress.split('@')[0] + Math.floor(100 + Math.random() * 900);

    const customerPayload = {
      email: emailAddress.trim().toLowerCase(),
      username: generatedUsername,
    };

    fetchWooCommerce('customers', {
      method: 'POST',
      body: JSON.stringify(customerPayload),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((newCustomer) => {
      Alert.alert(
        "Registration Successful",
        `Welcome! A link to configure your temporary password has been successfully sent to ${emailAddress}.`,
        [
          { 
            text: "OK", 
            onPress: () => {
              onLoginSuccess({
                id: newCustomer.id,
                username: newCustomer.display_name || newCustomer.username || "NaN", 
                email: newCustomer.email || "NaN",
                fullName: `${newCustomer.first_name || ''} ${newCustomer.last_name || ''}`.trim() || "NaN",
                autologin_url: newCustomer.edit_account_autologin_url || "https://studentmarket.co.ke/my-account/edit-account/",
                
                billing: {
                  first_name: newCustomer.billing?.first_name || "NaN",
                  city: newCustomer.billing?.city || "NaN",
                  phone: newCustomer.billing?.phone || "NaN",
                  email: newCustomer.billing?.email || "NaN",
                },
                shipping: {
                  first_name: newCustomer.shipping?.first_name || "NaN",
                  city: newCustomer.shipping?.city || "NaN",
                  phone: newCustomer.shipping?.phone || "NaN",
                }
              });
            } 
          }
        ]
      );
    })
    .catch((err) => {
      console.error('[WooCommerce Customer Register Error]:', err);
      Alert.alert("Registration Failed", "This email address is already registered, or your server declined the request.");
    })
    .finally(() => setLoading(false));
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: C.bg }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.mainContainer}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 }}>
            <ActivityIndicator size="large" color={C.primary} />
            <Text style={{ color: C.subtext, fontSize: 14 }}>Connecting to account...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
            <View style={styles.heroHeader}>
                <SafeAreaView style={styles.heroSafeArea}>
                    
                    {onGoBack && (
                      <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={onGoBack}
                        activeOpacity={0.7}
                      >
                        <Icon source="chevron-left" size={24} color={C.white} />
                      </TouchableOpacity>
                    )}

                    <View style={styles.heroContent}>
                      <Image source={require('../assets/Logo.png')} style={styles.brandLogo} resizeMode="contain" />
                      <Text style={styles.welcomeText}>
                          {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                      </Text>
                    </View>
                </SafeAreaView>
            </View>

            <View style={styles.contentArea}>
              <View style={styles.toggleContainer}>
                <TouchableOpacity style={[styles.toggleBtn, authMode === 'login' && styles.toggleBtnActive]} onPress={() => setAuthMode('login')} activeOpacity={0.8}>
                  <Text style={[styles.toggleText, authMode === 'login' && styles.toggleTextActive]}>Log In</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.toggleBtn, authMode === 'signup' && styles.toggleBtnActive]} onPress={() => setAuthMode('signup')} activeOpacity={0.8}>
                  <Text style={[styles.toggleText, authMode === 'signup' && styles.toggleTextActive]}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.formWrapper}>
                {authMode === 'login' ? (
                  <LoginForm onLogin={(email) => handleLogin(email)} />
                ) : (
                  <SignUpForm onRegister={(email) => handleRegister(email)} />
                )}
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  heroHeader: {
    backgroundColor: '#184233', 
    height: 320,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: 'relative',
  },
  heroSafeArea: { flex: 1 },
  heroContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 40, // Places safely below different notch heights
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  brandLogo: {
    width: 90,        
    height: 90,
    marginBottom: 16, 
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '800',
    color: C.white,
    letterSpacing: 0.5,
  },
  contentArea: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 60,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6', 
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
    color: '#6B7280', 
  },
  toggleTextActive: {
    color: C.primary,
  },
  formWrapper: { flex: 1 },
});