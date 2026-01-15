/**
 * ExtractionField Component
 * Displays extracted evidence field with edit capability and confidence scoring
 */

'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, AlertTriangle } from 'lucide-react';
import { Extraction } from '@/lib/types';
import { 
  isLowConfidence, 
  formatConfidence, 
  getConfidenceColor,
  validateFieldEdit 
} from '@/lib/utils';

interface ExtractionFieldProps {
  extraction: Extraction;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (newValue: string, reason: string) => Promise<void>;
  onCancel: () => void;
  onClick: () => void;
  canEdit: boolean;
}

export default function ExtractionField({
  extraction,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onClick,
  canEdit,
}: ExtractionFieldProps) {
  const [editValue, setEditValue] = useState(extraction.value);
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lowConfidence = isLowConfidence(extraction.confidence);

  const handleSave = async () => {
    setError(null);

    // Validate input
    const validation = validateFieldEdit(extraction.value, editValue, editReason);
    if (!validation.valid) {
      setError(validation.error || 'Validation failed');
      return;
    }

    setSaving(true);
    try {
      await onSave(editValue, editReason);
      setEditReason(''); // Reset reason after successful save
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(extraction.value);
    setEditReason('');
    setError(null);
    onCancel();
  };

  // Edit mode UI
  if (isEditing) {
    return (
      <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
        <div className="font-medium text-gray-900 mb-3">{extraction.label}</div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Value
            </label>
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter new value"
              disabled={saving}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Change (required, min 10 characters)
            </label>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Explain why this change is necessary..."
              disabled={saving}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View mode UI
  return (
    <div
      className={`border rounded-lg p-4 cursor-pointer transition-all ${
        lowConfidence
          ? 'border-orange-300 bg-orange-50 hover:border-orange-400'
          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-gray-900">{extraction.label}</span>
            {lowConfidence && (
              <span className="flex items-center gap-1 text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded">
                <AlertTriangle className="w-3 h-3" />
                Low Confidence
              </span>
            )}
          </div>

          <p className="text-gray-800 break-words">{extraction.value}</p>
        </div>

        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded transition-colors ml-2 flex-shrink-0"
            title="Edit field"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Confidence:</span>
          <span className={`font-medium ${getConfidenceColor(extraction.confidence)}`}>
            {formatConfidence(extraction.confidence)}
          </span>
        </div>

        <div className="text-gray-500">
          Source: {extraction.source.docId}, Page {extraction.source.page}
        </div>
      </div>
    </div>
  );
}