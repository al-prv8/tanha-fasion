import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView, 
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useLogin } from '../api/queries';
import { useAuthStore } from '../store/useAuthStore';
import { ChevronLeft, Lock, Mail, AlertCircle } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  
  // Zustand Store
  const setSession = useAuthStore((state) => state.setSession);

  // API hooks
  const loginMutation = useLogin();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('ইমেইল এবং পাসওয়ার্ড উভয়ই পূরণ করুন।');
      return;
    }

    try {
      const res = await loginMutation.mutateAsync({
        email: email.trim(),
        password: password.trim()
      });

      if (res && res.token && res.user) {
        setSession(res.user, res.token);
        router.replace('/profile');
      } else {
        setError('লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'ভুল ইমেইল অথবা পাসওয়ার্ড!');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" />
      
      {/* Header bar */}
      <View className="flex flex-row justify-between items-center px-4 py-3 border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100"
        >
          <ChevronLeft size={18} color="#2D2D3A" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-slate-800">অ্যাকাউন্টে প্রবেশ</Text>
        <View className="w-9 h-9" />
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1 justify-center px-6"
        >
          <View className="mb-8">
            <Text className="text-2xl font-black text-slate-800">স্বাগতম!</Text>
            <Text className="text-xs font-semibold text-slate-400 mt-1">আপনার ইমেইল ও পাসওয়ার্ড দিয়ে লগইন সম্পন্ন করুন।</Text>
          </View>

          {/* Form */}
          <View className="flex flex-col gap-4">
            {/* Input Email */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">ইমেইল ঠিকানা</Text>
              <View className="relative flex flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <Mail size={14} color="#737380" className="mr-2" />
                <TextInput 
                  placeholder="name@email.com" 
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </View>
            </View>

            {/* Input Password */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">পাসওয়ার্ড</Text>
              <View className="relative flex flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <Lock size={14} color="#737380" className="mr-2" />
                <TextInput 
                  placeholder="******" 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  className="flex-1 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </View>
            </View>

            {/* Error Message */}
            {error ? (
              <View className="flex flex-row items-center gap-1.5 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                <AlertCircle size={14} color="#EF4444" />
                <Text className="text-xs text-rose-600 font-bold flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity 
              onPress={handleLogin}
              disabled={loginMutation.isPending}
              className="bg-slate-900 py-3.5 rounded-2xl flex items-center justify-center mt-4 active:bg-slate-800 disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-xs font-black text-white">লগইন</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <TouchableOpacity 
              onPress={() => router.replace('/register')}
              className="mt-2.5 flex items-center"
            >
              <Text className="text-xs font-semibold text-slate-450">
                নতুন অ্যাকাউন্ট তৈরি করতে চান? <Text className="text-primary font-black">নিবন্ধন করুন</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
