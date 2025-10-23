import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/lib/api';
import { User, Teacher } from '@/lib/types';
import { useNavigation } from '@react-navigation/native';
import { router, useRouter } from 'expo-router';

type AuthContextType = {
  user: User | null;
  teacher: Teacher | null;
  schoolId: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  teacher: null,
  schoolId: null,
  loading: true,
  signIn: async () => ({}),
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [schoolId, setSchoolId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        await loadUserData(userData.id);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
    setLoading(false);
  };

  const loadUserData = async (userId: string) => {
    try {
      const userData = await api.get(`/api/users/${userId}`);

      if (userData) {
        setUser(userData);

        const userSchools = await api.get(`/api/user-schools/${userData.id}`);

        if (userSchools && userSchools.length > 0) {
          const schoolId = userSchools[0].school_id;
          setSchoolId(schoolId);

          const teachers = await api.get(
            `/api/teachers?school_id=${schoolId}&full_name=${encodeURIComponent(
              userData.full_name
            )}`
          );

          if (teachers && teachers.length > 0) {
            setTeacher(teachers[0]);
          }
        }
      }
    } catch (error) {
      console.error('Load user data error:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login', { email, password });

      if (response && response.user) {
        await AsyncStorage.setItem('user', JSON.stringify(response.user));
        await loadUserData(response.user.id);
        return {};
      } else {
        return { error: 'Email ou mot de passe incorrect' };
      }
    } catch (error) {
      return { error: 'Email ou mot de passe incorrect' };
    }
  };

  const signOut = async () => {
    await AsyncStorage.removeItem('teacher_id');
    await AsyncStorage.removeItem('school_id');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('teacher_name');
    await AsyncStorage.removeItem('user');
    setUser(null);
    setTeacher(null);
    setSchoolId(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, teacher, schoolId, loading, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};
