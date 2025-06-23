import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@shared/types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for existing session
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
      const savedUser = mockUsers.find(u => u.id === savedUserId);
      if (savedUser) {
        setUser(savedUser);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - in real app, this would make API call
    const foundUser = mockUsers.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('userId', foundUser.id);
      return true;
    }
    return false;
  };

  const register = async (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
    // Mock registration
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      nftGallery: [],
      spotifyConnected: false,
      favoriteGenres: []
    };

    // In real app, this would make API call
    mockUsers.push(newUser);
    setUser(newUser);
    localStorage.setItem('userId', newUser.id);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userId');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // In real app, this would make API call
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}