/**
 * DecisionPanel Component
 * Handles decision submission with validation for overrides
 */

'use client';

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { DecisionType, Extraction } from '@/lib/types';
import { validateDecisionSubmission } from '@/lib/utils';

interface DecisionPanelProps {
  decisionOverride: DecisionType | null;
  extractions: Extraction[];
  aiEvidenceIds: string[];
  onSubmit: (overrideReason: string | null, evidenceUsed: string[]) => Promise<void>;
}

export default function DecisionPanel({
  decisionOverride,
  extractions,
  aiEvidenceIds,
  onSubmit,
}: DecisionPanelProps) {
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>(
    decisionOverride ? [] : aiEvidenceIds
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    // Validate submission
    const validation = validateDecisionSubmission(
      !!decisionOverride,
      overrideReason || null,
      selectedEvidence
    );

    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(
        decisionOverride ? overrideReason : null,
        selectedEvidence
      );
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit decision');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEvidence = (fieldId: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Decision</h3>

      {decisionOverride && (
        <div className="mb-4 space-y-4">
          {/* Override Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Override Reason (Required, min 15 characters)
            </label>
            <textarea
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Explain why you're overriding the AI recommendation..."
              disabled={submitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {overrideReason.length} / 15 characters minimum
            </p>
          </div>

          {/* Evidence Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Evidence (Required - at least one)
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
              {extractions.map((extraction) => (
                <label
                  key={extraction.fieldId}
                  className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedEvidence.includes(extraction.fieldId)}
                    onChange={() => toggleEvidence(extraction.fieldId)}
                    className="mt-1 rounded"
                    disabled={submitting}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-gray-900">
                      {extraction.label}
                    </span>
                    <p className="text-xs text-gray-600 truncate">
                      {extraction.value}
                    </p>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {selectedEvidence.length} evidence item(s) selected
            </p>
          </div>
        </div>
      )}

      {!decisionOverride && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You are accepting the AI recommendation. Evidence items used: {aiEvidenceIds.length}
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={submitting || submitSuccess}
        className={`w-full px-6 py-3 rounded-lg font-medium transition-colors ${
          submitSuccess
            ? 'bg-green-600 text-white'
            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
      >
        {submitting ? (
          'Submitting...'
        ) : submitSuccess ? (
          <span className="flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Decision Submitted Successfully
          </span>
        ) : (
          'Submit Decision'
        )}
      </button>

      {submitSuccess && (
        <p className="mt-3 text-sm text-green-600 text-center">
          Decision has been recorded in the audit trail
        </p>
      )}
    </div>
  );
}