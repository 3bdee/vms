import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Calendar, User, FileWarning, Shield } from 'lucide-react-native';
import { ViolationRecord } from '@/lib/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React from 'react';
export default function ViolationsHistoryScreen() {
  const [violations, setViolations] = useState<ViolationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadViolations();
  }, []);
  type Tab = 'new' | 'history';
  const [activeTab, setActiveTab] = useState<Tab>('new');
  const [full_name, setFullName] = useState('');
  useEffect(() => {
    if (activeTab === 'history') {
      loadViolations();
    }
  }, [activeTab]);

  const loadViolations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const full_name = await AsyncStorage.getItem('teacher_name');
      setFullName(full_name || '');
      setLoading(true);
      const res = await fetch(
        `https://vms-alhikma.cloud/vms-alhikma/api/teacher/violations`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error('Failed to fetch records');

      const data = await res.json();
      setViolations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadViolations();
  };
  useEffect(() => {
    loadViolations();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadViolations();
    }, [])
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderViolation = ({ item }: { item: ViolationRecord }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.studentInfo}>
          <User size={18} color="#3B82F6" />
          <Text style={styles.studentName}>
            {item.first_name} {item.last_name}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.level}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <FileWarning size={16} color="#EF4444" />
          <Text style={styles.infoLabel}>Violation:</Text>
        </View>
        <Text style={styles.infoText}>{item.violation_name}</Text>

        <View style={[styles.infoRow, { marginTop: 12 }]}>
          <Shield size={16} color="#F59E0B" />
          <Text style={styles.infoLabel}>Sanction:</Text>
        </View>
        <Text style={styles.infoText}>{item.punishment_name}</Text>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.footerItem}>
          <Calendar size={14} color="#6B7280" />
          <Text style={styles.footerText}>
            {formatDate(item.violation_time)}
          </Text>
        </View>
        <Text style={styles.footerText}>Par: {full_name}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Chargement des violations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={violations}
        renderItem={renderViolation}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <FileWarning size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>Aucune violation enregistrée</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3B82F6',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 12,
  },
});
