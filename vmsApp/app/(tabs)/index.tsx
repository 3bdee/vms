import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
} from 'react-native';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, User, ChevronDown, X } from 'lucide-react-native';
import { Student, Violation, Punishment, Level } from '@/lib/types';
import { router } from 'expo-router';

export default function NewViolationScreen() {
  const { teacher } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [level, setLevel] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null
  );
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedPunishment, setSelectedPunishment] =
    useState<Punishment | null>(null);
  const [violationTime, setViolationTime] = useState(
    new Date().toISOString().slice(0, 16)
  );

  const [suggestions, setSuggestions] = useState<Student[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [violations, setViolations] = useState<Violation[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);

  const [showViolationModal, setShowViolationModal] = useState(false);
  const [showPunishmentModal, setShowPunishmentModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (firstName.length > 1) {
      searchStudents(firstName);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [firstName]);
  const token = localStorage.getItem('token');
  const full_name = localStorage.getItem('teacher_name');
  const schoolId = localStorage.getItem('school_id');
  const teacherId = localStorage.getItem('teacher_id');
  const loadViolationsAndPunishments = async () => {
    try {
      const [violationsData, punishmentsData, levelsData] = await Promise.all([
        fetch('http://localhost:5000/api/violations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
        fetch('http://localhost:5000/api/punishments', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
        fetch('http://localhost:5000/api/levels/school', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json()),
      ]);
      setPunishments(punishmentsData);
      setViolations(violationsData);
      setLevels(levelsData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  useEffect(() => {
    loadViolationsAndPunishments();
  }, []);

  const searchStudents = async (searchTerm: string) => {
    if (!schoolId || !searchTerm) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/students/school`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to fetch students');
      const data = await res.json();
      if (data && data.length > 0) {
        const filtered = data.filter((student: Student) =>
          student.first_name.toLowerCase().startsWith(searchTerm.toLowerCase())
        );

        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      }
    } catch (error) {
      console.error('Error searching students:', error);
    }
  };

  const selectStudent = (student: Student) => {
    const levelObj = levels.find((level) => level.level_name === student.level);

    setSelectedStudent(student);
    setFirstName(student.first_name);
    setLastName(student.last_name);

    if (levelObj) {
      setSelectedLevel(levelObj);
      setLevel(levelObj.level_name);
    }
    setShowSuggestions(false);
  };
  type ViolationAlert = {
    show: boolean;
    student?: Student;
    count?: number;
  };

  const [violationAlert, setViolationAlert] = useState<ViolationAlert>({
    show: false,
  });
  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (
      !firstName ||
      !lastName ||
      !level ||
      !selectedViolation ||
      !selectedPunishment ||
      !selectedLevel
    ) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    if (!teacherId || !schoolId) {
      setError('Erreur: Enseignant non identifié');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/violation-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          teacher_id: teacherId,
          violation_id: selectedViolation.id,
          punishment_id: selectedPunishment.id,
          level: selectedLevel.level_name,
          first_name: firstName,
          last_name: lastName,
          violation_time: violationTime,
          school_id: schoolId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur serveur');
      const violationCount = data.newViolationCount;
      console.log(violationCount);
      if (violationCount % 3 === 0) {
        setViolationAlert({
          show: true,
          student: selectedStudent,
          count: violationCount,
        });
      }
      setSuccess('Violation enregistrée avec succès');
      setFirstName('');
      setLastName('');
      setLevel('');
      setSelectedViolation(null);
      setSelectedPunishment(null);
      setViolationTime(new Date().toISOString().slice(0, 16));
      setSelectedStudent(null);
      setSelectedLevel(null);

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError("Erreur lors de l'enregistrement de la violation");
    } finally {
      setLoading(false);
    }
  };

  const ViolationModal = () => (
    <Modal
      visible={showViolationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowViolationModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowViolationModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner une violation</Text>
            <TouchableOpacity onPress={() => setShowViolationModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {violations.map((violation) => (
              <TouchableOpacity
                key={violation.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedViolation(violation);
                  setShowViolationModal(false);
                }}
              >
                <Text style={styles.modalItemText}>
                  {violation.violation_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const LevelModal = () => (
    <Modal
      visible={showLevelModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowLevelModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowLevelModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner un niveau</Text>
            <TouchableOpacity onPress={() => setShowLevelModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedLevel(level);
                  setShowLevelModal(false);
                }}
              >
                <Text style={styles.modalItemText}>{level.level_name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  const PunishmentModal = () => (
    <Modal
      visible={showPunishmentModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPunishmentModal(false)}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={() => setShowPunishmentModal(false)}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sélectionner une sanction</Text>
            <TouchableOpacity onPress={() => setShowPunishmentModal(false)}>
              <X size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalList}>
            {punishments.map((punishment) => (
              <TouchableOpacity
                key={punishment.id}
                style={styles.modalItem}
                onPress={() => {
                  setSelectedPunishment(punishment);
                  setShowPunishmentModal(false);
                }}
              >
                <Text style={styles.modalItemText}>
                  {punishment.punishment_name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.teacherInfo}>
          <User size={20} color="#6B7280" />
          <Text style={styles.teacherText}>Enseignant: {full_name}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Prénom de l'élève *</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le prénom"
              value={firstName}
              onChangeText={(text) => {
                setFirstName(text);
                setSelectedStudent(null);
              }}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nom de l'élève *</Text>
            <TextInput
              style={styles.input}
              placeholder="Entrez le nom"
              value={lastName}
              onChangeText={setLastName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Niveau *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowLevelModal(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedLevel && styles.placeholderText,
                ]}
              >
                {selectedLevel
                  ? selectedLevel.level_name
                  : 'Sélectionner un niveau'}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Violation *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowViolationModal(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedViolation && styles.placeholderText,
                ]}
              >
                {selectedViolation
                  ? selectedViolation.violation_name
                  : 'Sélectionner une violation'}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Sanction *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => setShowPunishmentModal(true)}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectButtonText,
                  !selectedPunishment && styles.placeholderText,
                ]}
              >
                {selectedPunishment
                  ? selectedPunishment.punishment_name
                  : 'Sélectionner une sanction'}
              </Text>
              <ChevronDown size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Date et heure de violation *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD HH:MM"
              value={violationTime}
              onChangeText={setViolationTime}
              editable={!loading}
            />
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{success}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <FileText size={20} color="#FFF" />
                <Text style={styles.buttonText}>Enregistrer la violation</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((student) => (
            <TouchableOpacity
              key={student.id}
              style={styles.suggestionItem}
              onPress={() => selectStudent(student)}
            >
              <Text style={styles.suggestionText}>
                {student.first_name} {student.last_name}
              </Text>
              <Text style={styles.suggestionSubtext}>
                Niveau: {student.level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {violationAlert.show && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999,
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 20,
              width: '85%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: '#d32f2f',
                textAlign: 'center',
                marginBottom: 10,
              }}
            >
              ⚠️ Alerte Discipline
            </Text>

            <Text
              style={{ textAlign: 'center', fontSize: 16, marginBottom: 20 }}
            >
              L’élève{' '}
              <Text style={{ fontWeight: 'bold' }}>
                {violationAlert.student?.first_name}{' '}
                {violationAlert.student?.last_name}
              </Text>{' '}
              a maintenant{' '}
              <Text style={{ fontWeight: 'bold' }}>{violationAlert.count}</Text>{' '}
              violations.
            </Text>

            <TouchableOpacity
              onPress={() => setViolationAlert({ show: false })}
              style={{
                backgroundColor: '#d32f2f',
                borderRadius: 8,
                paddingVertical: 10,
              }}
            >
              <Text
                style={{
                  color: 'white',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: 16,
                }}
              >
                Fermer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <ViolationModal />
      <PunishmentModal />
      <LevelModal />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  teacherText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    zIndex: 2,
  },
  selectButton: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectButtonText: {
    fontSize: 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 168,
    left: 0,
    right: 0,
    backgroundColor: '#889797',
    overflow: 'hidden',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginLeft: 32,
    marginRight: 32,
    elevation: 10,
    maxHeight: 400,
    zIndex: 9999,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  suggestionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 8,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#D1FAE5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  successText: {
    color: '#059669',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalList: {
    padding: 16,
  },
  modalItem: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
});
