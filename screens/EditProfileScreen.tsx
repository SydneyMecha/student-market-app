import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  TextInput
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Icon } from 'react-native-paper';
import { C, globalStyles } from '../styles/theme';

interface EditProfileScreenProps {
  onNavigate: (screenName: string) => void;
}

// 1. Local helper component to keep the form code DRY (Don't Repeat Yourself)
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

export default function EditProfileScreen({ onNavigate }: EditProfileScreenProps) {
  // Personal Details State
  const [firstName, setFirstName] = useState('John');
  const [lastName, setLastName] = useState('Doe');
  const [displayName, setDisplayName] = useState('John254');
  const [email, setEmail] = useState('Email');
  const [phone, setPhone] = useState('0712 345 678');

  // Shipping Address State
  const [shippingFirstName, setShippingFirstName] = useState('First Name');
  const [shippingCity, setShippingCity] = useState('City/Town');
  const [shippingEmail, setShippingEmail] = useState('Email');
  const [shippingPhone, setShippingPhone] = useState('0712 345 678');

  const handleSave = () => {
    console.log("Saving Profile Updates...");
    onNavigate('Profile'); // Return to profile on save
  };

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
        <Text style={globalStyles.headerTitle}>Edit Profile</Text>
        
        <View style={{ width: 36 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Personal Details Card */}
        <View style={[globalStyles.featuredSectionFrame, { paddingHorizontal: 16 }]}>
          <Text style={styles.sectionHeading}>Personal Details</Text>
          
          <EditableField 
            label="First Name" 
            placeholder="John" 
            value={firstName} 
            onChangeText={setFirstName} 
          />
          <EditableField 
            label="Last Name" 
            placeholder="Doe" 
            value={lastName} 
            onChangeText={setLastName} 
          />
          <EditableField 
            label="Display Name" 
            placeholder="John254" 
            value={displayName} 
            onChangeText={setDisplayName} 
            helperText="This name will be displayed in the account section and in reviews"
          />
          <EditableField 
            label="Email" 
            placeholder="Email" 
            value={email} 
            onChangeText={setEmail}
            keyboardType="email-address" 
          />
          <EditableField 
            label="Phone Number" 
            placeholder="0712 345 678" 
            value={phone} 
            onChangeText={setPhone}
            keyboardType="phone-pad" 
          />
        </View>

        {/* Shipping Address Card */}
        <View style={[globalStyles.featuredSectionFrame, { paddingHorizontal: 16 }]}>
          <Text style={styles.sectionHeading}>Shipping Address</Text>
          
          <EditableField 
            label="First Name" 
            placeholder="First Name" 
            value={shippingFirstName} 
            onChangeText={setShippingFirstName} 
          />
          <EditableField 
            label="City/Town" 
            placeholder="City/Town" 
            value={shippingCity} 
            onChangeText={setShippingCity} 
          />
          <EditableField 
            label="Email" 
            placeholder="johdohndoe@gmail.com" 
            value={shippingEmail} 
            onChangeText={setShippingEmail}
            keyboardType="email-address" 
          />
          <EditableField 
            label="Phone Number" 
            placeholder="0712 345 678" 
            value={shippingPhone} 
            onChangeText={setShippingPhone}
            keyboardType="phone-pad" 
          />
        </View>

      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.actionBtn, styles.discardBtn]} 
          onPress={() => onNavigate('Profile')}
          activeOpacity={0.7}
        >
          <Text style={styles.discardBtnText}>Discard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionBtn, styles.saveBtn]} 
          onPress={handleSave}
          activeOpacity={0.9}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  
  // Extra padding at the bottom ensures the last input field clears the sticky footer
  scrollContent: { 
    paddingBottom: 100,
  },
  
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 20,
  },

  /* Editable Field Component Styles */
  fieldContainer: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingBottom: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: C.text,
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 11,
    color: C.subtext,
    marginTop: 6,
    lineHeight: 16,
  },

  /* Sticky Bottom Action Bar Styles */
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
  actionBtn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discardBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: C.primary,
  },
  discardBtnText: {
    color: C.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  saveBtn: {
    backgroundColor: C.primary,
  },
  saveBtnText: {
    color: C.white,
    fontSize: 15,
    fontWeight: '600',
  },
});