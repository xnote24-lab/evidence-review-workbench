/**
 * Mock data generation for Evidence Review Workbench
 * Generates realistic synthetic healthcare data for testing
 */

import { 
  Case, 
  CaseListItem, 
  CaseStatus, 
  Specialty, 
  Extraction,
  AIRecommendation 
} from './types';

const STATUSES: CaseStatus[] = ['NEW', 'IN_REVIEW', 'NEEDS_INFO', 'APPROVED', 'DENIED'];

const SPECIALTIES: Specialty[] = [
  'Cardiology',
  'Oncology',
  'Musculoskeletal',
  'Neurology',
  'Gastroenterology'
];

const SERVICES = [
  'Wearable cardioverter-defibrillator',
  'MRI - Brain with contrast',
  'Physical therapy - 12 sessions',
  'Chemotherapy - FOLFOX regimen',
  'Spinal fusion surgery',
  'Cardiac catheterization',
  'Sleep study - Polysomnography',
  'Joint replacement - Hip',
  'Radiation therapy - 30 treatments',
  'Genetic testing - BRCA1/2'
];

const FIRST_NAMES = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer',
  'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia',
  'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez'
];

/**
 * Generate random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random item from array
 */
function randomItem<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

/**
 * Generate random date of birth (age 18-90)
 */
