import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/useAuthStore';
import { useMyOrders } from '../api/queries';
import { User, LogOut, FileText, ShoppingBag, MapPin, Phone, Mail } from 'lucide-react-native';

const toBanglaDigits = (num: number | string) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (digit) => banglaDigits[parseInt(digit)]);
};

const translateStatus = (status: string) => {
  const map: Record<string, string> = {
    'PENDING': 'মুলতুবি',
    'PROCESSING': 'প্রক্রিয়াধীন',
    'SHIPPED': 'শিপড',
    'DELIVERED': 'ডেলিভারি সম্পন্ন',
    'CANCELLED': 'বাতিল',
  };
  return map[status] || status;
};

export default function ProfileScreen() {
  const router = useRouter();
  
  // Zustand Store
  const { user, clearSession, isAuthenticated } = useAuthStore();
  const loggedIn = isAuthenticated();

  // Query past orders
  const { data: orders, isLoading: isOrdersLoading } = useMyOrders();

  const handleLogout = () => {
    clearSession();
    router.replace('/');
  };

  if (!loggedIn) {
    return (
      <SafeAreaView className="flex-1 bg-white justify-center items-center p-6">
        <StatusBar barStyle="dark-content" />
        
        <View className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
          <User size={24} color="#DDA94E" />
        </View>

        <Text className="text-sm font-black text-slate-800">অ্যাকাউন্টে প্রবেশ করুন</Text>
        <Text className="text-[11px] text-slate-400 text-center mt-1 font-semibold max-w-[220px]">
          আপনার প্রোফাইল তথ্য এবং অর্ডারের ট্র্যাকিং দেখতে লগইন করুন।
        </Text>

        <View className="w-full flex flex-col gap-3 mt-8">
          <TouchableOpacity 
            onPress={() => router.push('/login')}
            className="bg-slate-900 py-3.5 rounded-2xl flex items-center justify-center active:bg-slate-800"
          >
            <Text className="text-xs font-black text-white">লগইন করুন</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => router.push('/register')}
            className="border border-slate-200 py-3.5 rounded-2xl flex items-center justify-center active:bg-slate-50"
          >
            <Text className="text-xs font-black text-slate-700">নতুন অ্যাকাউন্ট তৈরি করুন</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-slate-50/50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View className="flex flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-100">
        <Text className="text-sm font-black text-slate-800">গ্রাহক প্রোফাইল</Text>
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex flex-row items-center gap-1 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100"
        >
          <LogOut size={12} color="#EF4444" />
          <Text className="text-[10px] font-black text-rose-600">লগআউট</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4 py-3" showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View className="bg-white border border-slate-100 rounded-3xl p-4 shadow-3xs mb-4 flex flex-row items-center gap-4">
          <View className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
            <User size={22} color="#DDA94E" />
          </View>
          <View className="flex-1 min-w-0">
            <Text className="text-sm font-black text-slate-800">{user?.name}</Text>
            <Text className="text-[10px] text-slate-400 font-semibold mt-0.5">{user?.email}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View className="bg-white border border-slate-100 rounded-3xl p-4 shadow-3xs mb-4 flex flex-col gap-3">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">যোগাযোগ ও ঠিকানা</Text>
          
          {user?.phone ? (
            <View className="flex flex-row items-center gap-2.5">
              <Phone size={12} color="#737380" />
              <Text className="text-xs font-semibold text-slate-700">{toBanglaDigits(user.phone)}</Text>
            </View>
          ) : null}

          {user?.address ? (
            <View className="flex flex-row items-start gap-2.5">
              <MapPin size={12} color="#737380" className="mt-0.5" />
              <Text className="text-xs font-semibold text-slate-700 flex-1">{user.address}, {user.city}</Text>
            </View>
          ) : null}
        </View>

        {/* Order History */}
        <View className="mb-8">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1">আপনার অর্ডার সমূহ (Order History)</Text>

          {isOrdersLoading ? (
            <ActivityIndicator size="small" color="#DDA94E" className="my-8" />
          ) : !orders || orders.length === 0 ? (
            <View className="bg-white border border-slate-100 rounded-3xl p-8 items-center">
              <FileText size={24} color="#B0B4BA" />
              <Text className="text-[11px] font-semibold text-slate-450 mt-2">এখনো কোনো অর্ডার করা হয়নি।</Text>
            </View>
          ) : (
            orders.map((order: any) => (
              <View 
                key={order.id}
                className="bg-white border border-slate-100 rounded-2xl p-4 mb-3 shadow-3xs"
              >
                <View className="flex flex-row justify-between items-center pb-2.5 border-b border-slate-50">
                  <View>
                    <Text className="text-[10px] text-slate-400 font-bold">অর্ডার#</Text>
                    <Text className="text-xs font-black text-slate-800 mt-0.5">{order.orderNumber}</Text>
                  </View>
                  <View className="bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    <Text className="text-[9px] font-black text-primary uppercase">{translateStatus(order.status)}</Text>
                  </View>
                </View>

                <View className="flex flex-row justify-between items-center pt-2.5">
                  <Text className="text-[10px] text-slate-400 font-bold">
                    তারিখ: {new Date(order.createdAt).toLocaleDateString('en-GB')}
                  </Text>
                  <Text className="text-xs font-black text-slate-800">
                    বিল: ৳{toBanglaDigits(order.grandTotal)}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
