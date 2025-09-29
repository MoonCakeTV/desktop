import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  username: string;
  email: string;
  user_role: string;
  meta_data?: string | null;
  created_at: string;
  updated_at: string;
  token: string; // JWT token for authentication
}

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null; // Store token separately for easy access
  login: (user: User) => void;
  logout: () => void;
  getAuthHeader: () => { Authorization: string } | {};
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      token: null,
      login: (user) =>
        set({
          user,
          isLoggedIn: true,
          token: user.token,
        }),
      logout: () =>
        set({
          user: null,
          isLoggedIn: false,
          token: null,
        }),
      getAuthHeader: () => {
        const token = get().token;
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
    {
      name: "user-storage", // name of the item in localStorage
    }
  )
);
