import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import CartButton from '../components/CartButton';

interface ProfileScreenProps {
  currentUser: any; // Mapped logged-in customer object passed from App.js
  onNavigate: (screenName: string, params?: any) => void;
  onLogout: () => void; // Added logout callback
}

export default function ProfileScreen({ currentUser, onNavigate, onLogout }: ProfileScreenProps) {
  const userProfile = {
    username: currentUser?.username || "NaN",
    email: currentUser?.email || "NaN",
    fullName: currentUser?.fullName || "NaN",
    orderCount: 0,
    location: currentUser?.billing?.city || "NaN" // Safeguards missing fields as "NaN"
  };

  const menuOptions = [
    {
      id: 'edit_profile',
      title: userProfile.fullName,
      subtitle: userProfile.email,
      icon: 'account-outline',
      target: 'EditProfile'
    },
    {
      id: 'orders',
      title: 'Orders',
      subtitle: `You have ${userProfile.orderCount} orders`,
      icon: 'basket-outline',
      target: 'OrdersList'
    },
    {
      id: 'address',
      title: 'Address',
      subtitle: userProfile.location,
      icon: 'truck-outline',
      target: 'AddressManagement'
    },
    {
      id: 'become_vendor',
      title: 'Become A Vendor',
      subtitle: 'Sell your own products',
      icon: 'storefront-outline',
      target: 'VendorApplication'
    }
  ];

  return (
    <View style={styles.mainContainer}>
      
        <View style={styles.heroHeader}>
            <SafeAreaView>
                
            <View style={[globalStyles.headerRow, {backgroundColor: 'transparent'}]}>
                <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => onNavigate('Home')}
                activeOpacity={0.7}
                >
                  <Icon source="chevron-left" size={24} color={C.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <CartButton onPress={() => onNavigate('Cart')} />
            </View>

            {/* Dynamic User Profile Avatar Frame */}
            <View style={styles.userMetaBlock}>
                <View style={styles.avatarContainer}>
                  <Icon source="account-outline" size={64} color={C.white} />
                </View>
                <Text style={styles.usernameText}>{userProfile.username}</Text>
                <Text style={styles.emailText}>{userProfile.email}</Text>
            </View>
            </SafeAreaView>
        </View>

        <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.scrollContent}
        >
            <View style={styles.menuContainer}>
            {menuOptions.map((option) => (
                <TouchableOpacity
                key={option.id}
                style={styles.menuCell}
                onPress={() => {
                  if (option.id === 'address') {
                    onNavigate("EditProfile", { mode: 'address' });
                  } else if (option.id === 'edit_profile') {
                    onNavigate("EditProfile", { mode: 'personal' });
                  } else {
                    onNavigate(option.target);
                  }
                }}
                activeOpacity={0.7}
                >
                <View style={styles.iconBox}>
                    <Icon source={option.icon} size={24} color="#3A5E4E" />
                </View>
                
                <View style={styles.textDetails}>
                    <Text style={styles.cellTitle}>{option.title}</Text>
                    <Text style={styles.cellSubtitle}>{option.subtitle}</Text>
                </View>

                <Icon source="chevron-right" size={20} color={C.subtext} />
                </TouchableOpacity>
            ))}
            </View>

            {/* 2. Connected log-out session helper */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={onLogout}
              activeOpacity={0.8}
            >
              <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: C.bg },
  
  /* Hero Section Elements */
  heroHeader: {
    backgroundColor: C.primary,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 32,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
  },
  userMetaBlock: {
    alignItems: 'center',
    marginTop: 16,
  },
  avatarContainer: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  usernameText: {
    fontSize: 20,
    fontWeight: '700',
    color: C.white,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  emailText: {
    fontSize: 14,
    color: C.lightGray,
    fontWeight: '400',
  },

  /* Menu Layout Options */
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  menuContainer: {
    gap: 12,
    marginBottom: 24,
  },
  menuCell: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F4F7F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textDetails: {
    flex: 1,
    marginLeft: 14,
  },
  cellTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.text,
    marginBottom: 2,
  },
  cellSubtitle: {
    fontSize: 12,
    color: C.subtext,
  },

  /* Action Buttons */
  logoutButton: {
    borderColor: '#124632',
    borderWidth: 1.2,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  logoutText: {
    color: '#124632',
    fontSize: 15,
    fontWeight: '600',
  },
});