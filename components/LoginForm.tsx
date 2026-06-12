import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import { C } from '../styles/theme';

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <View style={styles.formContainer}>
      
      {/* Email Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="johndoe@gmail.com"
          placeholderTextColor={C.subtext}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
          <TextInput
            style={styles.passwordInput}
            placeholder="********"
            placeholderTextColor={C.subtext}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Icon source={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={C.subtext} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Options Row */}
      <View style={styles.optionsRow}>
        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setRememberMe(!rememberMe)}
          activeOpacity={0.7}
        >
          <Icon 
            source={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} 
            size={20} 
            color={rememberMe ? "#1C4A3A" : C.subtext} 
          />
          <Text style={styles.rememberText}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.forgotText}>Lost your password?</Text>
        </TouchableOpacity>
      </View>

      {/* Log In Button */}
      <TouchableOpacity style={styles.submitBtn} onPress={onLogin} activeOpacity={0.9}>
        <Text style={styles.submitBtnText}>Log In</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  formContainer: { paddingTop: 8 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 8 },
  input: {
    fontSize: 14,
    color: C.text,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 8,
  },
  passwordInput: { flex: 1, fontSize: 14, color: C.text, paddingVertical: 0 },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rememberText: { fontSize: 13, color: C.text },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#1C4A3A' },
  submitBtn: {
    backgroundColor: '#1C4A3A',
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});