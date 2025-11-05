import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { User, Teacher } from '@/lib/types';
import { router } from 'expo-router';

type AuthContextType = {
  user: User | null;
  teacher: Teacher | null;
  schoolId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  teacher: null,
  schoolId: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const signOut = async () => {
    await AsyncStorage.removeItem('teacher_id');
    await AsyncStorage.removeItem('school_id');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('teacher_name');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setTeacher(null);
    setSchoolId(null);
    router.replace('/(auth)');
  };

  return (
    <AuthContext.Provider value={{ user, teacher, schoolId, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
