import { Tabs } from 'expo-router';
import { FileText, ListChecks, LogOut } from 'lucide-react-native';
import { TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nouvelle Violation',
          tabBarIcon: ({ size, color }) => (
            <FileText size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
              <LogOut size={24} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="violations"
        options={{
          title: 'Historique',
          tabBarIcon: ({ size, color }) => (
            <ListChecks size={size} color={color} />
          ),
          headerRight: () => (
            <TouchableOpacity onPress={signOut} style={{ marginRight: 16 }}>
              <LogOut size={24} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />
    </Tabs>
  );
}
