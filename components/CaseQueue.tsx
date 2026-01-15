/**
 * CaseQueue Component
 * Virtualized list of cases with filtering and search
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { CaseListItem, CaseStatus, Specialty } from '@/lib/types';
import { mockApi } from '@/lib/mockApi';
import LoadingSpinner from './LoadingSpinner';
import { ErrorDisplay } from './ErrorBoundary';
import {
  formatDate,
  calculateSLARemaining,
  formatSLA,
  getStatusColor,
  getSLAColor,
  formatErrorMessage,
} from '@/lib/utils';

interface CaseQueueProps {
  onSelectCase: (caseId: string) => void;
  offlineMode: boolean;
}

const ROW_HEIGHT = 80;
const VISIBLE_ROWS = 12;

const STATUSES: (CaseStatus | 'ALL')[] = ['ALL', 'NEW', 'IN_REVIEW', 'NEEDS_INFO', 'APPROVED', 'DENIED'];
const SPECIALTIES: (Specialty | 'ALL')[] = [
  'ALL',
  'Cardiology',
  'Oncology',
  'Musculoskeletal',
  'Neurology',
  'Gastroenterology',
];

export default function CaseQueue({ onSelectCase, offlineMode }: CaseQueueProps) {
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CaseStatus | 'ALL'>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState<Specialty | 'ALL'>('ALL');
  const [scrollTop, setScrollTop] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  useEffect(() => {
    // Only load cases if we don't have them yet
    if (!initialLoadComplete || retryCount > 0) {
      loadCases();
    }
  }, [retryCount, offlineMode]);

  const loadCases = async () => {
    // If we already have cases and this isn't a retry, skip loading
    if (cases.length > 0 && retryCount === 0 && initialLoadComplete) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await mockApi.getCases(offlineMode);
      setCases(data);
      setInitialLoadComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load cases'));
    } finally {
      setLoading(false);
    }
  };

  // Filter cases
  const filteredCases = useMemo(() => {
    return cases.filter((c) => {
      const matchesSearch =
        c.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.member.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.member.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
      const matchesSpecialty = specialtyFilter === 'ALL' || c.specialty === specialtyFilter;
      return matchesSearch && matchesStatus && matchesSpecialty;
    });
  }, [cases, searchTerm, statusFilter, specialtyFilter]);

  // Virtualized visible cases
  const visibleCases = useMemo(() => {
    const startIndex = Math.floor(scrollTop / ROW_HEIGHT);
    const endIndex = Math.min(startIndex + VISIBLE_ROWS + 2, filteredCases.length);
    return filteredCases.slice(startIndex, endIndex).map((c, i) => ({
      ...c,
      virtualIndex: startIndex + i,
    }));
  }, [filteredCases, scrollTop]);

  const totalHeight = filteredCases.length * ROW_HEIGHT;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" message="Loading cases..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={formatErrorMessage(error)}
        onRetry={() => setRetryCount((c) => c + 1)}
        title="Failed to Load Cases"
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4 sm:mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search by Case ID, Member ID, or Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CaseStatus | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Statuses' : s.replace('_', ' ')}
              </option>
            ))}
          </select>

          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value as Specialty | 'ALL')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base sm:col-span-2 lg:col-span-1"
          >
            {SPECIALTIES.map((s) => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All Specialties' : s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
          Showing <span className="font-medium">{filteredCases.length}</span> of <span className="font-medium">{cases.length}</span> cases
        </div>
      </div>

      {/* Virtualized List */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div
          className="overflow-auto"
          style={{ height: `${VISIBLE_ROWS * ROW_HEIGHT}px` }}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
        >
          <div style={{ height: `${totalHeight}px`, position: 'relative' }}>
            {visibleCases.map((c) => (
              <CaseRow
                key={c.caseId}
                caseItem={c}
                style={{
                  position: 'absolute',
                  top: `${c.virtualIndex * ROW_HEIGHT}px`,
                  height: `${ROW_HEIGHT}px`,
                  left: 0,
                  right: 0,
                }}
                onClick={() => onSelectCase(c.caseId)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Individual Case Row Component
interface CaseRowProps {
  caseItem: CaseListItem & { virtualIndex: number };
  style: React.CSSProperties;
  onClick: () => void;
}

function CaseRow({ caseItem: c, style, onClick }: CaseRowProps) {
  const { hours, isOverdue, isUrgent } = calculateSLARemaining(c.slaDeadline);

  return (
    <div
      style={style}
      onClick={onClick}
      className="border-b border-gray-200 px-4 sm:px-6 py-4 sm:py-4 hover:bg-gray-50 cursor-pointer transition-colors overflow-hidden"
    >
      {/* Mobile Layout (< 640px) - Stacked */}
      <div className="sm:hidden space-y-2.5">
        {/* Row 1: Case ID and Status */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate flex-shrink">{c.caseId}</span>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(c.status)} whitespace-nowrap flex-shrink-0`}>
            {c.status.replace('_', ' ')}
          </span>
        </div>

        {/* Row 2: Specialty */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 flex-shrink-0">Specialty:</span>
          <span className="text-sm text-gray-700 font-medium truncate">{c.specialty}</span>
        </div>

        {/* Row 3: Member Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="truncate">Member: <span className="text-gray-700">{c.member.id}</span></div>
          <div className="truncate">Received: <span className="text-gray-700">{formatDate(c.receivedTime)}</span></div>
        </div>

        {/* Row 4: SLA */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <Clock className={`w-4 h-4 flex-shrink-0 ${getSLAColor(c.slaDeadline)}`} />
          <span className={`text-xs font-medium ${getSLAColor(c.slaDeadline)} truncate`}>
            {formatSLA(c.slaDeadline)}
          </span>
        </div>
      </div>

      {/* Desktop/Tablet Layout (≥ 640px) - Horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <span className="font-semibold text-gray-900">{c.caseId}</span>
            <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(c.status)} whitespace-nowrap`}>
              {c.status.replace('_', ' ')}
            </span>
            <span className="text-sm text-gray-600">{c.specialty}</span>
          </div>

          <div className="text-sm text-gray-500">
            Member: {c.member.id} • Received: {formatDate(c.receivedTime)}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          <Clock className={`w-5 h-5 ${getSLAColor(c.slaDeadline)}`} />
          <span className={`text-sm font-medium ${getSLAColor(c.slaDeadline)} whitespace-nowrap`}>
            {formatSLA(c.slaDeadline)}
          </span>
        </div>
      </div>
    </div>
  );
}