import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';

// Fetch all products
export const useProducts = (category?: string) => {
  return useQuery({
    queryKey: ['products', category],
    queryFn: async () => {
      const url = category && category !== 'ALL'
        ? `/api/products?category=${encodeURIComponent(category)}`
        : '/api/products';
      const { data } = await apiClient.get(url);
      return data;
    },
  });
};

// Fetch single product detail
export const useProductDetail = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await apiClient.get(`/api/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Fetch categories
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/categories');
      return data;
    },
  });
};

// Validate Coupon
export const useValidateCoupon = () => {
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await apiClient.post('/api/coupons/validate', { code });
      return data;
    },
  });
};

// Place Order
export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (orderData: any) => {
      const { data } = await apiClient.post('/api/orders', orderData);
      return data;
    },
  });
};

// Login API hook
export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await apiClient.post('/api/auth/login', credentials);
      return data;
    },
  });
};

// Register API hook
export const useRegister = () => {
  return useMutation({
    mutationFn: async (userData: any) => {
      const { data } = await apiClient.post('/api/auth/register', userData);
      return data;
    },
  });
};

// Fetch customer personal order log
export const useMyOrders = () => {
  return useQuery({
    queryKey: ['my-orders'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/orders/my-orders');
      return data;
    },
  });
};
