/**
 * Mock API service with simulated degraded backend conditions
 * Implements random latency, failures, and retry logic
 */

import { 
  Case, 
  CaseListItem, 
  FieldEditRequest, 
  DecisionSubmissionRequest,
  ApiResponse 
} from './types';
import { 
  generateCaseList, 
  generateCaseDetails, 
  generateCardiologyCase 
} from './mockData';

/**
 * Configuration for backend simulation
 */
const API_CONFIG = {
  MIN_LATENCY: 200,        // Minimum delay in ms
  MAX_LATENCY: 2000,       // Maximum delay in ms
  FAILURE_RATE: 0.05,      // 5% failure rate (reduced from 15% for better UX)
  RETRY_ATTEMPTS: 3,       // Number of retry attempts
  RETRY_DELAY_BASE: 1000,  // Base delay for exponential backoff
};

/**
 * Simulate network latency with random delay
 */
function simulateLatency(): Promise<void> {
  const delay = Math.random() * (API_CONFIG.MAX_LATENCY - API_CONFIG.MIN_LATENCY) 
                + API_CONFIG.MIN_LATENCY;
  return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Determine if this request should fail (random)
 */
function shouldFail(): boolean {
  return Math.random() < API_CONFIG.FAILURE_RATE;
}

/**
 * Simulate API error
 */
class ApiError extends Error {
  constructor(message: string, public statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = API_CONFIG.RETRY_ATTEMPTS
): Promise<T> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === retries - 1;
      
      if (isLastAttempt) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const backoffDelay = API_CONFIG.RETRY_DELAY_BASE * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
      
      console.warn(`Retry attempt ${attempt + 1}/${retries} after ${backoffDelay}ms`);
    }
  }
  
  throw new Error('Max retries exceeded');
}

/**
 * In-memory case storage (simulates backend database)
 * WARNING: Data is cleared on page refresh (intentional for PHI security)
 */
class CaseStore {
  private cases: Map<string, Case> = new Map();
  private caseList: CaseListItem[] = [];
  private initialized = false;

  initialize() {
    if (!this.initialized) {
      console.log('Initializing case store...');
      this.caseList = generateCaseList(750);
      
      // Pre-populate with example cardiology case
      const cardiologyCase = generateCardiologyCase();
      this.cases.set(cardiologyCase.caseId, cardiologyCase);
      
      this.initialized = true;
      console.log(`Initialized with ${this.caseList.length} cases`);
    }
  }

  getCaseList(): CaseListItem[] {
    this.initialize();
    return this.caseList;
  }

  getCase(caseId: string): Case {
    this.initialize();
    
    // Check if case is already loaded
    if (this.cases.has(caseId)) {
      return this.cases.get(caseId)!;
    }
    
    // Generate case details on-demand
    const caseDetails = generateCaseDetails(caseId);
    this.cases.set(caseId, caseDetails);
    return caseDetails;
  }

  updateCase(caseId: string, updates: Partial<Case>): Case {
    const existingCase = this.getCase(caseId);
    const updatedCase = { ...existingCase, ...updates };
    this.cases.set(caseId, updatedCase);
    
    // Update list item if status changed
    if (updates.status) {
      const listIndex = this.caseList.findIndex(c => c.caseId === caseId);
      if (listIndex !== -1) {
        this.caseList[listIndex].status = updates.status;
      }
    }
    
    return updatedCase;
  }
}

const caseStore = new CaseStore();

/**
 * Mock API service
 */
export const mockApi = {
  /**
   * GET /cases
   * Fetch list of all cases
   */
  async getCases(offlineMode = false): Promise<CaseListItem[]> {
    if (offlineMode) {
      throw new ApiError('Network request failed: Offline mode enabled', 0);
    }

    await simulateLatency();
    
    if (shouldFail()) {
      throw new ApiError('Failed to fetch cases: Server error', 500);
    }

    return caseStore.getCaseList();
  },

  /**
   * GET /cases/:id
   * Fetch detailed case information
   */
  async getCaseDetails(caseId: string, offlineMode = false): Promise<Case> {
    if (offlineMode) {
      throw new ApiError('Network request failed: Offline mode enabled', 0);
    }

    await simulateLatency();
    
    if (shouldFail()) {
      throw new ApiError(`Failed to fetch case ${caseId}: Server error`, 500);
    }

    return caseStore.getCase(caseId);
  },

  /**
   * POST /cases/:id/extractions/:fieldId
   * Update an extracted field value
   */
  async updateExtraction(
    caseId: string,
    fieldId: string,
    editData: FieldEditRequest,
    offlineMode = false
  ): Promise<ApiResponse<Case>> {
    if (offlineMode) {
      throw new ApiError('Network request failed: Offline mode enabled', 0);
    }

    await simulateLatency();
    
    if (shouldFail()) {
      throw new ApiError('Failed to update extraction: Server error', 500);
    }

    // Validate request
    if (!editData.newValue || !editData.reason) {
      throw new ApiError('Invalid request: newValue and reason are required', 400);
    }

    const currentCase = caseStore.getCase(caseId);
    
    // Update extraction value
    const updatedExtractions = currentCase.extractions.map(extraction => {
      if (extraction.fieldId === fieldId) {
        return { ...extraction, value: editData.newValue };
      }
      return extraction;
    });

    // Add audit event
    const auditEvent = {
      action: 'FIELD_EDIT' as const,
      timestamp: editData.timestamp,
      user: editData.user,
      fieldId,
      oldValue: editData.oldValue,
      newValue: editData.newValue,
      reason: editData.reason
    };

    // Update case
    const updatedCase = caseStore.updateCase(caseId, {
      extractions: updatedExtractions,
      auditTrail: [...currentCase.auditTrail, auditEvent]
    });

    return {
      success: true,
      data: updatedCase
    };
  },

  /**
   * POST /cases/:id/decision
   * Submit final decision for a case
   */
  async submitDecision(
    caseId: string,
    decision: DecisionSubmissionRequest,
    offlineMode = false
  ): Promise<ApiResponse<Case>> {
    if (offlineMode) {
      throw new ApiError('Network request failed: Offline mode enabled', 0);
    }

    await simulateLatency();
    
    if (shouldFail()) {
      throw new ApiError('Failed to submit decision: Server error', 500);
    }

    // Validate request
    if (!decision.finalDecision || !decision.evidenceUsed.length) {
      throw new ApiError('Invalid request: finalDecision and evidenceUsed are required', 400);
    }

    if (decision.isOverride && !decision.overrideReason) {
      throw new ApiError('Override reason is required when overriding AI recommendation', 400);
    }

    const currentCase = caseStore.getCase(caseId);

    // Determine new status based on decision
    let newStatus = currentCase.status;
    if (decision.finalDecision === 'APPROVED') {
      newStatus = 'APPROVED';
    } else if (decision.finalDecision === 'DENIED') {
      newStatus = 'DENIED';
    } else if (decision.finalDecision === 'NEEDS_INFO') {
      newStatus = 'NEEDS_INFO';
    }

    // Add audit event
    const auditEvent = {
      action: 'DECISION_SUBMITTED' as const,
      timestamp: decision.timestamp,
      user: decision.user,
      decision: decision.finalDecision,
      isOverride: decision.isOverride,
      reason: decision.overrideReason || undefined
    };

    // Update case
    const updatedCase = caseStore.updateCase(caseId, {
      status: newStatus,
      auditTrail: [...currentCase.auditTrail, auditEvent]
    });

    return {
      success: true,
      data: updatedCase
    };
  }
};

/**
 * Export retry utility for use in components
 */
export { withRetry, ApiError };