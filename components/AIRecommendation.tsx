/**
 * AIRecommendation Component
 * Displays AI decision recommendation with rationale and evidence links
 */

'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AIRecommendation as AIRecommendationType, Extraction, DecisionType } from '@/lib/types';

interface AIRecommendationProps {
  recommendation: AIRecommendationType;
  extractions: Extraction[];
  onEvidenceClick: (extraction: Extraction) => void;
  decisionOverride: DecisionType | null;
  onOverrideChange: (decision: DecisionType | null) => void;
  canEdit: boolean;
}

const decisionConfig = {
  APPROVED: {
    icon: CheckCircle,
    color: 'bg-green-100 border-green-300 text-green-800',
    label: 'Approved'
  },
  DENIED: {
    icon: XCircle,
    color: 'bg-red-100 border-red-300 text-red-800',
    label: 'Denied'
  },
  NEEDS_INFO: {
    icon: AlertCircle,
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    label: 'Needs More Info'
  }
};

export default function AIRecommendation({
  recommendation,
  extractions,
  onEvidenceClick,
  decisionOverride,
  onOverrideChange,
  canEdit,
}: AIRecommendationProps) {
  const activeDecision = decisionOverride || recommendation.decision;
  const config = decisionConfig[activeDecision];
  const Icon = config.icon;

  return (
    <div className={`border-2 rounded-lg p-6 ${config.color}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-6 h-6" />
        <div>
          <h3 className="text-lg font-semibold">
            {decisionOverride ? 'Override Decision' : 'AI Recommendation'}
          </h3>
          <p className="text-sm font-medium">{config.label}</p>
        </div>
      </div>

      {/* Rationale */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Rationale:</h4>
        <ul className="list-disc list-inside space-y-1 text-sm">
          {recommendation.rationale.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Evidence Used */}
      <div className="mb-4">
        <h4 className="font-medium mb-2">Evidence Used:</h4>
        <div className="flex flex-wrap gap-2">
          {recommendation.evidenceFieldIds.map((fieldId) => {
            const evidence = extractions.find((e) => e.fieldId === fieldId);
            return evidence ? (
              <button
                key={fieldId}
                onClick={() => onEvidenceClick(evidence)}
                className="px-3 py-1 bg-white bg-opacity-50 rounded-lg text-sm hover:bg-opacity-100 transition-colors border border-current border-opacity-20"
              >
                {evidence.label}
              </button>
            ) : null;
          })}
        </div>
      </div>

      {/* Override Controls */}
      {canEdit && !decisionOverride && (
        <button
          onClick={() => onOverrideChange('APPROVED')}
          className="px-4 py-2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-lg text-sm font-medium transition-colors"
        >
          Override Recommendation
        </button>
      )}

      {canEdit && decisionOverride && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <p className="text-sm font-medium mb-2">Select Override Decision:</p>
          <div className="flex gap-2">
            {(['APPROVED', 'DENIED', 'NEEDS_INFO'] as DecisionType[]).map((decision) => {
              const btnConfig = decisionConfig[decision];
              const BtnIcon = btnConfig.icon;
              
              return (
                <button
                  key={decision}
                  onClick={() => onOverrideChange(decision)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    decisionOverride === decision
                      ? 'bg-gray-900 bg-opacity-20 ring-2 ring-gray-900 ring-opacity-30'
                      : 'bg-white bg-opacity-50 hover:bg-opacity-100'
                  }`}
                >
                  <BtnIcon className="w-4 h-4" />
                  {btnConfig.label}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => onOverrideChange(null)}
            className="mt-3 text-sm text-current underline hover:no-underline"
          >
            Cancel Override
          </button>
        </div>
      )}
    </div>
  );
}