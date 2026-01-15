/**
 * Component Tests for ExtractionField
 * Tests UI rendering, user interactions, and edit workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ExtractionField from '@/components/ExtractionField';
import { Extraction } from '@/lib/types';

const mockExtraction: Extraction = {
  fieldId: 'dx',
  label: 'Diagnosis',
  value: 'Non-ischemic cardiomyopathy',
  confidence: 0.62,
  source: { docId: 'DOC-1', page: 2 },
};

const mockExtractionHighConfidence: Extraction = {
  fieldId: 'ef',
  label: 'Ejection Fraction',
  value: '25%',
  confidence: 0.91,
  source: { docId: 'DOC-1', page: 3 },
};

describe('ExtractionField Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnSave = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();
  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders extraction field in view mode', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={false}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    expect(screen.getByText('Diagnosis')).toBeInTheDocument();
    expect(screen.getByText('Non-ischemic cardiomyopathy')).toBeInTheDocument();
    expect(screen.getByText('62%')).toBeInTheDocument();
  });

  test('displays low confidence warning for low confidence fields', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={false}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    expect(screen.getByText('Low Confidence')).toBeInTheDocument();
  });

  test('does not display low confidence warning for high confidence fields', () => {
    render(
      <ExtractionField
        extraction={mockExtractionHighConfidence}
        isEditing={false}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    expect(screen.queryByText('Low Confidence')).not.toBeInTheDocument();
  });

  test('calls onClick when field is clicked', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={false}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const field = screen.getByText('Diagnosis').closest('div');
    fireEvent.click(field!);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  test('calls onEdit when edit button is clicked', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={false}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const editButton = screen.getByTitle('Edit field');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnClick).not.toHaveBeenCalled(); // Click event should be stopped
  });

  test('does not show edit button when canEdit is false', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={false}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={false}
      />
    );

    expect(screen.queryByTitle('Edit field')).not.toBeInTheDocument();
  });

  test('renders edit mode UI when isEditing is true', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    expect(screen.getByPlaceholderText('Enter new value')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Explain why this change is necessary/)).toBeInTheDocument();
    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  test('allows user to edit value and reason', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const valueInput = screen.getByPlaceholderText('Enter new value') as HTMLInputElement;
    const reasonInput = screen.getByPlaceholderText(/Explain why this change is necessary/) as HTMLTextAreaElement;

    fireEvent.change(valueInput, { target: { value: 'Updated diagnosis' } });
    fireEvent.change(reasonInput, { target: { value: 'Based on new test results from cardiology' } });

    expect(valueInput.value).toBe('Updated diagnosis');
    expect(reasonInput.value).toBe('Based on new test results from cardiology');
  });

  test('calls onSave with correct parameters when save is clicked', async () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const valueInput = screen.getByPlaceholderText('Enter new value');
    const reasonInput = screen.getByPlaceholderText(/Explain why this change is necessary/);
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(valueInput, { target: { value: 'Updated diagnosis' } });
    fireEvent.change(reasonInput, { target: { value: 'Based on new test results' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith(
        'Updated diagnosis',
        'Based on new test results'
      );
    });
  });

  test('shows validation error when trying to save with empty reason', async () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const valueInput = screen.getByPlaceholderText('Enter new value');
    const saveButton = screen.getByText('Save Changes');

    fireEvent.change(valueInput, { target: { value: 'New value' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Reason for change is required/)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('shows validation error when new value is same as old value', async () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const reasonInput = screen.getByPlaceholderText(/Explain why this change is necessary/);
    const saveButton = screen.getByText('Save Changes');

    // Value input starts with original value
    fireEvent.change(reasonInput, { target: { value: 'Some reason that is long enough' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/New value must be different from old value/)).toBeInTheDocument();
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  test('calls onCancel when cancel button is clicked', () => {
    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={mockOnSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  test('disables inputs and buttons while saving', async () => {
    const slowSave = jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <ExtractionField
        extraction={mockExtraction}
        isEditing={true}
        onEdit={mockOnEdit}
        onSave={slowSave}
        onCancel={mockOnCancel}
        onClick={mockOnClick}
        canEdit={true}
      />
    );

    const valueInput = screen.getByPlaceholderText('Enter new value') as HTMLInputElement;
    const reasonInput = screen.getByPlaceholderText(/Explain why this change is necessary/) as HTMLTextAreaElement;
    const saveButton = screen.getByText('Save Changes') as HTMLButtonElement;

    fireEvent.change(valueInput, { target: { value: 'New value' } });
    fireEvent.change(reasonInput, { target: { value: 'Valid reason for the change' } });
    fireEvent.click(saveButton);

    // Check that button shows "Saving..." and is disabled
    expect(screen.getByText('Saving...')).toBeInTheDocument();
    expect(saveButton.disabled).toBe(true);
    expect(valueInput.disabled).toBe(true);
    expect(reasonInput.disabled).toBe(true);

    await waitFor(() => {
      expect(slowSave).toHaveBeenCalled();
    });
  });
});