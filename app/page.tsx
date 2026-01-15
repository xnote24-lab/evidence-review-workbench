/**
 * Main Application Page
 * Evidence Review Workbench - Complete workflow application
 */

'use client';

import React, { useState } from 'react';
import { ChevronLeft, User } from 'lucide-react';
import { UserRole } from '@/lib/types';
import CaseQueue from '@/components/CaseQueue';
import CaseDetail from '@/components/CaseDetail';

export default function Home() {
  const [currentView, setCurrentView] = useState<'queue' | 'detail'>('queue');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('reviewer');
  const [offlineMode, setOfflineMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSelectCase = (caseId: string) => {
    setSelectedCaseId(caseId);
    setCurrentView('detail');
  };

  const handleBackToQueue = () => {
    setCurrentView('queue');
    setSelectedCaseId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto">
          {/* Single Row Layout for Desktop, Stacked for Mobile */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            {/* Left Side - Title and Back Button */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 min-w-0">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                  Evidence Review Workbench
                </h1>
                {currentView === 'detail' && (
                  <button
                    onClick={handleBackToQueue}
                    className="flex items-center gap-1 sm:gap-2 text-blue-600 hover:text-blue-700 transition-colors text-sm sm:text-base whitespace-nowrap"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Back to Queue</span>
                    <span className="sm:hidden">Back</span>
                  </button>
                )}
              </div>

              {/* Mobile Menu Toggle - Only visible on small screens */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showMobileMenu ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Right Side - Desktop Controls - Hidden on mobile, shown on sm+ */}
            <div className="hidden sm:flex items-center gap-3 lg:gap-4">
              {/* Role Selector */}
              <div className="flex items-center gap-2">
                <label htmlFor="role-select" className="text-sm text-gray-600 whitespace-nowrap">
                  Role:
                </label>
                <select
                  id="role-select"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="px-2 lg:px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer</option>
                  <option value="reviewer">Reviewer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {/* Offline Mode Toggle */}
              <label className="flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-gray-600 hidden lg:inline">Offline Mode</span>
                <span className="text-gray-600 lg:hidden">Offline</span>
              </label>

              {/* User Indicator */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {userRole}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Menu - Shown only when toggled on small screens */}
          {showMobileMenu && (
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 space-y-3">
              {/* Role Selector */}
              <div>
                <label htmlFor="role-select-mobile" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role-select-mobile"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="viewer">Viewer (Read-Only)</option>
                  <option value="reviewer">Reviewer (Edit & Submit)</option>
                  <option value="admin">Admin (Full Access)</option>
                </select>
              </div>

              {/* Offline Mode Toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={offlineMode}
                  onChange={(e) => setOfflineMode(e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Offline Mode</span>
              </label>

              {/* Current Role Display */}
              <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm">
                  Current Role: <span className="font-medium capitalize">{userRole}</span>
                </span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 sm:pb-24">
        {currentView === 'queue' ? (
          <CaseQueue onSelectCase={handleSelectCase} offlineMode={offlineMode} />
        ) : (
          selectedCaseId && (
            <CaseDetail
              caseId={selectedCaseId}
              userRole={userRole}
              offlineMode={offlineMode}
            />
          )
        )}
      </main>

      {/* Footer with PHI Notice */}
      <footer className="bg-white border-t border-gray-200 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center text-xs sm:text-sm text-gray-600">
          <p className="leading-relaxed">
            <strong>Protected Health Information (PHI) Notice:</strong> This application
            handles synthetic healthcare data. All data is stored in-memory only and
            cleared on page refresh. No data is persisted to browser storage.
          </p>
        </div>
      </footer>
    </div>
  );
}