/**
 * Unit Tests for Utility Functions
 * Tests core business logic and helper functions
 */

import {
  calculateSLARemaining,
  formatSLA,
  isLowConfidence,
  formatConfidence,
  validateFieldEdit,
  validateDecisionSubmission,
  hasPermission,
  calculateAge,
} from '@/lib/utils';

describe('SLA Calculations', () => {
  test('calculates remaining hours correctly', () => {
    const futureDeadline = Date.now() + 10 * 60 * 60 * 1000; // 10 hours from now
    const result = calculateSLARemaining(futureDeadline);
    
    expect(result.hours).toBe(10);
    expect(result.isOverdue).toBe(false);
    expect(result.isUrgent).toBe(true); // < 12 hours
  });

  test('identifies overdue cases', () => {
    const pastDeadline = Date.now() - 5 * 60 * 60 * 1000; // 5 hours ago
    const result = calculateSLARemaining(pastDeadline);
    
    expect(result.hours).toBe(-5);
    expect(result.isOverdue).toBe(true);
  });

  test('identifies urgent cases', () => {
    const urgentDeadline = Date.now() + 8 * 60 * 60 * 1000; // 8 hours from now
    const result = calculateSLARemaining(urgentDeadline);
    
    expect(result.isUrgent).toBe(true);
    expect(result.isOverdue).toBe(false);
  });

  test('formats SLA display correctly', () => {
    const deadline = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const formatted = formatSLA(deadline);
    
    expect(formatted).toBe('24h remaining');
  });

  test('formats overdue SLA correctly', () => {
    const deadline = Date.now() - 3 * 60 * 60 * 1000; // 3 hours ago
    const formatted = formatSLA(deadline);
    
    expect(formatted).toContain('OVERDUE');
  });
});

describe('Confidence Score Functions', () => {
  test('identifies low confidence correctly', () => {
    expect(isLowConfidence(0.65)).toBe(true);
    expect(isLowConfidence(0.45)).toBe(true);
    expect(isLowConfidence(0.75)).toBe(false);
    expect(isLowConfidence(0.91)).toBe(false);
  });

  test('formats confidence as percentage', () => {
    expect(formatConfidence(0.62)).toBe('62%');
    expect(formatConfidence(0.91)).toBe('91%');
    expect(formatConfidence(0.456)).toBe('46%');
  });
});

describe('Field Edit Validation', () => {
  test('validates successful field edit', () => {
    const result = validateFieldEdit(
      'Old diagnosis',
      'New diagnosis',
      'Updated based on new lab results from 2024-01-15'
    );
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('rejects empty new value', () => {
    const result = validateFieldEdit('Old value', '', 'Some reason');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('New value cannot be empty');
  });

  test('rejects unchanged value', () => {
    const result = validateFieldEdit('Same value', 'Same value', 'Reason');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('New value must be different from old value');
  });

  test('rejects empty reason', () => {
    const result = validateFieldEdit('Old', 'New', '');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Reason for change is required');
  });

  test('rejects reason that is too short', () => {
    const result = validateFieldEdit('Old', 'New', 'Too short');
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Reason must be at least 10 characters');
  });
});

describe('Decision Submission Validation', () => {
  test('validates successful decision submission without override', () => {
    const result = validateDecisionSubmission(false, null, ['field1', 'field2']);
    
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  test('validates successful decision submission with override', () => {
    const result = validateDecisionSubmission(
      true,
      'Clinical judgment based on patient history',
      ['field1']
    );
    
    expect(result.valid).toBe(true);
  });

  test('rejects submission with no evidence', () => {
    const result = validateDecisionSubmission(false, null, []);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('At least one evidence item must be selected');
  });

  test('rejects override without reason', () => {
    const result = validateDecisionSubmission(true, null, ['field1']);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Override reason is required');
  });

  test('rejects override with short reason', () => {
    const result = validateDecisionSubmission(true, 'Too short', ['field1']);
    
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Override reason must be at least 15 characters');
  });
});

describe('Permission Checks', () => {
  test('viewer has view permission only', () => {
    expect(hasPermission('viewer', 'view')).toBe(true);
    expect(hasPermission('viewer', 'edit')).toBe(false);
    expect(hasPermission('viewer', 'submit')).toBe(false);
    expect(hasPermission('viewer', 'audit')).toBe(false);
  });

  test('reviewer has view, edit, and submit permissions', () => {
    expect(hasPermission('reviewer', 'view')).toBe(true);
    expect(hasPermission('reviewer', 'edit')).toBe(true);
    expect(hasPermission('reviewer', 'submit')).toBe(true);
    expect(hasPermission('reviewer', 'audit')).toBe(false);
  });

  test('admin has all permissions', () => {
    expect(hasPermission('admin', 'view')).toBe(true);
    expect(hasPermission('admin', 'edit')).toBe(true);
    expect(hasPermission('admin', 'submit')).toBe(true);
    expect(hasPermission('admin', 'audit')).toBe(true);
  });
});

describe('Age Calculation', () => {
  test('calculates age correctly', () => {
    const dob = '1978-02-11';
    const age = calculateAge(dob);
    
    // Age will vary based on current date, but should be reasonable
    expect(age).toBeGreaterThan(40);
    expect(age).toBeLessThan(100);
  });

  test('handles recent birthdays correctly', () => {
    const currentYear = new Date().getFullYear();
    const dob = `${currentYear - 25}-01-01`;
    const age = calculateAge(dob);
    
    expect(age).toBe(25);
  });
});