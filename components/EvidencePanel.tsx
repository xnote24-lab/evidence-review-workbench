/**
 * EvidencePanel Component
 * Right pane containing extracted evidence, AI recommendation, and decision controls
 */

'use client';

import React, { useState } from 'react';
import { Case, DecisionType, Extraction, UserRole } from '@/lib/types';
import { mockApi } from '@/lib/mockApi';
import ExtractionField from './ExtractionField';
import AIRecommendation from './AIRecommendation';
import DecisionPanel from './DecisionPanel';
import AuditTrail from './AuditTrail';


interface EvidencePanelProps {
  caseData: Case;
  setCaseData: React.Dispatch<React.SetStateAction<Case | null>>;
  userRole: UserRole;
  onEvidenceClick: (extraction: Extraction) => void;
  offlineMode: boolean;
}

export default function EvidencePanel({
  caseData,
  setCaseData,
  userRole,
  onEvidenceClick,
  offlineMode,
}: EvidencePanelProps) {
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [decisionOverride, setDecisionOverride] = useState<DecisionType | null>(null);

  const canEdit = userRole === 'reviewer' || userRole === 'admin';
  const canViewAudit = userRole === 'admin' || caseData.auditTrail.length > 0;

  // Handle field edit save
  const handleFieldSave = async (fieldId: string, newValue: string, reason: string) => {
    if (offlineMode) {
      throw new Error('Cannot save changes in offline mode');
    }

    const extraction = caseData.extractions.find((e) => e.fieldId === fieldId);
    if (!extraction) {
      throw new Error('Field not found');
    }

    const editData = {
      oldValue: extraction.value,
      newValue,
      reason,
      timestamp: new Date().toISOString(),
      user: userRole,
    };

    const response = await mockApi.updateExtraction(
      caseData.caseId,
      fieldId,
      editData,
      offlineMode
    );

    if (response.success && response.data) {
      setCaseData(response.data);
      setEditingFieldId(null);
    }
  };

  // Handle decision submission
  const handleDecisionSubmit = async (
    overrideReason: string | null,
    evidenceUsed: string[]
  ) => {
    if (offlineMode) {
      throw new Error('Cannot submit decision in offline mode');
    }

    const decisionData = {
      finalDecision: decisionOverride || caseData.aiRecommendation.decision,
      isOverride: !!decisionOverride,
      overrideReason,
      evidenceUsed,
      timestamp: new Date().toISOString(),
      user: userRole,
    };

    const response = await mockApi.submitDecision(
      caseData.caseId,
      decisionData,
      offlineMode
    );

    if (response.success && response.data) {
      setCaseData(response.data);
      setDecisionOverride(null); // Reset override after submission
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Case Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">{caseData.caseId}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
          <div>
            <span className="text-gray-500">Specialty:</span>
            <span className="ml-2 font-medium text-gray-900">{caseData.specialty}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <span className="ml-2 font-medium text-gray-900">{caseData.status}</span>
          </div>
          <div className="sm:col-span-2">
            <span className="text-gray-500">Service:</span>
            <span className="ml-2 font-medium text-gray-900 break-words">{caseData.request.service}</span>
          </div>
          <div>
            <span className="text-gray-500">Code:</span>
            <span className="ml-2 font-medium text-gray-900">
              {caseData.request.codeType} {caseData.request.code}
            </span>
          </div>
        </div>

        {!canEdit && (
          <div className="mt-4 p-3 bg-gray-100 border border-gray-300 rounded text-xs sm:text-sm text-gray-700">
            <strong>Read-Only Mode:</strong> You are viewing as {userRole}. 
            Edit and submit capabilities are disabled.
          </div>
        )}
      </div>

      {/* Extracted Evidence */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Evidence</h3>
        <div className="space-y-4">
          {caseData.extractions.map((extraction) => (
            <ExtractionField
              key={extraction.fieldId}
              extraction={extraction}
              isEditing={editingFieldId === extraction.fieldId}
              onEdit={() => canEdit && setEditingFieldId(extraction.fieldId)}
              onSave={(newValue, reason) => handleFieldSave(extraction.fieldId, newValue, reason)}
              onCancel={() => setEditingFieldId(null)}
              onClick={() => onEvidenceClick(extraction)}
              canEdit={canEdit}
            />
          ))}
        </div>
      </div>

      {/* AI Recommendation */}
      <AIRecommendation
        recommendation={caseData.aiRecommendation}
        extractions={caseData.extractions}
        onEvidenceClick={onEvidenceClick}
        decisionOverride={decisionOverride}
        onOverrideChange={setDecisionOverride}
        canEdit={canEdit}
      />

      {/* Decision Submit Panel */}
      {canEdit && (
        <DecisionPanel
          decisionOverride={decisionOverride}
          extractions={caseData.extractions}
          aiEvidenceIds={caseData.aiRecommendation.evidenceFieldIds}
          onSubmit={handleDecisionSubmit}
        />
      )}

      {/* Audit Trail */}
      {canViewAudit && <AuditTrail events={caseData.auditTrail} />}
    </div>
  );
}