function generateDOB(): string {
  const year = new Date().getFullYear() - randomInt(18, 90);
  const month = String(randomInt(1, 12)).padStart(2, '0');
  const day = String(randomInt(1, 28)).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate case list items for queue (lightweight data)
 */
export function generateCaseList(count: number): CaseListItem[] {
  const cases: CaseListItem[] = [];
  const now = Date.now();

  for (let i = 0; i < count; i++) {
    const receivedTime = now - randomInt(0, 7 * 24 * 60 * 60 * 1000); // Last 7 days
    const slaHours = 48; // 48-hour SLA
    const slaDeadline = receivedTime + slaHours * 60 * 60 * 1000;

    cases.push({
      caseId: `PA-${10000 + i}`,
      status: randomItem(STATUSES),
      specialty: randomItem(SPECIALTIES),
      member: {
        id: `M-${80000 + i}`,
        name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
        dob: generateDOB()
      },
      receivedTime,
      slaDeadline,
      request: {
        service: randomItem(SERVICES),
        codeType: 'HCPCS',
        code: `K${1000 + randomInt(0, 9999)}`
      }
    });
  }

  return cases;
}

/**
 * Generate extractions based on specialty
 */
function generateExtractions(specialty: Specialty): Extraction[] {
  const cardiology: Extraction[] = [
    {
      fieldId: 'dx',
      label: 'Diagnosis',
      value: 'Non-ischemic cardiomyopathy',
      confidence: 0.62,
      source: { docId: 'DOC-1', page: 2 }
    },
    {
      fieldId: 'ef',
      label: 'Ejection Fraction',
      value: '25%',
      confidence: 0.91,
      source: { docId: 'DOC-1', page: 3 }
    },
    {
      fieldId: 'symptoms',
      label: 'Symptoms',
      value: 'Shortness of breath, fatigue, palpitations',
      confidence: 0.78,
      source: { docId: 'DOC-1', page: 2 }
    },
    {
      fieldId: 'medication',
      label: 'Current Medications',
      value: 'Lisinopril 10mg daily, Metoprolol 25mg BID, Furosemide 20mg daily',
      confidence: 0.45,
      source: { docId: 'DOC-1', page: 4 }
    },
    {
      fieldId: 'prior_treatment',
      label: 'Prior Treatment',
      value: 'Medical therapy for 6 months',
      confidence: 0.68,
      source: { docId: 'DOC-1', page: 5 }
    }
  ];

  const oncology: Extraction[] = [
    {
      fieldId: 'dx',
      label: 'Diagnosis',
      value: 'Stage IIIB colorectal adenocarcinoma',
      confidence: 0.88,
      source: { docId: 'DOC-1', page: 1 }
    },
    {
      fieldId: 'staging',
      label: 'Cancer Staging',
      value: 'T3N1M0',
      confidence: 0.92,
      source: { docId: 'DOC-1', page: 2 }
    },
    {
      fieldId: 'biomarkers',
      label: 'Biomarkers',
      value: 'KRAS wild-type, MSI-stable',
      confidence: 0.55,
      source: { docId: 'DOC-2', page: 1 }
    },
    {
      fieldId: 'prior_treatment',
      label: 'Prior Treatment',
      value: 'Surgical resection completed 4 weeks ago',
      confidence: 0.81,
      source: { docId: 'DOC-1', page: 3 }
    }
  ];

  const musculoskeletal: Extraction[] = [
    {
      fieldId: 'dx',
      label: 'Diagnosis',
      value: 'Severe osteoarthritis, right hip',
      confidence: 0.85,
      source: { docId: 'DOC-1', page: 1 }
    },
    {
      fieldId: 'pain_level',
      label: 'Pain Level',
      value: '8/10, limiting daily activities',
      confidence: 0.73,
      source: { docId: 'DOC-1', page: 2 }
    },
    {
      fieldId: 'imaging',
      label: 'Imaging Results',
      value: 'X-ray shows severe joint space narrowing, bone-on-bone contact',
      confidence: 0.89,
      source: { docId: 'DOC-2', page: 1 }
    },
    {
      fieldId: 'prior_treatment',
      label: 'Conservative Treatment',
      value: 'PT 8 weeks, NSAIDs, cortisone injection - all failed',
      confidence: 0.48,
      source: { docId: 'DOC-1', page: 3 }
    }
  ];

  const defaultExtractions: Extraction[] = [
    {
      fieldId: 'dx',
      label: 'Diagnosis',
      value: 'Clinical diagnosis documented',
      confidence: 0.75,
      source: { docId: 'DOC-1', page: 1 }
    },
    {
      fieldId: 'clinical_notes',
      label: 'Clinical Notes',
      value: 'Patient evaluation completed',
      confidence: 0.82,
      source: { docId: 'DOC-1', page: 2 }
    }
  ];

  switch (specialty) {
    case 'Cardiology':
      return cardiology;
    case 'Oncology':
      return oncology;
    case 'Musculoskeletal':
      return musculoskeletal;
    default:
      return defaultExtractions;
  }
}

/**
 * Generate AI recommendation based on extractions
 */
function generateAIRecommendation(extractions: Extraction[]): AIRecommendation {
  const lowConfidenceFields = extractions.filter(e => e.confidence < 0.7);
  const hasLowConfidence = lowConfidenceFields.length > 0;

  if (hasLowConfidence) {
    return {
      decision: 'NEEDS_INFO',
      rationale: [
        `${lowConfidenceFields.length} field(s) extracted with low confidence`,
        'Additional documentation recommended for verification',
        'Manual review of source documents advised'
      ],
      evidenceFieldIds: extractions.slice(0, 2).map(e => e.fieldId)
    };
  }

  const shouldApprove = Math.random() > 0.3;

  if (shouldApprove) {
    return {
      decision: 'APPROVED',
      rationale: [
        'All clinical criteria met based on extracted evidence',
        'Documentation supports medical necessity',
        'Treatment aligns with clinical guidelines'
      ],
      evidenceFieldIds: extractions.slice(0, 3).map(e => e.fieldId)
    };
  } else {
    return {
      decision: 'DENIED',
      rationale: [
        'Insufficient documentation of medical necessity',
        'Alternative treatment options not adequately explored',
        'Does not meet coverage criteria'
      ],
      evidenceFieldIds: extractions.slice(0, 2).map(e => e.fieldId)
    };
  }
}

/**
 * Generate complete case details
 */
export function generateCaseDetails(caseId: string): Case {
  // Extract index from caseId (PA-10293 -> 293)
  const index = parseInt(caseId.split('-')[1]) - 10000;
  
  const specialty = SPECIALTIES[index % SPECIALTIES.length];
  const now = Date.now();
  const receivedTime = now - randomInt(0, 7 * 24 * 60 * 60 * 1000);
  const slaDeadline = receivedTime + 48 * 60 * 60 * 1000;

  const extractions = generateExtractions(specialty);
  const aiRecommendation = generateAIRecommendation(extractions);

  return {
    caseId,
    status: 'IN_REVIEW',
    specialty,
    member: {
      id: `M-${80000 + index}`,
      name: `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`,
      dob: generateDOB()
    },
    request: {
      service: randomItem(SERVICES),
      codeType: 'HCPCS',
      code: `K${1000 + randomInt(0, 9999)}`
    },
    receivedTime,
    slaDeadline,
    documents: [
      { docId: 'DOC-1', type: 'PDF', title: 'Clinical Notes', pages: 7 },
      { docId: 'DOC-2', type: 'PDF', title: 'Lab Results', pages: 3 },
      { docId: 'DOC-3', type: 'PDF', title: 'Imaging Reports', pages: 2 }
    ],
    extractions,
    aiRecommendation,
    auditTrail: []
  };
}

/**
 * Generate specific cardiology case (matching assignment example)
 */
export function generateCardiologyCase(): Case {
  return {
    caseId: 'PA-10293',
    status: 'IN_REVIEW',
    specialty: 'Cardiology',
    member: { 
      id: 'M-88321', 
      name: 'Test Patient', 
      dob: '1978-02-11' 
    },
    request: { 
      service: 'Wearable cardioverter-defibrillator', 
      codeType: 'HCPCS', 
      code: 'K0606' 
    },
    receivedTime: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
    slaDeadline: Date.now() + 24 * 60 * 60 * 1000, // 1 day remaining
    documents: [
      { docId: 'DOC-1', type: 'PDF', title: 'Clinical Notes', pages: 7 }
    ],
    extractions: [
      { 
        fieldId: 'dx', 
        label: 'Diagnosis', 
        value: 'Non-ischemic cardiomyopathy', 
        confidence: 0.62, 
        source: { docId: 'DOC-1', page: 2 } 
      },
      { 
        fieldId: 'ef', 
        label: 'Ejection Fraction', 
        value: '25%', 
        confidence: 0.91, 
        source: { docId: 'DOC-1', page: 3 } 
      }
    ],
    aiRecommendation: {
      decision: 'NEEDS_INFO',
      rationale: [
        'EF present but timing unclear',
        'Missing documented guideline-directed medical therapy duration'
      ],
      evidenceFieldIds: ['ef', 'dx']
    },
    auditTrail: []
  };
}