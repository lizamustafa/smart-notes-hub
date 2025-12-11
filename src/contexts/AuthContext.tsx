import React, { createContext, useContext, useState, useCallback } from 'react';
import { User, UserRole } from '@/types/lms';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: (User & { password: string })[] = [
  {
    id: '1',
    email: 'teacher@lms.com',
    name: 'John Teacher',
    role: 'teacher',
    password: 'password123',
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'student@lms.com',
    name: 'Jane Student',
    role: 'student',
    password: 'password123',
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'admin@lms.com',
    name: 'Admin User',
    role: 'admin',
    password: 'password123',
    createdAt: new Date(),
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('lms_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const { password: _, ...userData } = foundUser;
      setUser(userData);
      localStorage.setItem('lms_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const register = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    const exists = mockUsers.some(u => u.email === email);
    if (exists) return false;

    const newUser: User = {
      id: uuidv4(),
      email,
      name,
      role,
      createdAt: new Date(),
    };
    
    mockUsers.push({ ...newUser, password });
    setUser(newUser);
    localStorage.setItem('lms_user', JSON.stringify(newUser));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('lms_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
