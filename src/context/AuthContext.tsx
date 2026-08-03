import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthResponse {
  success: boolean;
  message?: string;
}

interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password?: string) => Promise<AuthResponse>;
  signup: (user: Omit<User, 'id'>) => Promise<AuthResponse>;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;

  const login = async (username: string, password?: string): Promise<AuthResponse> => {
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
        if (!text) return { success: false, message: 'Empty response from server.' };
        
        try {
          const user = JSON.parse(text);
          if (user && (user.id || user.username)) {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            return { success: true };
          }
        } catch {
          if (text.toLowerCase().includes('success')) {
            setCurrentUser({ id: '1', username, email: '' });
            setIsAuthModalOpen(false);
            return { success: true };
          }
        }
      }
      if (response.status === 502 || response.status === 503 || response.status === 504) {
        return { success: false, message: `Backend server is temporarily unreachable (${response.status} Bad Gateway).` };
      }
      return { success: false, message: 'Invalid username or password.' };
    } catch (e: any) {
      console.error('Login error', e);
      return { success: false, message: e?.message || 'Server connection error.' };
    }
  };

  const signup = async (newUser: Omit<User, 'id'>): Promise<AuthResponse> => {
    try {
      const payload = {
        email: newUser.email,
        password: newUser.password,
        username: newUser.username,
        fname: newUser.fname || '',
        lname: newUser.lname || '',
        address: {
          street: newUser.address?.street || '',
          city: newUser.address?.city || '',
          province: newUser.address?.province || '',
          country: newUser.address?.country || '',
          zip: newUser.address?.zip || '',
          phone: newUser.address?.phone || '',
        }
      };

      const response = await fetch(`${API_URL}/user/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const responseText = await response.text();

      if (response.ok) {
        // If response is valid JSON user
        try {
          const user = JSON.parse(responseText);
          if (user && (user.id || user.username)) {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
            return { success: true };
          }
        } catch {
          // not JSON, continue to login
        }

        // Auto-login after signup
        const loginRes = await login(newUser.username, newUser.password);
        if (loginRes.success) {
          return { success: true };
        }
        return { success: true };
      } else {
        let errorMsg = 'Failed to create account.';
        if (response.status === 502 || response.status === 503 || response.status === 504) {
          errorMsg = `Backend server is temporarily unreachable (${response.status} Bad Gateway). Please verify that the backend application is running.`;
        } else if (response.status >= 500) {
          errorMsg = `Internal server error (${response.status}). Please check backend logs.`;
        } else {
          try {
            const errData = JSON.parse(responseText);
            errorMsg = errData.message || errData.error || responseText || errorMsg;
          } catch {
            if (responseText && !responseText.includes('<html') && responseText.length < 150) {
              errorMsg = responseText;
            }
          }
        }
        return { success: false, message: errorMsg };
      }
    } catch (e: any) {
      console.error('Signup error', e);
      return { success: false, message: e?.message || 'Network error connecting to backend.' };
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
