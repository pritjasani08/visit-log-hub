import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  selectedRole: Role | null;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  setSelectedRole: (role: Role) => void;
  clearStorage: () => void;
  restoreUser: () => boolean;
  getCurrentUser: () => User | null;
}

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@intrack.app',
    mobileNumber: '9876543210',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'John',
    lastName: 'Student',
    email: 'student@intrack.app',
    mobileNumber: '1234567890',
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Manager',
    email: 'company@intrack.app',
    mobileNumber: '5555555555',
    role: 'COMPANY',
    createdAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      selectedRole: null,

      login: async (email: string, password: string) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const user = mockUsers.find(u => u.email === email);
        console.log('Login attempt:', { email, password, user, role: user?.role });
        
        if (user && (password.toUpperCase().includes(user.role) || password === 'Student@123' || password === 'Admin@123' || password === 'Company@123')) {
          console.log('Login successful for:', user.role);
          const token = `token-${user.id}-${Date.now()}`;
          set((state) => ({
            ...state,
            user,
            isAuthenticated: true,
            token,
            selectedRole: user.role,
          }));
          return true;
        }
        console.log('Login failed - user not found or password incorrect');
        return false;
      },

      register: async (userData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const newUser: User = {
          ...userData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          ...state,
          user: newUser,
          isAuthenticated: true,
          token: `token-${newUser.id}-${Date.now()}`,
          selectedRole: newUser.role,
        }));
        
        return true;
      },

      logout: () => {
        set((state) => ({
          ...state,
          user: null,
          isAuthenticated: false,
          token: null,
          selectedRole: null,
        }));
      },

      setSelectedRole: (role: Role) => {
        set((state) => ({
          ...state,
          selectedRole: role
        }));
      },

      clearStorage: () => {
        set((state) => ({
          ...state,
          user: null,
          isAuthenticated: false,
          token: null,
          selectedRole: null,
        }));
      },

      // Restore user from localStorage if available
      restoreUser: () => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        
        if (storedUser && storedToken) {
          try {
            const user = JSON.parse(storedUser);
            set((state) => ({
              ...state,
              user,
              isAuthenticated: true,
              token: storedToken,
              selectedRole: user.role,
            }));
            return true;
          } catch (error) {
            console.error('Error restoring user from localStorage:', error);
            return false;
          }
        }
        return false;
      },

      // Get current user (with fallback to localStorage)
      getCurrentUser: () => {
        const state = get();
        if (state.user) return state.user;
        
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            return JSON.parse(storedUser);
          } catch (error) {
            console.error('Error parsing stored user:', error);
            return null;
          }
        }
        return null;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated, 
        token: state.token,
        selectedRole: state.selectedRole 
      }),
    }
  )
);