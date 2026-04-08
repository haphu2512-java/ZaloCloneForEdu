import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, ActivityIndicator, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { verifyEmail } from '../../utils/authService';
import { useAuth } from '../../context/auth';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [token, setToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already verified, show success
  if (user?.isEmailVerified) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <Ionicons name="checkmark-circle" size={80} color="#10B981" />
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>Đã xác thực!</Text>
        <Text style={{ color: '#64748B', marginTop: 8 }}>Tài khoản của bạn đã được xác thực.</Text>
        <TouchableOpacity
          onPress={() => router.navigate('/(tabs)')}
          style={{ marginTop: 32, backgroundColor: '#2563EB', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Về trang chủ</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã xác thực');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await verifyEmail(token.trim());
      Alert.alert('Thành công', 'Email đã được xác thực!');
      await refreshUser(); // Update context
      router.navigate('/(tabs)');
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 24 }}>
          {/* Header */}
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24, marginTop: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#0F172A" />
          </TouchableOpacity>
          
          <Text style={{ fontSize: 32, fontWeight: '800', color: '#0F172A', marginBottom: 8 }}>Xác thực Email</Text>
          <Text style={{ color: '#64748B', fontSize: 16, marginBottom: 32 }}>
            Vui lòng nhập mã xác thực đã được gửi tới email của bạn.
          </Text>

          {/* Token Field */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC',
            borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, marginBottom: 24
          }}>
            <Ionicons name="shield-checkmark-outline" size={22} color="#64748B" />
            <TextInput
              placeholder="Nhập mã xác thực"
              placeholderTextColor="#94A3B8"
              style={{ flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A' }}
              autoCapitalize="none"
              value={token}
              onChangeText={setToken}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isSubmitting}
            style={{
              backgroundColor: isSubmitting ? '#93C5FD' : '#2563EB',
              paddingVertical: 18, borderRadius: 16, alignItems: 'center'
            }}
          >
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Xác thực ngay</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
