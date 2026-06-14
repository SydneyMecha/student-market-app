import React, { useState, useMemo } from 'react';
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
import { fetchWooCommerce } from '../services/wooApi';

interface EditProfileScreenProps {
  routeParams: { mode: 'personal' | 'address' };
  currentUser: any; 
  onNavigate: (screenName: string, params?: any) => void;
  onProfileUpdate: (updatedUser: any) => void; 
}

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

interface EditableDropdownProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  helperText?: string;
}

const EditableDropdown = ({ label, value, options, onSelect, helperText }: EditableDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TouchableOpacity 
        style={styles.inputWrapper} 
        onPress={() => setIsOpen(!isOpen)}
        activeOpacity={0.7}
      >
        <Text style={[styles.textInput, { color: value ? C.text : C.subtext, paddingVertical: 8 }]}>
          {value || "Select an option"}
        </Text>
        <Icon source={isOpen ? "chevron-up" : "chevron-down"} size={20} color={C.primary} />
      </TouchableOpacity>
      
      {/* Expanding Menu Items */}
      {isOpen && (
        <View style={styles.dropdownMenu}>
          {options.map((opt, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.dropdownItem}
              onPress={() => {
                onSelect(opt);
                setIsOpen(false);
              }}
            >
              <Text style={[styles.dropdownItemText, value === opt && styles.dropdownItemTextActive]}>
                {opt}
              </Text>
              {value === opt && <Icon source="check" size={18} color={C.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {helperText && <Text style={styles.helperText}>{helperText}</Text>}
    </View>
  );
};


export default function EditProfileScreen({ routeParams, currentUser, onNavigate, onProfileUpdate }: EditProfileScreenProps) {
  const activeMode = routeParams?.mode || 'personal';
  const [saving, setSaving] = useState(false);

  // Personal Details State
  const [firstName, setFirstName] = useState(currentUser?.first_name || currentUser?.fullName?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(currentUser?.last_name || currentUser?.fullName?.split(' ')[1] || '');
  const [displayName, setDisplayName] = useState(
    currentUser?.display_name || currentUser?.fullName || currentUser?.username || ''
  );
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.billing?.phone || '');

  // Shipping Address State
  const [shippingFirstName, setShippingFirstName] = useState(currentUser?.shipping?.first_name || '');
  const [shippingCity, setShippingCity] = useState(currentUser?.shipping?.city || '');
  const [shippingEmail, setShippingEmail] = useState(currentUser?.billing?.email || '');
  const [shippingPhone, setShippingPhone] = useState(currentUser?.shipping?.phone || '');
  
  // This dynamically watches the first/last name fields and generates permutations, removing duplicates.
  const displayNameOptions = useMemo(() => {
    const rawUsername = currentUser?.username || '';
    const fName = firstName.trim();
    const lName = lastName.trim();

    // Using a Set ensures we don't get duplicate options if the first and last name are somehow the same
    const optionsSet = new Set<string>();
    
    if (rawUsername) optionsSet.add(rawUsername);
    if (fName) optionsSet.add(fName);
    if (lName) optionsSet.add(lName);
    if (fName && lName) {
      optionsSet.add(`${fName} ${lName}`);
      optionsSet.add(`${lName} ${fName}`);
    }

    return Array.from(optionsSet).filter(Boolean); // Filter out any empty strings
  }, [firstName, lastName, currentUser?.username]);


  const handleSave = () => {
    if (!currentUser?.id) return;

    setSaving(true);
    let updatePayload = {};

    if (activeMode === 'personal') {
      updatePayload = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        display_name: displayName, 
        billing: { phone: phone }
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

    fetchWooCommerce(`customers/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify(updatePayload),
      headers: { 'Content-Type': 'application/json' }
    })
    .then((updatedCustomer) => {
        
        onProfileUpdate({
        id: updatedCustomer.id,
        username: currentUser?.username, // preserve username
        display_name: updatedCustomer.display_name || currentUser?.username,
        email: updatedCustomer.email || "NaN",
        fullName: `${updatedCustomer.first_name || ''} ${updatedCustomer.last_name || ''}`.trim() || "NaN",
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
      
      <View style={globalStyles.headerRow}>
        <TouchableOpacity style={globalStyles.iconBtn} onPress={() => onNavigate('Profile')}>
          <Icon source="chevron-left" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={globalStyles.headerTitle}>{pageTitle}</Text>
        <View style={{ width: 36 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {activeMode === 'personal' && (
          <View style={[globalStyles.featuredSectionFrame, { paddingHorizontal: 16 }]}>
            <Text style={styles.sectionHeading}>Personal Details</Text>
            
            <EditableField label="First Name" placeholder="First Name" value={firstName} onChangeText={setFirstName} />
            <EditableField label="Last Name" placeholder="Last Name" value={lastName} onChangeText={setLastName} />
            
            <EditableDropdown 
              label="Display Name publicly as" 
              value={displayName} 
              options={displayNameOptions}
              onSelect={(newVal) => {
                setDisplayName(newVal); 
              }} 
              helperText="This name will be displayed in the account section and in reviews" 
            />
            
            <EditableField label="Email" placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
            <EditableField label="Phone Number" placeholder="0712 345 678" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
          </View>
        )}

        {activeMode === 'address' && (
          <View style={[globalStyles.featuredSectionFrame, { paddingHorizontal: 16 }]}>
            <Text style={styles.sectionHeading}>Shipping Address</Text>
            <EditableField label="First Name" placeholder="First Name" value={shippingFirstName} onChangeText={setShippingFirstName} />
            <EditableField label="City/Town" placeholder="City/Town" value={shippingCity} onChangeText={setShippingCity} />
            <EditableField label="Email" placeholder="Email" value={shippingEmail} onChangeText={setShippingEmail} keyboardType="email-address" />
            <EditableField label="Phone Number" placeholder="0712 345 678" value={shippingPhone} onChangeText={setShippingPhone} keyboardType="phone-pad" />
          </View>
        )}

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
  scrollContent: { paddingBottom: 120 },
  sectionHeading: { fontSize: 20, fontWeight: '700', color: C.text, marginBottom: 20 },
  
  /* Field Elements */
  fieldContainer: { marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: C.border, paddingBottom: 8 },
  textInput: { flex: 1, fontSize: 14, color: C.text, paddingVertical: 0 },
  helperText: { fontSize: 11, color: C.subtext, marginTop: 6, lineHeight: 16 },
  
  /* Dropdown Elements */
  dropdownMenu: {
    marginTop: 8,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: 14,
    color: C.text,
  },
  dropdownItemTextActive: {
    fontWeight: '700',
    color: C.primary,
  },

  /* Footer & Nav Elements */
  footerLinkContainer: { paddingHorizontal: 24, marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 13, color: C.subtext, textAlign: 'center', lineHeight: 20 },
  footerLink: { fontWeight: '700', color: C.primary, textDecorationLine: 'underline' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', padding: 16, backgroundColor: C.white, gap: 16, borderTopWidth: 1, borderTopColor: C.border },
  actionBtn: { flex: 1, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  discardBtn: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.primary },
  discardBtnText: { color: C.primary, fontSize: 15, fontWeight: '600' },
  saveBtn: { backgroundColor: C.primary },
  saveBtnText: { color: C.white, fontSize: 15, fontWeight: '600' },
});