/**
 * DocumentViewer Component
 * Simulated PDF viewer with page navigation and evidence highlighting
 */

'use client';

import React from 'react';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { Document, Extraction } from '@/lib/types';

interface DocumentViewerProps {
  documents: Document[];
  currentPage: number;
  onPageChange: (page: number) => void;
  selectedEvidence: Extraction | null;
}

// Simulated document content by page
const getDocumentContent = (page: number, selectedFieldId: string | null) => {
  const isHighlighted = (fieldId: string) => selectedFieldId === fieldId;

  const content: Record<number, JSX.Element> = {
    1: (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Clinical Notes - Page 1</h2>
        <p className="text-sm sm:text-base text-gray-700">
          <strong>Date of Service:</strong> {new Date().toLocaleDateString()}
        </p>
        <p className="text-sm sm:text-base text-gray-700">
          <strong>Provider:</strong> Dr. Sarah Johnson, MD
        </p>
        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
          Patient presents for follow-up evaluation regarding cardiac condition. 
          History and physical examination documented below.
        </p>
      </div>
    ),
    2: (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Clinical Notes - Page 2</h2>
        <div
          className={`p-3 sm:p-4 rounded transition-all ${
            isHighlighted('dx') || isHighlighted('symptoms')
              ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg'
              : 'bg-gray-50'
          }`}
        >
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">
            <strong>Chief Complaint:</strong> Patient reports progressive shortness of 
            breath and fatigue over the past 6 months, with decreased exercise tolerance.
          </p>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">
            <strong>History of Present Illness:</strong> 52-year-old patient with known 
            cardiac history presents with worsening dyspnea on exertion. Reports difficulty 
            climbing stairs and performing daily activities.
          </p>
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed">
            <strong>Diagnosis:</strong> Non-ischemic cardiomyopathy with reduced ejection 
            fraction. Patient has been symptomatic despite optimal medical management.
          </p>
        </div>
      </div>
    ),
    3: (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Clinical Notes - Page 3</h2>
        <div
          className={`p-3 sm:p-4 rounded transition-all ${
            isHighlighted('ef')
              ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg'
              : 'bg-gray-50'
          }`}
        >
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">
            <strong>Echocardiogram Results:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-sm sm:text-base text-gray-800 ml-2 sm:ml-4">
            <li>Left ventricular ejection fraction: <strong>25%</strong></li>
            <li>Moderate global hypokinesis noted</li>
            <li>Left ventricular end-diastolic dimension: 6.2 cm</li>
            <li>No significant valvular abnormalities</li>
            <li>Mild mitral regurgitation present</li>
          </ul>
          <p className="text-gray-700 text-xs sm:text-sm mt-3 italic">
            Study performed on {new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toLocaleDateString()}
          </p>
        </div>
      </div>
    ),
    4: (
      <div className="space-y-3 sm:space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">Clinical Notes - Page 4</h2>
        <div
          className={`p-3 sm:p-4 rounded transition-all ${
            isHighlighted('medication')
              ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg'
              : 'bg-gray-50'
          }`}
        >
          <p className="text-sm sm:text-base text-gray-800 leading-relaxed mb-3">
            <strong>Current Medications:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm sm:text-base text-gray-800 ml-2 sm:ml-4">
            <li>Lisinopril 10mg oral daily (ACE inhibitor)</li>
            <li>Metoprolol succinate 25mg oral twice daily (Beta blocker)</li>
            <li>Furosemide 20mg oral daily (Diuretic)</li>
            <li>Aspirin 81mg oral daily (Antiplatelet)</li>
          </ul>
          <p className="text-sm sm:text-base text-gray-700 mt-3">
            <strong>Medication Adherence:</strong> Patient reports good compliance with 
            prescribed regimen. No adverse effects noted.
          </p>
        </div>
      </div>
    ),
    5: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Clinical Notes - Page 5</h2>
        <div
          className={`p-4 rounded transition-all ${
            isHighlighted('prior_treatment') ? 'bg-yellow-100 border-2 border-yellow-400 shadow-lg' : 'bg-gray-50'
          }`}
        >
          <p className="text-gray-800 leading-relaxed mb-3">
            <strong>Treatment History:</strong>
          </p>
          <p className="text-gray-800 leading-relaxed mb-2">
            Patient has been on guideline-directed medical therapy for cardiomyopathy 
            for approximately 6 months. Despite optimization of medications including 
            ACE inhibitor and beta blocker, patient continues to experience NYHA Class III symptoms.
          </p>
          <p className="text-gray-800 leading-relaxed">
            Previous interventions include medication titration and lifestyle modifications. 
            Patient has been compliant with treatment plan but shows persistent symptoms 
            limiting quality of life.
          </p>
        </div>
      </div>
    ),
    6: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Clinical Notes - Page 6</h2>
        <p className="text-gray-700 leading-relaxed">
          <strong>Physical Examination:</strong>
        </p>
        <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
          <li>Vital Signs: BP 118/72, HR 68, RR 16, O2 Sat 96% on room air</li>
          <li>General: Alert and oriented, mild respiratory distress with exertion</li>
          <li>Cardiovascular: Regular rate and rhythm, S3 gallop present</li>
          <li>Respiratory: Clear to auscultation bilaterally, no rales</li>
          <li>Extremities: Trace bilateral pedal edema</li>
        </ul>
      </div>
    ),
    7: (
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Clinical Notes - Page 7</h2>
        <p className="text-gray-700 leading-relaxed mb-3">
          <strong>Assessment and Plan:</strong>
        </p>
        <p className="text-gray-800 leading-relaxed mb-3">
          Patient with symptomatic heart failure secondary to non-ischemic cardiomyopathy 
          with significantly reduced ejection fraction (25%) despite optimal medical management.
        </p>
        <p className="text-gray-800 leading-relaxed mb-3">
          Given persistent symptoms and high risk for sudden cardiac death, patient is 
          appropriate candidate for wearable cardioverter-defibrillator (WCD) pending 
          further evaluation for permanent implantable device.
        </p>
        <p className="text-gray-800 leading-relaxed">
          <strong>Recommendation:</strong> Authorize wearable cardioverter-defibrillator 
          for continuous monitoring and protection during bridging period.
        </p>
        <p className="text-gray-700 text-sm mt-4">
          <strong>Electronically signed by:</strong> Dr. Sarah Johnson, MD<br />
          <strong>Date:</strong> {new Date().toLocaleDateString()}
        </p>
      </div>
    ),
  };

  return content[page] || (
    <div className="text-gray-500 italic">
      <p>Document page {page} content</p>
      <p className="mt-4 text-sm">
        This is a simulated document viewer. In production, this would display actual PDF content 
        using pdf.js or similar library.
      </p>
    </div>
  );
};

export default function DocumentViewer({
  documents,
  currentPage,
  onPageChange,
  selectedEvidence,
}: DocumentViewerProps) {
  const currentDoc = documents[0]; // Use first document for demo
  const totalPages = currentDoc?.pages || 7;

  return (
    <div className="flex flex-col h-full">
      {/* Document Header */}
      <div className="border-b border-gray-200 px-6 py-4 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-600" />
            <div>
              <h3 className="font-semibold text-gray-900">{currentDoc?.title}</h3>
              <p className="text-sm text-gray-500">
                {currentDoc?.type} • {totalPages} pages
              </p>
            </div>
          </div>

          {/* Page Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="text-sm font-medium px-3 min-w-[100px] text-center">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Document Content */}
      <div className="flex-1 p-6 overflow-auto bg-gray-100">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 min-h-[700px]">
          <div className="text-center text-gray-400 text-sm mb-6">
            Document Page {currentPage} of {totalPages}
          </div>

          {getDocumentContent(currentPage, selectedEvidence?.fieldId || null)}

          {selectedEvidence && (
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Viewing evidence:</strong> {selectedEvidence.label}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}