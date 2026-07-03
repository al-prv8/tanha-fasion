import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  address?: string;
  city?: string;
  postcode?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  setSession: (user: UserProfile, token: string) => void;
  clearSession: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setSession: (user, token) => {
        set({ user, token });
      },
      clearSession: () => {
        set({ user: null, token: null });
      },
      updateUserProfile: (profile) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...profile } });
        }
      },
      isAuthenticated: () => {
        return !!get().token;
      },
    }),
    {
      name: 'tanha-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
