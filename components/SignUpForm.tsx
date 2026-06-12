import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';

export default function SignUpForm({ onRegister }: { onRegister: () => void }) {
  const [accountType, setAccountType] = useState<'customer' | 'vendor'>('customer');

  // Helper component to keep the massive vendor form clean
  const FormInput = ({ label, placeholder, flex = undefined }: any) => (
    <View style={[styles.inputGroup, flex && { flex }]}>
      <Text style={styles.label}>{label} *</Text>
      <TextInput style={styles.input} placeholder={placeholder} placeholderTextColor={C.subtext} />
    </View>
  );

  return (
    <View style={styles.formContainer}>
      
      <FormInput label="Email" placeholder="Email" />

      {/* Renders the massive vendor block only if the vendor radio is selected */}
      {accountType === 'vendor' && (
        <View style={styles.vendorBlock}>
          <FormInput label="First Name" placeholder="First Name" />
          <FormInput label="Last Name" placeholder="Last Name" />
          <FormInput label="Shop Name" placeholder="Shop Name" />
          <FormInput label="Street Address" placeholder="Street Address" />
          
          <View style={styles.row}>
            <FormInput label="City" placeholder="City" flex={1} />
            <View style={{ width: 16 }} />
            <FormInput label="Postal/Zip Code" placeholder="000000" flex={1} />
          </View>

          <FormInput label="County" placeholder="County" />
          <FormInput label="Country" placeholder="Kenya" />
          <FormInput label="Phone Number" placeholder="Phone number" />
        </View>
      )}

      {/* Account Type Selector (Radio Buttons) */}
      <View style={styles.radioRow}>
        <TouchableOpacity 
          style={styles.radioBtn} 
          onPress={() => setAccountType('customer')}
          activeOpacity={0.7}
        >
          <Icon 
            source={accountType === 'customer' ? "check-circle" : "circle-outline"} 
            size={22} 
            color={accountType === 'customer' ? "#000000" : C.subtext} 
          />
          <Text style={styles.radioText}>Customer account</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.radioBtn} 
          onPress={() => setAccountType('vendor')}
          activeOpacity={0.7}
        >
          <Icon 
            source={accountType === 'vendor' ? "check-circle" : "circle-outline"} 
            size={22} 
            color={accountType === 'vendor' ? "#000000" : C.subtext} 
          />
          <Text style={styles.radioText}>Vendor account</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.privacyText}>
        Your personal data will be used to support your experience throughout this website, 
        to manage access to your account, and for other purposes described in our <Text style={styles.privacyLink}>privacy policy.</Text>
      </Text>

      {/* Register Button (Outlined) */}
      <TouchableOpacity style={styles.submitBtn} onPress={onRegister} activeOpacity={0.7}>
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
  vendorBlock: { marginTop: 4 },
  row: { flexDirection: 'row' },
  
  radioRow: { flexDirection: 'row', gap: 24, marginBottom: 20, marginTop: 8 },
  radioBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioText: { fontSize: 14, color: C.text },
  
  privacyText: { fontSize: 13, color: C.subtext, lineHeight: 20, marginBottom: 24 },
  privacyLink: { fontWeight: '700', color: C.text, textDecorationLine: 'underline' },
  
  submitBtn: {
    height: 52, borderRadius: 26,
    borderWidth: 1.5, borderColor: '#1C4A3A',
    alignItems: 'center', justifyContent: 'center',
  },
  submitBtnText: { color: '#1C4A3A', fontSize: 16, fontWeight: '600' },
});