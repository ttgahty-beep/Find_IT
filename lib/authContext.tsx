'use client';

import React, { createContext, useContext, useState } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'staff' | 'desk_officer' | 'admin';
  studentIdMasked?: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  quickSwitchAccount: (role: 'student' | 'finder' | 'desk' | 'admin') => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  quickSwitchAccount: () => {},
});

const DEMO_PRESETS: Record<string, AuthUser> = {
  student: {
    id: 'usr-student-01',
    name: 'Ahtesham Arian',
    email: 'ahtesham.student@fui.edu.pk',
    role: 'student',
    studentIdMasked: 'FU****42',
  },
  finder: {
    id: 'usr-finder-02',
    name: 'Fatima Zahra',
    email: 'fatima.zahra@fui.edu.pk',
    role: 'student',
    studentIdMasked: 'FU****18',
  },
  desk: {
    id: 'usr-desk-03',
    name: 'Dr. Muhammad Bilal',
    email: 'm.bilal@fui.edu.pk',
    role: 'desk_officer',
    studentIdMasked: 'FA****02',
    avatarUrl: '/images/avatar_proctor_officer_1791825924417.jpg',
  },
  admin: {
    id: 'usr-admin-04',
    name: 'Engr. Usman Khalid',
    email: 'dsa@fui.edu.pk',
    role: 'admin',
    studentIdMasked: 'AD****01',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof window === 'undefined') return DEMO_PRESETS.student;
    try {
      const stored = localStorage.getItem('findit_campus_user');
      return stored ? JSON.parse(stored) : DEMO_PRESETS.student;
    } catch {
      return DEMO_PRESETS.student;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return 'demo-token-alex';
    try {
      const storedToken = localStorage.getItem('findit_campus_token');
      return storedToken || 'demo-token-alex';
    } catch {
      return 'demo-token-alex';
    }
  });

  const login = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    try {
      localStorage.setItem('findit_campus_user', JSON.stringify(newUser));
      localStorage.setItem('findit_campus_token', newToken);
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    try {
      localStorage.removeItem('findit_campus_user');
      localStorage.removeItem('findit_campus_token');
    } catch (e) {
      console.warn('LocalStorage unavailable', e);
    }
  };

  const quickSwitchAccount = (type: 'student' | 'finder' | 'desk' | 'admin') => {
    const selected = DEMO_PRESETS[type];
    if (selected) {
      login(selected, `demo-token-${type}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        quickSwitchAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
