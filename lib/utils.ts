/**
 * Utility functions for Evidence Review Workbench
 */

import { CaseStatus } from './types';

/**
 * Format timestamp to readable date/time string
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

/**
 * Format timestamp to date only
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Calculate SLA remaining time
 */
export function calculateSLARemaining(slaDeadline: number): {
  hours: number;
  isOverdue: boolean;
  isUrgent: boolean;
} {
  const remaining = slaDeadline - Date.now();
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  
  return {
    hours,
    isOverdue: hours < 0,
    isUrgent: hours >= 0 && hours < 12
  };
}

/**
 * Format SLA remaining for display
 */
export function formatSLA(slaDeadline: number): string {
  const { hours, isOverdue } = calculateSLARemaining(slaDeadline);
  
  if (isOverdue) {
    return `OVERDUE (${Math.abs(hours)}h)`;
  }
  
  if (hours < 1) {
    const minutes = Math.floor((slaDeadline - Date.now()) / (1000 * 60));
    return `${minutes}m remaining`;
  }
  
  return `${hours}h remaining`;
}

/**
 * Get status color classes for Tailwind
 */
export function getStatusColor(status: CaseStatus): string {
  const colors: Record<CaseStatus, string> = {
    NEW: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    NEEDS_INFO: 'bg-orange-100 text-orange-800 border-orange-200',
    APPROVED: 'bg-green-100 text-green-800 border-green-200',
    DENIED: 'bg-red-100 text-red-800 border-red-200'
  };
  
  return colors[status];
}

/**
 * Get SLA color based on urgency
 */
export function getSLAColor(slaDeadline: number): string {
  const { isOverdue, isUrgent } = calculateSLARemaining(slaDeadline);
  
  if (isOverdue) return 'text-red-600';
  if (isUrgent) return 'text-orange-600';
  return 'text-gray-600';
}

/**
 * Check if confidence score is low (< 0.7)
 */
export function isLowConfidence(confidence: number): boolean {
  return confidence < 0.7;
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}

/**
 * Get confidence color class
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.9) return 'text-green-600';
  if (confidence >= 0.7) return 'text-blue-600';
  if (confidence >= 0.5) return 'text-orange-600';
  return 'text-red-600';
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Check if user has permission for action
 */
export function hasPermission(
  userRole: 'viewer' | 'reviewer' | 'admin',
  action: 'view' | 'edit' | 'submit' | 'audit'
): boolean {
  const permissions = {
    viewer: ['view'],
    reviewer: ['view', 'edit', 'submit'],
    admin: ['view', 'edit', 'submit', 'audit']
  };
  
  return permissions[userRole].includes(action);
}

/**
 * Generate initials from name (for PHI redaction in production)
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase();
}

/**
 * Mask member ID (for PHI redaction in production)
 */
export function maskMemberId(memberId: string): string {
  if (memberId.length <= 4) return memberId;
  const lastFour = memberId.slice(-4);
  const masked = '*'.repeat(memberId.length - 4);
  return masked + lastFour;
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Validate field edit input
 */
export function validateFieldEdit(
  oldValue: string,
  newValue: string,
  reason: string
): { valid: boolean; error?: string } {
  if (!newValue || newValue.trim() === '') {
    return { valid: false, error: 'New value cannot be empty' };
  }
  
  if (newValue === oldValue) {
    return { valid: false, error: 'New value must be different from old value' };
  }
  
  if (!reason || reason.trim() === '') {
    return { valid: false, error: 'Reason for change is required' };
  }
  
  if (reason.length < 10) {
    return { valid: false, error: 'Reason must be at least 10 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate decision submission
 */
export function validateDecisionSubmission(
  isOverride: boolean,
  overrideReason: string | null,
  evidenceUsed: string[]
): { valid: boolean; error?: string } {
  if (evidenceUsed.length === 0) {
    return { valid: false, error: 'At least one evidence item must be selected' };
  }
  
  if (isOverride && (!overrideReason || overrideReason.trim() === '')) {
    return { valid: false, error: 'Override reason is required' };
  }
  
  if (isOverride && overrideReason && overrideReason.length < 15) {
    return { valid: false, error: 'Override reason must be at least 15 characters' };
  }
  
  return { valid: true };
}

/**
 * Sort cases by SLA urgency
 */
export function sortBySLA<T extends { slaDeadline: number }>(cases: T[]): T[] {
  return [...cases].sort((a, b) => a.slaDeadline - b.slaDeadline);
}

/**
 * Format error message for user display
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Remove technical details
    if (error.message.includes('Network')) {
      return 'Network error. Please check your connection and try again.';
    }
    if (error.message.includes('Server error')) {
      return 'Server is temporarily unavailable. Please try again in a moment.';
    }
    if (error.message.includes('Offline')) {
      return 'You are currently offline. Please reconnect to continue.';
    }
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Class name utility (similar to clsx)
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}