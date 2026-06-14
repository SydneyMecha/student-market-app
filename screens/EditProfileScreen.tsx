import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Linking
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';
import { fetchWooCommerce } from '../services/wooApi'; // Imported

interface EditProfileScreenProps {
  routeParams: { mode: 'personal' | 'address' };
  currentUser: any; // Mapped logged-in customer object passed from App.js
  onNavigate: (screenName: string, params?: any) => void;
  onProfileUpdate: (updatedUser: any) => void; // Added callback prop
}

// Local helper component to keep the form code DRY
interface EditableFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

const EditableField = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  helperText, 
  keyboardType = 'default' 
}: EditableFieldProps) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <View style={styles.inputWrapper}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={C.subtext}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
      />
      <Icon source="pencil-outline" size={20} color={C.primary} />
    </View>
    {helperText && <Text style={styles.helperText}>{helperText}</Text>}
  </View>
);

export default function EditProfileScreen({ routeParams, currentUser, onNavigate, onProfileUpdate }: EditProfileScreenProps) {
  const activeMode = routeParams?.mode || 'personal';
  const [saving, setSaving] = useState(false);

  // 1. Initialize Personal Details text inputs with active database values
  const [firstName, setFirstName] = useState(currentUser?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.fullName?.split(' ')[1] || '');
  const [displayName, setDisplayName] = useState(currentUser?.username || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.billing?.phone || '');

  // 2. Initialize Shipping Address text inputs with active database values
  const [shippingFirstName, setShippingFirstName] = useState(currentUser?.shipping?.first_name || '');
  const [shippingCity, setShippingCity] = useState(currentUser?.shipping?.city || '');
  const [shippingEmail, setShippingEmail] = useState(currentUser?.billing?.email || '');
  const [shippingPhone, setShippingPhone] = useState(currentUser?.shipping?.phone || '');

  // 3. RESTORED: WooCommerce Asynchronous Customer PUT Updater
  const handleSave = () => {
    if (!currentUser?.id) return;

    setSaving(true);

    let updatePayload = {};

    // Build the payload dynamically based on active mode
    if (activeMode === 'personal') {
      updatePayload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        display_name: displayName, // Editable Display Name
        billing: {
          phone: phone, // Sync phone to billing meta
        }
      };
    } else {
      updatePayload = {
        shipping: {
          first_name: shippingFirstName,
          city: shippingCity,
          phone: shippingPhone,
        },
        billing: {
          first_name: shippingFirstName,
          city: shippingCity,
          phone: shippingPhone,
          email: shippingEmail,
        }
      };
    }

    // Submit a PUT request to update this customer's details in WordPress
    fetchWooCommerce(`customers/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((updatedCustomer) => {
      // SUCCESS: Update your global App.js state so your Profile Screen refreshes instantly
       onProfileUpdate({
        id: updatedCustomer.id,
        username: updatedCustomer.display_name || updatedCustomer.username || "NaN",
        email: updatedCustomer.email || "NaN",
        fullName: `${updatedCustomer.first_name || ''} ${updatedCustomer.last_name || ''}`.trim() || "NaN",
        // Map the secure auto-login URL on edits:
        autologin_url: updatedCustomer.edit_account_autologin_url || "https://studentmarket.co.ke/my-account/edit-account/",
        
        billing: {
          first_name: updatedCustomer.billing?.first_name || "NaN",
          city: updatedCustomer.billing?.city || "NaN",
          phone: updatedCustomer.billing?.phone || "NaN",
          email: updatedCustomer.billing?.email || "NaN",
        },
        shipping: {
          first_name: updatedCustomer.shipping?.first_name || "NaN",
          city: updatedCustomer.shipping?.city || "NaN",
          phone: updatedCustomer.shipping?.phone || "NaN",
        }
      });

      // Navigate back safely to the Profile screen
      onNavigate('Profile');
    })
    .catch((err) => {
      console.error('[WooCommerce Customer PUT Error]:', err);
      Alert.alert("Update Failed", "There was an issue saving your changes to the database. Please try again.");
    })
    .finally(() => setSaving(false));
  };

  const pageTitle = activeMode === 'address' ? 'Shipping Address' : 'Edit Profile';

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      
      {/* Header */}
      <View style={globalStyles.headerRow}>
        <TouchableOpacity 
          style={globalStyles.iconBtn} 
          onPress={() => onNavigate('Profile')}
        >
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        
        {/* Dynamic Title */}
        <Text style={globalStyles.headerTitle}>{pageTitle}</Text>
        
        <View style={{ width: 36 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* ── Personal Details Card ── */}
        {activeMode === 'personal' && (
          <View style={[globalStyles.featuredSectionFrame, { paddingHorizontal: 16 }]}>
            <Text style={styles.sectionHeading}>Personal Details</Text>
            
            <EditableField label="First Name" placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <EditableField label="Last Name" placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            <EditableField label="Display Name" placeholder="John254" value={displayName} onChangeText={setDisplayName} helperText="This name will be displayed in the account section and in reviews" />
            <EditableField label="Email" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <EditableField label="Phone Number" placeholder="0712 345 678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        )}

        {/* ── Shipping Address Card ── */}
        {activeMode === 'address' && (
          <View style={[globalStyles.featuredSectionFrame, { paddingHorizontal: 16 }]}>
            <Text style={styles.sectionHeading}>Shipping Address</Text>
            
            <EditableField label="First Name" placeholder="First Name" value={shippingFirstName} onChangeText={setShippingFirstName} />
            <EditableField label="City/Town" placeholder="City/Town" value={shippingCity} onChangeText={setShippingCity} />
            <EditableField label="Email" placeholder="Email" value={shippingEmail} onChangeText={setShippingEmail} keyboardType="email-address" />
            <EditableField label="Phone Number" placeholder="0712 345 678" value={shippingPhone} onChangeText={setShippingPhone} keyboardType="phone-pad" />
          </View>
        )}

        {/* ── 2. Clickable Web Redirect Helper Footer ── */}
        <View style={styles.footerLinkContainer}>
          <Text style={styles.footerText}>
            Having trouble editing your details?{"\n"}
            <Text 
              style={styles.footerLink}
              onPress={() => {
                const url = currentUser?.autologin_url || "https://studentmarket.co.ke/my-account/edit-account/";
                                
                Linking.openURL(url).catch((err) => console.error("Error opening autologin link:", err));
              }}
            >
              Edit on Website
            </Text>
          </Text>
        </View>

      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.actionBtn, styles.discardBtn]} onPress={() => onNavigate('Profile')} activeOpacity={0.7} disabled={saving}>
          <Text style={styles.discardBtnText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave} activeOpacity={0.9} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={C.white} />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  scrollContent: { 
    paddingBottom: 120,
  },
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 20,
  },
  footerLinkContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 13,
    color: C.subtext,
    textAlign: 'center',
    lineHeight: 20,
  },
  footerLink: {
    fontWeight: '700',
    color: C.primary,
    textDecorationLine: 'underline',
  },
  fieldContainer: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 8 },
  textInput: { flex: 1, fontSize: 14, color: C.text, paddingVertical: 0 },
  helperText: { fontSize: 11, color: C.subtext, marginTop: 6, lineHeight: 16 },
  bottomBar: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    padding: 16,
    backgroundColor: C.white,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  actionBtn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  discardBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.primary },
  discardBtnText: { color: C.primary, fontSize: 15, fontWeight: '600' },
  saveBtn: { backgroundColor: C.primary },
  saveBtnText: { color: C.white, fontSize: 15, fontWeight: '600' },
});