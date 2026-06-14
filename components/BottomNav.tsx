import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { C } from '../styles/theme';
import { Icon } from 'react-native-paper';

interface BottomNavProps {
  activeTab: string;
  onTabPress: (tabName: string) => void;
}

export default function BottomNav({ activeTab, onTabPress }: BottomNavProps) {
  const items = [
    { label: "Home",    icon: "home-outline",       iconActive: "home" },
    { label: "Categories",    icon: "menu",               iconActive: "menu" },
    { label: "Vendors",    icon: "storefront-outline", iconActive: "storefront" },
    { label: "Profile", icon: "account-outline",    iconActive: "account" },
  ] as const;

  return (
    <View style={styles.bottomNav}>
      {items.map(({ label, icon, iconActive }) => {
        const isActive = label === activeTab;
        
        return (
          <TouchableOpacity
            key={label}
            style={styles.navItem}
            onPress={() => onTabPress(label)}
            activeOpacity={0.8}
          >
            <View style={[styles.navIconContainer, isActive && styles.navIconActive]}>
              <Icon
                source={isActive ? iconActive : icon}
                size={22}
                color={isActive ? C.white : C.subtext}
              />
            </View>

            <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    backgroundColor: C.navBg,
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navItem: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 4 
  },
  navIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: 'transparent',
    alignItems: "center",
    justifyContent: "center",
  },
  navIconActive: { 
    backgroundColor: C.primary,
    borderRadius: 32,
  },
  navLabel: { 
    fontSize: 12, 
    color: C.subtext,
    fontWeight: "500"
  },
  navLabelActive: { 
    color: C.primary,
    fontWeight: "600" 
  },
});