import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import { useRouter } from 'expo-router';
import { useCartStore } from '../store/useCartStore';
import { useCreateOrder } from '../api/queries';
import { ChevronLeft, ShoppingBag, CheckCircle, MapPin, Phone, User, Info, DollarSign } from 'lucide-react-native';

const toBanglaDigits = (num: number | string) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (digit) => banglaDigits[parseInt(digit)]);
};

export default function CheckoutScreen() {
  const router = useRouter();

  // Zustand Store
  const { items, appliedCouponDetails, clearCart, getTotals } = useCartStore();
  const { subtotal, discount, grandTotal: cartGrandTotal } = getTotals();

  // Create order hook
  const createOrderMutation = useCreateOrder();

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'inside' | 'outside'>('inside');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Success screen states
  const [createdOrderNumber, setCreatedOrderNumber] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const shippingCost = shippingMethod === 'inside' ? 80 : 150;
  const finalGrandTotal = cartGrandTotal + shippingCost;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'নাম লিখতে হবে';
    if (!phone.trim()) {
      newErrors.phone = 'মোবাইল নম্বর লিখতে হবে';
    } else if (!/^(\+?88)?01[3-9]\d{8}$/.test(phone.trim())) {
      newErrors.phone = 'সঠিক মোবাইল নম্বর লিখুন (যেমন: ০১৮৬৩৬৯৪০২৭)';
    }
    if (!address.trim()) newErrors.address = 'পূর্ণাঙ্গ ঠিকানা লিখতে হবে';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) return;

    const backendItems = items.map(item => ({
      id: item.id,
      size: item.size,
      quantity: item.quantity,
      price: item.price
    }));

    const payload = {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      address: address.trim(),
      city: shippingMethod === 'inside' ? 'Dhaka' : 'Outside Dhaka',
      postcode: postcode.trim() || '১০০০',
      paymentMethod: 'cod',
      shippingMethod,
      trxId: null,
      items: backendItems,
      discount: discount
    };

    try {
      const res = await createOrderMutation.mutateAsync(payload);
      if (res && res.orderNumber) {
        setCreatedOrderNumber(res.orderNumber);
        setShowSuccessModal(true);
        clearCart();
      } else {
        alert('অর্ডার সম্পন্ন করতে সমস্যা হয়েছে!');
      }
    } catch (e: any) {
      console.error(e);
      alert(e.response?.data?.error || 'অর্ডার সম্পন্ন করা যায়নি। পুনরায় চেষ্টা করুন।');
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    router.replace('/');
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50/50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header bar */}
      <View className="flex flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-100">
        <TouchableOpacity 
          onPress={() => router.back()}
          className="w-9 h-9 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100"
        >
          <ChevronLeft size={18} color="#2D2D3A" />
        </TouchableOpacity>
        <Text className="text-sm font-black text-slate-800">অর্ডার সাবমিট (Checkout)</Text>
        <View className="w-9 h-9" />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
          {/* Shipping Form Card */}
          <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-3xs mt-2">
            <Text className="text-xs font-black text-slate-800 uppercase mb-4 flex flex-row items-center gap-1">
              <MapPin size={12} color="#DDA94E" />
              ডেলিভারি ঠিকানা ও তথ্য (Delivery details)
            </Text>

            {/* Input Name */}
            <View className="mb-3.5">
              <Text className="text-[10px] font-black text-slate-500 mb-1">গ্রাহকের নাম *</Text>
              <TextInput 
                placeholder="আপনার পূর্ণ নাম লিখুন" 
                value={name}
                onChangeText={setName}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary ${
                  errors.name ? 'border-rose-300' : 'border-slate-100'
                }`}
              />
              {errors.name ? <Text className="text-[9px] text-rose-500 font-bold mt-1">{errors.name}</Text> : null}
            </View>

            {/* Input Phone */}
            <View className="mb-3.5">
              <Text className="text-[10px] font-black text-slate-500 mb-1">মোবাইল নম্বর *</Text>
              <TextInput 
                placeholder="১১ ডিজিটের মোবাইল নম্বর" 
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary ${
                  errors.phone ? 'border-rose-300' : 'border-slate-100'
                }`}
              />
              {errors.phone ? <Text className="text-[9px] text-rose-500 font-bold mt-1">{errors.phone}</Text> : null}
            </View>

            {/* Input Email (Optional) */}
            <View className="mb-3.5">
              <Text className="text-[10px] font-black text-slate-500 mb-1">ইমেইল (ঐচ্ছিক)</Text>
              <TextInput 
                placeholder="ইমেইল ঠিকানা লিখুন" 
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary"
              />
            </View>

            {/* Shipping Area Selector */}
            <View className="mb-4">
              <Text className="text-[10px] font-black text-slate-500 mb-2">ডেলিভারি এরিয়া *</Text>
              <View className="flex flex-row gap-2">
                <TouchableOpacity 
                  onPress={() => setShippingMethod('inside')}
                  className={`flex-1 border p-3 rounded-xl flex items-center justify-center ${
                    shippingMethod === 'inside' 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-black ${
                    shippingMethod === 'inside' ? 'text-primary' : 'text-slate-600'
                  }`}>ঢাকার ভিতরে (৳৮০)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => setShippingMethod('outside')}
                  className={`flex-1 border p-3 rounded-xl flex items-center justify-center ${
                    shippingMethod === 'outside' 
                      ? 'bg-primary/5 border-primary' 
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text className={`text-xs font-black ${
                    shippingMethod === 'outside' ? 'text-primary' : 'text-slate-600'
                  }`}>ঢাকার বাইরে (৳১৫০)</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Input Address */}
            <View className="mb-3.5">
              <Text className="text-[10px] font-black text-slate-500 mb-1">পূর্ণ ঠিকানা (গ্রাম, থানা, জেলা) *</Text>
              <TextInput 
                placeholder="আপনার পূর্ণ ঠিকানা লিখুন" 
                value={address}
                onChangeText={setAddress}
                multiline
                numberOfLines={3}
                className={`w-full bg-slate-50 border rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:border-primary h-16 ${
                  errors.address ? 'border-rose-300' : 'border-slate-100'
                }`}
              />
              {errors.address ? <Text className="text-[9px] text-rose-500 font-bold mt-1">{errors.address}</Text> : null}
            </View>
          </View>

          {/* Payment Method Card */}
          <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-3xs">
            <Text className="text-xs font-black text-slate-800 uppercase mb-3 flex flex-row items-center gap-1">
              <DollarSign size={12} color="#DDA94E" />
              পেমেন্ট মেথড (Payment Method)
            </Text>
            
            <View className="bg-primary/5 border border-primary/20 p-3.5 rounded-2xl flex flex-row items-center justify-between">
              <View>
                <Text className="text-xs font-black text-slate-800">ক্যাশ অন ডেলিভারি (Cash on Delivery)</Text>
                <Text className="text-[9px] text-slate-500 font-semibold mt-0.5">পণ্য হাতে পেয়ে মূল্য পরিশোধ করুন।</Text>
              </View>
              <View className="w-5 h-5 bg-primary/25 rounded-full border border-primary flex items-center justify-center">
                <View className="w-2.5 h-2.5 bg-primary rounded-full" />
              </View>
            </View>
          </View>

          {/* Bill Summary Card */}
          <View className="bg-white border border-slate-100 rounded-2xl p-4 mb-8 shadow-3xs flex flex-col gap-2.5">
            <Text className="text-xs font-black text-slate-800 uppercase mb-1">বিল তথ্য (Final Invoice)</Text>
            
            <View className="flex flex-row justify-between">
              <Text className="text-xs font-bold text-slate-500">উপ-মোট (Subtotal):</Text>
              <Text className="text-xs font-bold text-slate-800">৳{toBanglaDigits(subtotal)}</Text>
            </View>

            {discount > 0 ? (
              <View className="flex flex-row justify-between">
                <Text className="text-xs font-bold text-rose-500">ছাড় (Discount):</Text>
                <Text className="text-xs font-bold text-rose-600">-৳{toBanglaDigits(discount)}</Text>
              </View>
            ) : null}

            <View className="flex flex-row justify-between">
              <Text className="text-xs font-bold text-slate-500">ডেলিভারি ফি (Delivery Charge):</Text>
              <Text className="text-xs font-bold text-slate-800">৳{toBanglaDigits(shippingCost)}</Text>
            </View>

            <View className="h-px bg-slate-100 my-1" />

            <View className="flex flex-row justify-between items-center">
              <Text className="text-sm font-black text-slate-800">সর্বমোট প্রদেয় বিল:</Text>
              <Text className="text-sm font-black text-primary">৳{toBanglaDigits(finalGrandTotal)}</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Place Order CTA Button */}
      <View className="p-4 border-t border-slate-100 bg-white shadow-md">
        <TouchableOpacity 
          onPress={handlePlaceOrder}
          disabled={createOrderMutation.isPending}
          className="w-full bg-green-600 py-3.5 rounded-2xl flex items-center justify-center active:bg-green-700 disabled:opacity-50"
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-xs font-black text-white">অর্ডার সম্পন্ন করুন</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SUCCESS POPUP MODAL */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
      >
        <View className="flex-1 bg-black/60 justify-center items-center p-6">
          <View className="bg-white rounded-3xl p-6 items-center w-full max-w-sm shadow-2xl">
            <CheckCircle size={52} color="#10B981" />
            
            <Text className="text-lg font-black text-slate-800 mt-4">অর্ডার সফল হয়েছে!</Text>
            <Text className="text-xs font-semibold text-slate-500 text-center mt-1.5 px-2">
              আপনার পছন্দকৃত পোশাকটির অর্ডার সফলভাবে রেকর্ড করা হয়েছে। আমাদের কুরিয়ার টিম শীঘ্রই আপনার সাথে যোগাযোগ করবে।
            </Text>

            <View className="bg-slate-50 border border-slate-100 p-3 rounded-2xl my-5 w-full flex items-center">
              <Text className="text-[10px] text-slate-400 font-bold">অর্ডার নম্বর (Order#)</Text>
              <Text className="text-sm font-black text-slate-850 mt-0.5">{createdOrderNumber}</Text>
            </View>

            <TouchableOpacity 
              onPress={handleSuccessClose}
              className="w-full bg-slate-900 py-3 rounded-xl flex items-center justify-center active:bg-slate-800"
            >
              <Text className="text-xs font-black text-white">কেনাকাটা শেষ করুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
