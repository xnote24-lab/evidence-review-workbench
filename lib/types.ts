/**
 * Type definitions for Evidence Review Workbench
 * All types follow HIPAA-compliant data handling practices
 */

export type CaseStatus = 'NEW' | 'IN_REVIEW' | 'NEEDS_INFO' | 'APPROVED' | 'DENIED';

export type Specialty = 
  | 'Cardiology' 
  | 'Oncology' 
  | 'Musculoskeletal' 
  | 'Neurology' 
  | 'Gastroenterology';

export type UserRole = 'viewer' | 'reviewer' | 'admin';

export type DecisionType = 'APPROVED' | 'DENIED' | 'NEEDS_INFO';

export type AuditActionType = 
  | 'FIELD_EDIT' 
  | 'DECISION_SUBMITTED' 
  | 'CASE_OPENED' 
  | 'CASE_CLOSED';

/**
 * Member (patient) information
 * Note: In production, PII fields would be tokenized/encrypted
 */
export interface Member {
  id: string;
  name: string;
  dob: string; // ISO date format
}

/**
 * Medical service request details
 */
export interface ServiceRequest {
  service: string;
  codeType: 'HCPCS' | 'CPT' | 'ICD-10';
  code: string;
}

/**
 * Document metadata
 */
export interface Document {
  docId: string;
  type: 'PDF' | 'IMAGE';
  title: string;
  pages: number;
}

/**
 * Source reference linking evidence to document location
 */
export interface EvidenceSource {
  docId: string;
  page: number;
}

/**
 * AI-extracted evidence field with confidence scoring
 */
export interface Extraction {
  fieldId: string;
  label: string;
  value: string;
  confidence: number; // 0.0 to 1.0
  source: EvidenceSource;
}

/**
 * AI decision recommendation with supporting rationale
 */
export interface AIRecommendation {
  decision: DecisionType;
  rationale: string[]; // 2-5 bullet points
  evidenceFieldIds: string[]; // References to Extraction.fieldId
}

/**
 * Audit trail event for compliance tracking
 */
export interface AuditEvent {
  action: AuditActionType;
  timestamp: string; // ISO datetime
  user: string; // User identifier
  fieldId?: string; // Optional: for field edits
  oldValue?: string;
  newValue?: string;
  reason?: string; // Required for overrides and edits
  decision?: DecisionType; // For decision submissions
  isOverride?: boolean; // Whether decision overrode AI recommendation
}

/**
 * Complete case data structure
 */
export interface Case {
  caseId: string;
  status: CaseStatus;
  specialty: Specialty;
  member: Member;
  request: ServiceRequest;
  receivedTime: number; // Unix timestamp
  slaDeadline: number; // Unix timestamp
  documents: Document[];
  extractions: Extraction[];
  aiRecommendation: AIRecommendation;
  auditTrail: AuditEvent[];
}

/**
 * Simplified case data for queue list display
 */
export interface CaseListItem {
  caseId: string;
  status: CaseStatus;
  specialty: Specialty;
  member: {
    id: string;
    name: string;
    dob: string;
  };
  receivedTime: number;
  slaDeadline: number;
  request: ServiceRequest;
}

/**
 * API request for field extraction edit
 */
export interface FieldEditRequest {
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
  user: string;
}

/**
 * API request for decision submission
 */
export interface DecisionSubmissionRequest {
  finalDecision: DecisionType;
  isOverride: boolean;
  overrideReason: string | null;
  evidenceUsed: string[]; // Array of fieldIds
  timestamp: string;
  user: string;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Filter state for case queue
 */
export interface CaseFilters {
  searchTerm: string;
  statusFilter: CaseStatus | 'ALL';
  specialtyFilter: Specialty | 'ALL';
}