import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  FlatList,
  Dimensions,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useProducts, useCategories } from '../api/queries';
import { useCartStore } from '../store/useCartStore';
import { API_BASE_URL } from '../api/apiClient';
import { formatBanglaPriceWithCommas, toBanglaNumber } from '../utils/format';
import { ShoppingCart, Search, Flame, ArrowRight, Tag } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Local helpers for Bangla translations
const translateCategory = (cat: string) => {
  const map: Record<string, string> = {
    'ALL': 'সব পোশাক',
    'Three Piece': 'থ্রি-পিস',
    'Kurti': 'কুর্তি',
    'Panjabi': 'পাঞ্জাবি',
    'Lungi': 'লুঙ্গি',
  };
  return map[cat] || cat;
};

const toBanglaDigits = (num: number | string) => {
  const banglaDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toString().replace(/\d/g, (digit) => banglaDigits[parseInt(digit)]);
};

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  
  // Zustand Store
  const addToCart = useCartStore((state) => state.addToCart);
  const cartCount = useCartStore((state) => state.getTotals().cartCount);

  // Queries
  const { data: products, isLoading: isProductsLoading, error: productsError, refetch: refetchProducts } = useProducts(selectedCategory);
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();

  const handleProductPress = (id: string) => {
    router.push(`/product/${id}`);
  };

  const renderProductItem = ({ item }: { item: any }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => handleProductPress(item.id)}
        className="w-[47%] bg-white rounded-2xl mb-4 overflow-hidden border border-slate-100 shadow-3xs"
      >
        <View className="relative aspect-[3/4] w-full bg-slate-50">
          <Image 
            source={item.imgUrl || "https://images.unsplash.com/photo-1596783074918-c84cb06531ca?w=500"} 
            className="w-full h-full object-cover"
            contentFit="cover"
            transition={300}
          />
          {item.tag && (
            <View className="absolute top-2 left-2 bg-primary px-2 py-0.5 rounded-full flex flex-row items-center gap-0.5">
              <Tag size={8} color="white" />
              <Text className="text-[8px] font-bold text-white uppercase">{item.tag}</Text>
            </View>
          )}
        </View>
        <View className="p-3">
          <Text className="text-[10px] font-bold text-primary uppercase tracking-wider">{translateCategory(item.category)}</Text>
          <Text className="text-xs font-black text-slate-800 mt-0.5 h-8" numberOfLines={2}>{item.name}</Text>
          
          <View className="flex flex-row items-center justify-between mt-2.5">
            <Text className="text-sm font-black text-slate-900">৳{toBanglaDigits(item.price)}</Text>
            <TouchableOpacity 
              onPress={() => addToCart(item, 1, 'M')}
              className="bg-primary px-2.5 py-1.5 rounded-xl active:scale-95"
            >
              <Text className="text-[10px] font-bold text-slate-900">কিনুন</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50/50">
      <StatusBar barStyle="dark-content" />
      
      {/* Header bar */}
      <View className="flex flex-row justify-between items-center px-4 py-3 bg-white border-b border-slate-100">
        <View>
          <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">TANHA FASHION</Text>
          <Text className="text-lg font-black text-slate-800">তানহা ফ্যাশন</Text>
        </View>
        <TouchableOpacity 
          onPress={() => router.push('/cart')}
          className="relative w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100"
        >
          <ShoppingCart size={18} color="#2D2D3A" />
          {cartCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-primary w-5 h-5 rounded-full flex items-center justify-center border border-white">
              <Text className="text-[9px] font-black text-slate-900">{toBanglaDigits(cartCount)}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
        {/* Banner Section */}
        <View className="p-4">
          <View className="bg-slate-900 rounded-3xl overflow-hidden p-6 relative flex flex-row items-center justify-between min-h-[140px] border border-white/5">
            <View className="flex-1 pr-4 z-10">
              <View className="flex flex-row items-center gap-1.5 bg-primary/20 px-2 py-1 rounded-full w-24">
                <Flame size={12} color="#DDA94E" />
                <Text className="text-[8px] font-bold text-primary">নতুন কালেকশন</Text>
              </View>
              <Text className="text-xl font-black text-white mt-2.5 leading-tight">বসুন্ধরা শোরুমের সব জনপ্রিয় পোশাক এখন আপনার হাতের মুঠোয়!</Text>
              <Text className="text-[10px] text-slate-400 font-semibold mt-1">সরাসরি ক্যাশ অন ডেলিভারিতে অর্ডার করুন</Text>
            </View>
            <Image 
              source="https://images.unsplash.com/photo-1617137968427-85924c800a22?w=500" 
              className="absolute right-0 top-0 bottom-0 w-2/5 opacity-50"
              contentFit="cover"
            />
          </View>
        </View>

        {/* Categories Selector */}
        <View className="py-2">
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            <TouchableOpacity 
              onPress={() => setSelectedCategory('ALL')}
              className={`px-4 py-2 rounded-xl mr-2 border ${
                selectedCategory === 'ALL' 
                  ? 'bg-primary border-primary' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <Text className={`text-xs font-bold ${
                selectedCategory === 'ALL' ? 'text-slate-900' : 'text-slate-600'
              }`}>সব পোশাক</Text>
            </TouchableOpacity>

            {categories && categories.map((cat: any) => (
              <TouchableOpacity 
                key={cat.id || cat.name}
                onPress={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2 rounded-xl mr-2 border ${
                  selectedCategory === cat.name 
                    ? 'bg-primary border-primary' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <Text className={`text-xs font-bold ${
                  selectedCategory === cat.name ? 'text-slate-900' : 'text-slate-600'
                }`}>{translateCategory(cat.name)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Products Grid */}
        <View className="px-4 py-2">
          <Text className="text-sm font-black text-slate-800 mb-3 flex flex-row items-center justify-between">
            জনপ্রিয় পোশাক সমূহ
          </Text>

          {isProductsLoading ? (
            <View className="py-20 flex items-center justify-center">
              <ActivityIndicator size="small" color="#DDA94E" />
              <Text className="text-xs text-slate-400 mt-2 font-semibold">লোডিং হচ্ছে...</Text>
              <Text className="text-[9px] text-slate-400 mt-1 font-mono font-bold">API: {API_BASE_URL}</Text>
            </View>
          ) : productsError ? (
            <View className="py-12 flex items-center justify-center px-4">
              <Text className="text-xs text-rose-500 font-bold text-center">সার্ভারের সাথে সংযোগ স্থাপন করা যায়নি!</Text>
              <Text className="text-[10px] text-slate-450 text-center mt-1">দয়া করে নিশ্চিত করুন আপনার ল্যাপটপ এবং মোবাইল একই ওয়াই-ফাই নেটওয়ার্কে যুক্ত আছে।</Text>
              <Text className="text-[9px] text-slate-400 mt-2.5 font-mono font-bold">টার্গেট API: {API_BASE_URL}</Text>
              <Text className="text-[8px] text-rose-400 mt-1 font-mono text-center">{String((productsError as any).message || productsError)}</Text>
              <TouchableOpacity 
                onPress={() => refetchProducts()}
                className="mt-4 bg-slate-900 px-5 py-2.5 rounded-xl active:bg-slate-800"
              >
                <Text className="text-[10px] font-black text-white">পুনরায় চেষ্টা করুন</Text>
              </TouchableOpacity>
            </View>
          ) : !products || products.length === 0 ? (
            <View className="py-20 flex items-center justify-center">
              <Text className="text-xs text-slate-400 font-semibold">কোনো পোশাক পাওয়া যায়নি।</Text>
            </View>
          ) : (
            <View className="flex flex-row flex-wrap justify-between">
              {products.map((item: any) => (
                <React.Fragment key={item.id}>
                  {renderProductItem({ item })}
                </React.Fragment>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
