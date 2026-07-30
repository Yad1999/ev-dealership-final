import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => Promise<boolean>;
  signup: (user: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const login = async (username: string, password?: string) => {
    try {
      const response = await fetch(`${API_URL}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (response.ok) {
        const text = await response.text();
        if (!text) return false;
        
        const user = JSON.parse(text);
        if (user && user.id) {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  };

  const signup = async (newUser: Omit<User, 'id'>) => {
    try {
      const response = await fetch(`${API_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (response.ok) {
        const msg = await response.text();
        if (msg.toLowerCase().includes('success')) {
          return await login(newUser.username, newUser.password);
        }
      }
      return false;
    } catch (e) {
      console.error('Signup error', e);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        signup,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
