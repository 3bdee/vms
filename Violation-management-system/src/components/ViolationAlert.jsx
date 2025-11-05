import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ViolationAlert = ({ student, violationCount, onClose }) => {
  if (!student || violationCount < 3) return null;

  const getAlertMessage = () => {
    if (violationCount === 3) {
      return `🚨 ALERTE CRITIQUE: L'élève ${student.firstName} ${student.lastName} a atteint 3 violations! Intervention immédiate requise.`;
    } else if (violationCount === 6) {
      return `🚨 ALERTE MAJEURE: L'élève ${student.firstName} ${student.lastName} a atteint 6 violations! Mesures disciplinaires sévères nécessaires.`;
    } else if (violationCount === 9) {
      return `🚨 ALERTE MAXIMALE: L'élève ${student.firstName} ${student.lastName} a atteint 9 violations! Convocation des parents et conseil disciplinaire requis.`;
    } else if (violationCount > 9) {
      return `🚨 SITUATION CRITIQUE: L'élève ${student.firstName} ${student.lastName} a ${violationCount} violations! Action disciplinaire immédiate requise.`;
    }
    return '';
  };

  return (
    <div className="modal-overlay" style={{ zIndex: 9999 }}>
      <div className="modal" style={{ maxWidth: '500px', animation: 'slideUp 0.3s ease-out' }}>
        <div className="modal-header" style={{ background: '#fee2e2', borderColor: '#fecaca' }}>
          <div className="flex items-center gap-2">
            <AlertTriangle size={24} color="#dc2626" />
            <h3 className="modal-title" style={{ color: '#dc2626' }}>
              ALERTE VIOLATION
            </h3>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-content">
          <div className="alert alert-error" style={{ 
            background: '#fef2f2', 
            border: '2px solid #dc2626',
            fontSize: '1rem',
            fontWeight: '600'
          }}>
            <AlertTriangle size={20} />
            {getAlertMessage()}
          </div>
          <div style={{ 
            background: '#f9fafb', 
            padding: '1rem', 
            borderRadius: '0.5rem',
            marginTop: '1rem'
          }}>
            <h4 style={{ marginBottom: '0.5rem', color: '#374151' }}>Détails de l'élève:</h4>
            <p><strong>Nom:</strong> {student.firstName} {student.lastName}</p>
            <p><strong>Niveau:</strong> {student.level}</p>
            <p><strong>Total des violations:</strong> {violationCount}</p>
          </div>
          <div className="flex justify-center mt-4">
            <button className="btn btn-danger" onClick={onClose}>
              J'ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViolationAlert;