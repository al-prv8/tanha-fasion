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
  ScrollView,
  Keyboard
} from 'react-native';
import { useRouter } from 'expo-router';
import { useRegister } from '../api/queries';
import { ChevronLeft, Lock, Mail, User, Phone, MapPin, AlertCircle } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  
  // API hooks
  const registerMutation = useRegister();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async () => {
    setError('');
    setSuccess(false);

    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      setError('অনুগ্রহ করে তারকাচিহ্নিত (*) সব ঘর পূরণ করুন।');
      return;
    }

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim(),
        address: address.trim(),
        city: city.trim(),
        postcode: '1000'
      });

      setSuccess(true);
      setTimeout(() => {
        router.replace('/login');
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'নিবন্ধন ব্যর্থ হয়েছে। সঠিক তথ্য প্রদান করুন।');
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
        <Text className="text-sm font-black text-slate-800">অ্যাকাউন্ট নিবন্ধন</Text>
        <View className="w-9 h-9" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1 px-6" 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          <View className="mb-6">
            <Text className="text-2xl font-black text-slate-800">নতুন অ্যাকাউন্ট</Text>
            <Text className="text-xs font-semibold text-slate-400 mt-1">তানহা ফ্যাশনে আজই নিবন্ধিত হয়ে সুবিধাজনক কেনাকাটা করুন।</Text>
          </View>

          {/* Form */}
          <View className="flex flex-col gap-4">
            {/* Input Name */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">আপনার নাম *</Text>
              <View className="relative flex flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <User size={14} color="#737380" className="mr-2" />
                <TextInput 
                  placeholder="সম্পূর্ণ নাম লিখুন" 
                  value={name}
                  onChangeText={setName}
                  className="flex-1 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </View>
            </View>

            {/* Input Email */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">ইমেইল ঠিকানা *</Text>
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

            {/* Input Phone */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">মোবাইল নম্বর *</Text>
              <View className="relative flex flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <Phone size={14} color="#737380" className="mr-2" />
                <TextInput 
                  placeholder="যেমন: ০১XXXXXXXXX" 
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  className="flex-1 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </View>
            </View>

            {/* Input Password */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">পাসওয়ার্ড *</Text>
              <View className="relative flex flex-row items-center bg-slate-50 border border-slate-100 rounded-xl px-3 py-2">
                <Lock size={14} color="#737380" className="mr-2" />
                <TextInput 
                  placeholder="ন্যূনতম ৬ ডিজিটের পাসওয়ার্ড" 
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                  className="flex-1 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </View>
            </View>

            {/* Input Address */}
            <View>
              <Text className="text-[10px] font-black text-slate-500 mb-1.5 uppercase">ঠিকানা (Address)</Text>
              <View className="relative flex flex-row items-start bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 h-14">
                <MapPin size={14} color="#737380" className="mr-2 mt-0.5" />
                <TextInput 
                  placeholder="গ্রাম/শহর, থানা, জেলা" 
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  className="flex-1 text-xs font-bold text-slate-800 focus:outline-none"
                />
              </View>
            </View>

            {/* Success Message */}
            {success ? (
              <View className="flex flex-row items-center gap-1.5 bg-green-50 border border-green-100 p-3.5 rounded-xl">
                <Text className="text-xs text-green-600 font-bold flex-1">
                  নিবন্ধন সফল হয়েছে! অনুগ্রহ করে লগইন করুন...
                </Text>
              </View>
            ) : null}

            {/* Error Message */}
            {error ? (
              <View className="flex flex-row items-center gap-1.5 bg-rose-50 border border-rose-100 p-3.5 rounded-xl">
                <AlertCircle size={14} color="#EF4444" />
                <Text className="text-xs text-rose-600 font-bold flex-1">{error}</Text>
              </View>
            ) : null}

            {/* Register Button */}
            <TouchableOpacity 
              onPress={handleRegister}
              disabled={registerMutation.isPending || success}
              className="bg-slate-900 py-3.5 rounded-2xl flex items-center justify-center mt-3 active:bg-slate-800 disabled:opacity-50"
            >
              {registerMutation.isPending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-xs font-black text-white">নিবন্ধন সম্পন্ন করুন</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <TouchableOpacity 
              onPress={() => router.replace('/login')}
              className="mt-2 flex items-center"
            >
              <Text className="text-xs font-semibold text-slate-450">
                ইতোমধ্যেই অ্যাকাউন্ট আছে? <Text className="text-primary font-black">লগইন করুন</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
