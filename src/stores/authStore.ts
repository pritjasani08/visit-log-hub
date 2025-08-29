import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, Role } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  selectRole: (role: Role) => void;
  selectedRole: Role | null;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: Role;
}

// Mock users for demo
const mockUsers: User[] = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@intrack.app',
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    firstName: 'Student',
    lastName: 'User',
    email: 'student@intrack.app',
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    firstName: 'Company',
    lastName: 'Viewer',
    email: 'company@intrack.app',
    role: 'COMPANY_VIEWER',
    createdAt: new Date().toISOString(),
  },
];

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      selectedRole: null,

      selectRole: (role: Role) => {
        set({ selectedRole: role });
      },

      login: async (email: string, password: string) => {
        // Mock authentication
        const user = mockUsers.find(u => u.email === email);
        
        // Demo passwords
        const validPasswords: Record<string, string> = {
          'admin@intrack.app': 'Admin@123',
          'student@intrack.app': 'Student@123',
          'company@intrack.app': 'Company@123',
        };

        if (user && validPasswords[email] === password) {
          const token = `mock-token-${user.id}`;
          set({
            user,
            isAuthenticated: true,
            token,
            selectedRole: user.role,
          });
          return true;
        }
        return false;
      },

      register: async (data: RegisterData) => {
        // Mock registration
        const newUser: User = {
          id: Math.random().toString(36).substr(2, 9),
          ...data,
          createdAt: new Date().toISOString(),
        };
        
        const token = `mock-token-${newUser.id}`;
        set({
          user: newUser,
          isAuthenticated: true,
          token,
          selectedRole: newUser.role,
        });
        return true;
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          token: null,
          selectedRole: null,
        });
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'intrack-auth',
    }
  )
);