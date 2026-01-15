/**
 * AuditTrail Component
 * Displays audit trail events for compliance tracking
 */

'use client';

import React, { useState } from 'react';
import { ChevronRight, FileText, Edit2, CheckCircle, Eye } from 'lucide-react';
import { AuditEvent } from '@/lib/types';
import { formatDateTime } from '@/lib/utils';

interface AuditTrailProps {
  events: AuditEvent[];
  isVisible?: boolean;
}

const actionIcons = {
  FIELD_EDIT: Edit2,
  DECISION_SUBMITTED: CheckCircle,
  CASE_OPENED: Eye,
  CASE_CLOSED: FileText,
};

const actionColors = {
  FIELD_EDIT: 'border-blue-500 bg-blue-50',
  DECISION_SUBMITTED: 'border-green-500 bg-green-50',
  CASE_OPENED: 'border-gray-500 bg-gray-50',
  CASE_CLOSED: 'border-gray-500 bg-gray-50',
};

export default function AuditTrail({ events, isVisible = true }: AuditTrailProps) {
  const [expanded, setExpanded] = useState(isVisible);

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Audit Trail</h3>
        <p className="text-sm text-gray-500 italic">No audit events recorded yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between w-full text-left mb-4"
        aria-expanded={expanded}
      >
        <h3 className="text-lg font-semibold text-gray-900">
          Audit Trail ({events.length})
        </h3>
        <ChevronRight 
          className={`w-5 h-5 text-gray-500 transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
      </button>

      {expanded && (
        <div className="space-y-3">
          {events.map((event, index) => {
            const Icon = actionIcons[event.action] || FileText;
            const colorClass = actionColors[event.action] || 'border-gray-500 bg-gray-50';

            return (
              <div
                key={index}
                className={`border-l-4 pl-4 py-3 ${colorClass} rounded-r`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-gray-700 flex-shrink-0 mt-0.5" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">
                        {event.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formatDateTime(new Date(event.timestamp).getTime())}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      <p>
                        <span className="font-medium">User:</span> {event.user}
                      </p>

                      {event.fieldId && (
                        <p>
                          <span className="font-medium">Field:</span> {event.fieldId}
                        </p>
                      )}

                      {event.oldValue && event.newValue && (
                        <p className="bg-white bg-opacity-50 p-2 rounded text-xs">
                          <span className="font-medium">Changed from:</span>{' '}
                          <span className="line-through text-gray-500">"{event.oldValue}"</span>
                          <br />
                          <span className="font-medium">To:</span>{' '}
                          <span className="text-green-700">"{event.newValue}"</span>
                        </p>
                      )}

                      {event.reason && (
                        <p className="bg-white bg-opacity-50 p-2 rounded text-xs">
                          <span className="font-medium">Reason:</span> {event.reason}
                        </p>
                      )}

                      {event.decision && (
                        <p>
                          <span className="font-medium">Decision:</span>{' '}
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            event.decision === 'APPROVED' 
                              ? 'bg-green-100 text-green-800'
                              : event.decision === 'DENIED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                          }`}>
                            {event.decision}
                          </span>
                          {event.isOverride && (
                            <span className="ml-2 text-xs text-orange-600 font-medium">
                              (Override)
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}