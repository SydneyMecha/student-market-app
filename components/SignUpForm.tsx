import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme'; // Adjust path as needed

interface SignUpFormProps {
  onRegister: (email: string) => void;
}

// Local helper component to render inputs cleanly with custom helper texts
interface FormInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  helperText?: string;
  flex?: number;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
}

const FormInput = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  helperText,
  flex, 
  keyboardType = 'default' 
}: FormInputProps) => (
  <View style={[styles.inputGroup, flex !== undefined ? { flex } : undefined]}>
    <Text style={styles.label}>{label}</Text>
    <TextInput 
      style={styles.input} 
      placeholder={placeholder} 
      placeholderTextColor={C.subtext} 
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
    />
    {helperText && <Text style={styles.helperText}>{helperText}</Text>}
  </View>
);

export default function SignUpForm({ onRegister }: SignUpFormProps) {
  const [accountType, setAccountType] = useState<'customer' | 'vendor'>('customer');
  
  // Registration Form States
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [shopName, setShopName] = useState('');
  const [shopUrl, setShopUrl] = useState('');
  const [street1, setStreet1] = useState('');
  const [street2, setStreet2] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('Kenya');
  const [state, setState] = useState('');
  const [phone, setPhone] = useState('');

  // Auto-slugify Shop Name into a clean URL slug (e.g. "My Shop!" to "my-shop")
  const handleShopNameChange = (text: string) => {
    setShopName(text);
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')         // Replace spaces with dashes
      .replace(/-+/g, '-');        // Collapse consecutive dashes
    setShopUrl(slug);
  };

  return (
    <View style={styles.formContainer}>
      
      {/* Email Input Field */}
      <FormInput 
        label="Email address *" 
        placeholder="Email address" 
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        helperText="A link to set a new password will be sent to your email address."
      />

      {/* Renders the complete dynamic Dokan vendor fields only if Vendor mode is checked */}
      {accountType === 'vendor' && (
        <View style={styles.vendorBlock}>
          
          <FormInput 
            label="First Name *" 
            placeholder="First Name" 
            value={firstName} 
            onChangeText={setFirstName} 
          />
          
          <FormInput 
            label="Last Name *" 
            placeholder="Last Name" 
            value={lastName} 
            onChangeText={setLastName} 
          />
          
          <FormInput 
            label="Shop Name *" 
            placeholder="Shop Name" 
            value={shopName} 
            onChangeText={handleShopNameChange} // Triggers auto-slugifier
          />

          <FormInput 
            label="Shop URL *" 
            placeholder="shop-url" 
            value={shopUrl} 
            onChangeText={setShopUrl} 
            helperText={`https://studentmarket.co.ke/vendor/${shopUrl || '[shop-url]'}`}
          />

          <FormInput 
            label="Street *" 
            placeholder="Street address" 
            value={street1} 
            onChangeText={setStreet1} 
          />

          <FormInput 
            label="Street 2 (optional)" 
            placeholder="Apartment, suite, unit etc. (optional)" 
            value={street2} 
            onChangeText={setStreet2} 
          />
          
          <View style={styles.row}>
            <FormInput 
              label="City *" 
              placeholder="Town / City" 
              flex={1} 
              value={city} 
              onChangeText={setCity} 
            />
            <View style={{ width: 16 }} />
            <FormInput 
              label="Post/ZIP Code *" 
              placeholder="Postcode / Zip" 
              flex={1} 
              value={zipCode} 
              onChangeText={setZipCode} 
              keyboardType="phone-pad" 
            />
          </View>

          <FormInput 
            label="Country *" 
            placeholder="Kenya"
            value={country} 
            onChangeText={setCountry} 
          />

          <FormInput 
            label="County" 
            placeholder="County" 
            value={state} 
            onChangeText={setState} 
          />

          <FormInput 
            label="Phone Number *" 
            placeholder="Phone number" 
            value={phone} 
            onChangeText={setPhone} 
            keyboardType="phone-pad" 
          />
        </View>
      )}

      {/* Account Type Selector (Dokan Web Radio Buttons) */}
      <View style={styles.radioRow}>
        <TouchableOpacity 
          style={styles.radioBtn} 
          onPress={() => setAccountType('customer')}
          activeOpacity={0.7}
        >
          <Icon 
            source={accountType === 'customer' ? "radiobox-marked" : "radiobox-blank"} 
            size={22} 
            color={accountType === 'customer' ? C.primary : C.subtext} 
          />
          <Text style={styles.radioText}>I am a customer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.radioBtn} 
          onPress={() => setAccountType('vendor')}
          activeOpacity={0.7}
        >
          <Icon 
            source={accountType === 'vendor' ? "radiobox-marked" : "radiobox-blank"} 
            size={22} 
            color={accountType === 'vendor' ? C.primary : C.subtext} 
          />
          <Text style={styles.radioText}>I am a vendor</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.privacyText}>
        Your personal data will be used to support your experience throughout this website, 
        to manage access to your account, and for other purposes described in our <Text style={styles.privacyLink}>privacy policy.</Text>
      </Text>

      {/* Register Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={() => onRegister(email)} activeOpacity={0.7}>
        <Text style={styles.submitBtnText}>Register</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { paddingTop: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  input: {
    fontSize: 14, color: C.text, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#D1D5DB',
  },
  helperText: {
    fontSize: 11,
    color: C.subtext,
    marginTop: 6,
    lineHeight: 16,
  },
  vendorBlock: { marginTop: 4 },
  row: { flexDirection: 'row' },
  
  radioRow: { flexDirection: 'column', gap: 16, marginBottom: 24, marginTop: 8 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioText: { fontSize: 14, color: C.text, fontWeight: '500' },
  
  privacyText: { fontSize: 13, color: C.subtext, lineHeight: 20, marginBottom: 24 },
  privacyLink: { fontWeight: '700', color: C.text, textDecorationLine: 'underline' },
  
  submitBtn: {
    height: 52, borderRadius: 26,
    backgroundColor: '#1C4A3A',
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { color: C.white, fontSize: 16, fontWeight: '600' },
});