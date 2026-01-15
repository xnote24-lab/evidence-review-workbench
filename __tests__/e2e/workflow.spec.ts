/**
 * End-to-End Workflow Test
 * Tests complete user journey through the application using Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('Evidence Review Workbench E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('complete review workflow: filter, select, edit, submit', async ({ page }) => {
    // Step 1: Verify case queue loads
    await expect(page.getByRole('heading', { name: 'Evidence Review Workbench' })).toBeVisible();
    await expect(page.getByText(/Showing \d+ of \d+ cases/)).toBeVisible();

    // Step 2: Change role to Reviewer
    await page.selectOption('select#role-select', 'reviewer');
    await expect(page.getByText('Reviewer')).toBeVisible();

    // Step 3: Filter cases by status
    const statusFilter = page.locator('select').nth(1); // Second select is status filter
    await statusFilter.selectOption('IN_REVIEW');
    
    // Wait for filter to apply
    await page.waitForTimeout(500);

    // Step 4: Search for a specific case
    const searchInput = page.getByPlaceholder(/Search by Case ID/);
    await searchInput.fill('PA-10293');
    await page.waitForTimeout(500);

    // Step 5: Select the case
    const caseRow = page.getByText('PA-10293').first();
    await expect(caseRow).toBeVisible();
    await caseRow.click();

    // Step 6: Verify case detail page loads
    await expect(page.getByText('Clinical Notes')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PA-10293' })).toBeVisible();
    await expect(page.getByText('Extracted Evidence')).toBeVisible();

    // Step 7: Click on an evidence field to view in document
    const diagnosisField = page.getByText('Diagnosis').first();
    await diagnosisField.click();
    
    // Verify document viewer shows correct page
    await expect(page.getByText('Document Page 2')).toBeVisible();

    // Step 8: Edit an evidence field
    const editButton = page.getByTitle('Edit field').first();
    await editButton.click();

    // Verify edit mode is active
    await expect(page.getByPlaceholder('Enter new value')).toBeVisible();
    await expect(page.getByPlaceholderText(/Explain why this change is necessary/)).toBeVisible();

    // Fill in new value and reason
    const valueInput = page.getByPlaceholder('Enter new value');
    await valueInput.clear();
    await valueInput.fill('Non-ischemic cardiomyopathy - confirmed via biopsy');

    const reasonInput = page.getByPlaceholderText(/Explain why this change is necessary/);
    await reasonInput.fill('Updated diagnosis based on recent pathology report from cardiac biopsy procedure');

    // Save the edit
    const saveButton = page.getByText('Save Changes');
    await saveButton.click();

    // Wait for save to complete
    await page.waitForTimeout(2000); // Account for API latency

    // Verify edit was saved (field exits edit mode)
    await expect(page.getByText('Non-ischemic cardiomyopathy - confirmed via biopsy')).toBeVisible();
    await expect(page.getByPlaceholder('Enter new value')).not.toBeVisible();

    // Step 9: Override AI recommendation
    const overrideButton = page.getByText('Override Recommendation');
    await overrideButton.click();

    // Select APPROVED decision
    const approvedButton = page.getByRole('button', { name: /Approved/i }).nth(1); // Second instance (in override section)
    await approvedButton.click();

    // Step 10: Fill in override reason
    const overrideReasonTextarea = page.getByPlaceholder(/Explain why you're overriding/);
    await overrideReasonTextarea.fill('Patient has documented compliance with medication regimen for 8 months and meets all clinical criteria for device approval despite AI recommendation');

    // Select evidence items
    const evidenceCheckbox = page.getByRole('checkbox').nth(1); // First evidence checkbox
    await evidenceCheckbox.check();

    // Step 11: Submit decision
    const submitButton = page.getByText('Submit Decision');
    await submitButton.click();

    // Wait for submission
    await page.waitForTimeout(2000);

    // Step 12: Verify submission success
    await expect(page.getByText('Decision Submitted Successfully')).toBeVisible();

    // Step 13: Verify audit trail
    await expect(page.getByText(/Audit Trail/)).toBeVisible();
    
    // Expand audit trail if collapsed
    const auditTrailHeader = page.getByText(/Audit Trail \(\d+\)/);
    await auditTrailHeader.click();

    // Verify audit events are recorded
    await expect(page.getByText('FIELD_EDIT')).toBeVisible();
    await expect(page.getByText('DECISION_SUBMITTED')).toBeVisible();

    // Step 14: Return to queue
    const backButton = page.getByRole('button', { name: /Back to Queue/i });
    await backButton.click();

    // Verify back at queue
    await expect(page.getByText(/Showing \d+ of \d+ cases/)).toBeVisible();
  });

  test('role-based access control: viewer cannot edit', async ({ page }) => {
    // Set role to viewer
    await page.selectOption('select#role-select', 'viewer');

    // Select a case
    const caseRow = page.getByText('PA-10').first();
    await caseRow.click();

    // Wait for case detail to load
    await expect(page.getByRole('heading', { name: /PA-\d+/ })).toBeVisible();

    // Verify read-only mode message
    await expect(page.getByText(/Read-Only Mode/)).toBeVisible();

    // Verify edit buttons are not present
    await expect(page.getByTitle('Edit field')).not.toBeVisible();

    // Verify submit button is not present
    await expect(page.getByText('Submit Decision')).not.toBeVisible();
  });

  test('offline mode handling', async ({ page }) => {
    // Enable offline mode
    const offlineCheckbox = page.getByRole('checkbox', { name: /Offline Mode/i });
    await offlineCheckbox.check();

    // Try to reload cases (should fail)
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify error message is shown
    await expect(page.getByText(/Offline mode enabled/i)).toBeVisible();
    await expect(page.getByText('Try Again')).toBeVisible();

    // Click retry button
    const retryButton = page.getByText('Try Again');
    await retryButton.click();

    // Should still show error since offline mode is on
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Offline mode enabled/i)).toBeVisible();

    // Disable offline mode
    await offlineCheckbox.uncheck();

    // Retry again
    await retryButton.click();

    // Should now load successfully
    await page.waitForTimeout(2000);
    await expect(page.getByText(/Showing \d+ of \d+ cases/)).toBeVisible();
  });

  test('case queue filtering and search', async ({ page }) => {
    // Get initial case count
    const initialText = await page.getByText(/Showing \d+ of \d+ cases/).textContent();
    const initialCount = parseInt(initialText?.match(/Showing (\d+)/)?.[1] || '0');

    // Filter by specialty
    const specialtyFilter = page.locator('select').nth(2); // Third select
    await specialtyFilter.selectOption('Cardiology');
    await page.waitForTimeout(500);

    // Verify filtered count is less than initial
    const filteredText = await page.getByText(/Showing \d+ of \d+ cases/).textContent();
    const filteredCount = parseInt(filteredText?.match(/Showing (\d+)/)?.[1] || '0');
    expect(filteredCount).toBeLessThan(initialCount);

    // Search for specific case
    const searchInput = page.getByPlaceholder(/Search by Case ID/);
    await searchInput.fill('PA-10000');
    await page.waitForTimeout(500);

    // Should show only matching cases
    const searchResults = await page.getByText(/Showing \d+ of \d+ cases/).textContent();
    const searchCount = parseInt(searchResults?.match(/Showing (\d+)/)?.[1] || '0');
    expect(searchCount).toBeLessThanOrEqual(10); // Should be very few matches

    // Clear filters
    await searchInput.clear();
    await specialtyFilter.selectOption('ALL');
    await page.waitForTimeout(500);

    // Should show all cases again
    const resetText = await page.getByText(/Showing \d+ of \d+ cases/).textContent();
    const resetCount = parseInt(resetText?.match(/Showing (\d+)/)?.[1] || '0');
    expect(resetCount).toBe(initialCount);
  });

  test('document viewer navigation', async ({ page }) => {
    // Select a case
    const caseRow = page.getByText('PA-10').first();
    await caseRow.click();

    // Wait for detail view
    await expect(page.getByText('Clinical Notes')).toBeVisible();

    // Verify page 1 is shown
    await expect(page.getByText('Page 1 of')).toBeVisible();

    // Click next page
    const nextButton = page.getByRole('button', { name: /Next page/i });
    await nextButton.click();

    // Verify page 2 is shown
    await expect(page.getByText('Page 2 of')).toBeVisible();

    // Click previous page
    const prevButton = page.getByRole('button', { name: /Previous page/i });
    await prevButton.click();

    // Back to page 1
    await expect(page.getByText('Page 1 of')).toBeVisible();

    // Click evidence field that links to page 3
    const ejectionFractionField = page.getByText('Ejection Fraction').first();
    await ejectionFractionField.click();

    // Should jump to page 3
    await expect(page.getByText('Page 3 of')).toBeVisible();
  });

  test('validation errors prevent invalid submissions', async ({ page }) => {
    // Select case and set to reviewer
    await page.selectOption('select#role-select', 'reviewer');
    const caseRow = page.getByText('PA-10').first();
    await caseRow.click();

    await expect(page.getByRole('heading', { name: /PA-\d+/ })).toBeVisible();

    // Try to edit field with invalid data
    const editButton = page.getByTitle('Edit field').first();
    await editButton.click();

    // Try to save without changing value
    const saveButton = page.getByText('Save Changes');
    await saveButton.click();

    // Should show validation error
    await expect(page.getByText(/New value must be different/i)).toBeVisible();

    // Fix validation error
    const valueInput = page.getByPlaceholder('Enter new value');
    await valueInput.fill('Updated value here');

    // Try to save without reason
    await saveButton.click();

    // Should show reason validation error
    await expect(page.getByText(/Reason for change is required/i)).toBeVisible();

    // Add short reason
    const reasonInput = page.getByPlaceholderText(/Explain why/);
    await reasonInput.fill('Short');
    await saveButton.click();

    // Should show minimum length error
    await expect(page.getByText(/at least 10 characters/i)).toBeVisible();

    // Cancel edit
    const cancelButton = page.getByText('Cancel');
    await cancelButton.click();

    // Should exit edit mode
    await expect(page.getByPlaceholder('Enter new value')).not.toBeVisible();
  });
});