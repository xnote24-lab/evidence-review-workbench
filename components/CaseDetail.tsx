/**
 * CaseDetail Component
 * Split-pane view with document viewer (left) and evidence panel (right)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Case, Extraction, UserRole } from '@/lib/types';
import { mockApi } from '@/lib/mockApi';
import DocumentViewer from './DocumentViewer';
import EvidencePanel from './EvidencePanel';
import LoadingSpinner from './LoadingSpinner';
import { ErrorDisplay } from './ErrorBoundary';
import { formatErrorMessage } from '@/lib/utils';

interface CaseDetailProps {
  caseId: string;
  userRole: UserRole;
  offlineMode: boolean;
}

export default function CaseDetail({ caseId, userRole, offlineMode }: CaseDetailProps) {
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEvidence, setSelectedEvidence] = useState<Extraction | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    loadCaseDetails();
  }, [caseId, retryCount, offlineMode]);

  const loadCaseDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await mockApi.getCaseDetails(caseId, offlineMode);
      setCaseData(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load case details'));
    } finally {
      setLoading(false);
    }
  };

  const handleEvidenceClick = (extraction: Extraction) => {
    setSelectedEvidence(extraction);
    setCurrentPage(extraction.source.page);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner size="lg" message="Loading case details..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={formatErrorMessage(error)}
        onRetry={() => setRetryCount((c) => c + 1)}
        title="Failed to Load Case Details"
      />
    );
  }

  if (!caseData) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Case not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-[60vh] lg:h-[calc(100vh-160px)]">
      {/* Left Pane: Document Viewer - Full width on mobile, half on desktop */}
      <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-gray-200 bg-white h-[50vh] lg:h-full">
        <DocumentViewer
          documents={caseData.documents}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          selectedEvidence={selectedEvidence}
        />
      </div>

      {/* Right Pane: Evidence Panel - Full width on mobile, half on desktop */}
      <div className="w-full lg:w-1/2 h-auto lg:h-full min-h-[60vh]">
        <EvidencePanel
          caseData={caseData}
          setCaseData={setCaseData}
          userRole={userRole}
          onEvidenceClick={handleEvidenceClick}
          offlineMode={offlineMode}
        />
      </div>
    </div>
  );
}