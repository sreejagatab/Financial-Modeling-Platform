/**
 * Quality of Earnings Calculator Component
 * Calculate adjusted EBITDA with addbacks and deductions
 */

import React, { useState, useMemo } from 'react';
import type { QoEAdjustment } from '../types';

interface QoECalculatorProps {
  reportedEbitda: number;
  adjustments: QoEAdjustment[];
  onAdjustmentsChange: (adjustments: QoEAdjustment[]) => void;
  onReportedEbitdaChange: (value: number) => void;
}

export function QoECalculator({
  reportedEbitda,
  adjustments,
  onAdjustmentsChange,
  onReportedEbitdaChange,
}: QoECalculatorProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Calculate QoE summary
  const summary = useMemo(() => {
    const addbacks = adjustments
      .filter((a) => a.is_addback)
      .reduce((sum, a) => sum + a.amount, 0);
    const deductions = adjustments
      .filter((a) => !a.is_addback)
      .reduce((sum, a) => sum + a.amount, 0);
    const adjusted = reportedEbitda + addbacks - deductions;
    const recurringAdj = adjustments
      .filter((a) => a.is_recurring)
      .reduce((sum, a) => sum + (a.is_addback ? a.amount : -a.amount), 0);
    const nonRecurringAdj = adjustments
      .filter((a) => !a.is_recurring)
      .reduce((sum, a) => sum + (a.is_addback ? a.amount : -a.amount), 0);
    const confidenceWeighted = adjustments.reduce(
      (sum, a) =>
        sum + (a.is_addback ? a.amount : -a.amount) * (a.confidence_level || 1),
      reportedEbitda
    );

    return {
      reportedEbitda,
      totalAddbacks: addbacks,
      totalDeductions: deductions,
      adjustedEbitda: adjusted,
      recurringAdjustments: recurringAdj,
      nonRecurringAdjustments: nonRecurringAdj,
      confidenceWeighted,
      adjustmentCount: adjustments.length,
    };
  }, [reportedEbitda, adjustments]);

  function addAdjustment(adj: QoEAdjustment) {
    onAdjustmentsChange([...adjustments, adj]);
    setIsAddingNew(false);
  }

  function updateAdjustment(adj: QoEAdjustment) {
    onAdjustmentsChange(adjustments.map((a) => (a.id === adj.id ? adj : a)));
    setEditingId(null);
  }

  function deleteAdjustment(id: string) {
    if (confirm('Are you sure you want to delete this adjustment?')) {
      onAdjustmentsChange(adjustments.filter((a) => a.id !== id));
    }
  }

  // Common adjustment categories
  const categories = [
    'One-time',
    'Owner',
    'Non-cash',
    'Pro forma',
    'Revenue',
    'Cost',
    'Normalization',
    'Other',
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Quality of Earnings</h2>
          <p className="text-sm text-gray-600">
            Calculate adjusted EBITDA with QoE adjustments
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Adjustment
        </button>
      </div>

      {/* QoE Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Reported EBITDA Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reported EBITDA
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                value={reportedEbitda || ''}
                onChange={(e) =>
                  onReportedEbitdaChange(parseFloat(e.target.value) || 0)
                }
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-lg font-semibold"
                placeholder="Enter reported EBITDA"
              />
            </div>
          </div>

          {/* Adjustments Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Addbacks</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(summary.totalAddbacks)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Deductions</span>
              <span className="font-medium text-red-600">
                -{formatCurrency(summary.totalDeductions)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Recurring Adjustments</span>
              <span className="font-medium">
                {formatCurrencySigned(summary.recurringAdjustments)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Non-recurring Adjustments</span>
              <span className="font-medium">
                {formatCurrencySigned(summary.nonRecurringAdjustments)}
              </span>
            </div>
          </div>

          {/* Adjusted EBITDA */}
          <div className="text-center bg-white rounded-lg p-4 border-2 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Adjusted EBITDA</div>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(summary.adjustedEbitda)}
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Confidence-weighted: {formatCurrency(summary.confidenceWeighted)}
            </div>
          </div>
        </div>

        {/* Bridge Visualization */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-3">
            EBITDA Bridge
          </div>
          <div className="flex items-end gap-2 h-32">
            {/* Reported EBITDA Bar */}
            <BridgeBar
              label="Reported"
              value={summary.reportedEbitda}
              maxValue={Math.max(summary.reportedEbitda, summary.adjustedEbitda) * 1.2}
              color="blue"
            />
            {/* Addbacks */}
            {summary.totalAddbacks > 0 && (
              <BridgeBar
                label="Addbacks"
                value={summary.totalAddbacks}
                maxValue={Math.max(summary.reportedEbitda, summary.adjustedEbitda) * 1.2}
                color="green"
                isPositive
              />
            )}
            {/* Deductions */}
            {summary.totalDeductions > 0 && (
              <BridgeBar
                label="Deductions"
                value={summary.totalDeductions}
                maxValue={Math.max(summary.reportedEbitda, summary.adjustedEbitda) * 1.2}
                color="red"
                isNegative
              />
            )}
            {/* Adjusted EBITDA Bar */}
            <BridgeBar
              label="Adjusted"
              value={summary.adjustedEbitda}
              maxValue={Math.max(summary.reportedEbitda, summary.adjustedEbitda) * 1.2}
              color="purple"
            />
          </div>
        </div>
      </div>

      {/* Add New Adjustment Form */}
      {isAddingNew && (
        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <AdjustmentForm
            categories={categories}
            onSubmit={addAdjustment}
            onCancel={() => setIsAddingNew(false)}
          />
        </div>
      )}

      {/* Adjustments List */}
      <div className="space-y-3">
        {adjustments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No QoE adjustments yet. Click "Add Adjustment" to get started.
          </div>
        ) : (
          <>
            {/* Addbacks */}
            {adjustments.filter((a) => a.is_addback).length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-green-700 mb-2">
                  Addbacks
                </h3>
                {adjustments
                  .filter((a) => a.is_addback)
                  .map((adj) => (
                    <AdjustmentCard
                      key={adj.id}
                      adjustment={adj}
                      isEditing={editingId === adj.id}
                      categories={categories}
                      onEdit={() => setEditingId(adj.id)}
                      onUpdate={updateAdjustment}
                      onDelete={() => deleteAdjustment(adj.id)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
              </div>
            )}

            {/* Deductions */}
            {adjustments.filter((a) => !a.is_addback).length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-700 mb-2">
                  Deductions
                </h3>
                {adjustments
                  .filter((a) => !a.is_addback)
                  .map((adj) => (
                    <AdjustmentCard
                      key={adj.id}
                      adjustment={adj}
                      isEditing={editingId === adj.id}
                      categories={categories}
                      onEdit={() => setEditingId(adj.id)}
                      onUpdate={updateAdjustment}
                      onDelete={() => deleteAdjustment(adj.id)}
                      onCancelEdit={() => setEditingId(null)}
                    />
                  ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Bridge Bar Component
function BridgeBar({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
  isPositive?: boolean;
  isNegative?: boolean;
}) {
  const height = (Math.abs(value) / maxValue) * 100;
  const colors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="text-xs text-gray-600 mb-1">
        {formatCurrencyCompact(value)}
      </div>
      <div
        className={`w-full ${colors[color]} rounded-t transition-all duration-300`}
        style={{ height: `${height}%`, minHeight: '4px' }}
      />
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}

// Adjustment Form Component
interface AdjustmentFormProps {
  adjustment?: QoEAdjustment;
  categories: string[];
  onSubmit: (adj: QoEAdjustment) => void;
  onCancel: () => void;
}

function AdjustmentForm({
  adjustment,
  categories,
  onSubmit,
  onCancel,
}: AdjustmentFormProps) {
  const [description, setDescription] = useState(adjustment?.description || '');
  const [category, setCategory] = useState(adjustment?.category || 'One-time');
  const [amount, setAmount] = useState(adjustment?.amount || 0);
  const [isAddback, setIsAddback] = useState(adjustment?.is_addback ?? true);
  const [isRecurring, setIsRecurring] = useState(adjustment?.is_recurring ?? false);
  const [confidence, setConfidence] = useState(adjustment?.confidence_level ?? 1);
  const [notes, setNotes] = useState(adjustment?.notes || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      id: adjustment?.id || `q-${Date.now()}`,
      description,
      category,
      amount,
      is_addback: isAddback,
      is_recurring: isRecurring,
      confidence_level: confidence,
      notes,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Describe the adjustment"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount ($) *
          </label>
          <input
            type="number"
            value={amount || ''}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Adjustment amount"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={isAddback ? 'addback' : 'deduction'}
            onChange={(e) => setIsAddback(e.target.value === 'addback')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="addback">Addback (+)</option>
            <option value="deduction">Deduction (-)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confidence Level
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">
            {(confidence * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 mb-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isRecurring}
            onChange={(e) => setIsRecurring(e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Recurring adjustment</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Additional notes..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {adjustment ? 'Update' : 'Add'} Adjustment
        </button>
      </div>
    </form>
  );
}

// Adjustment Card Component
interface AdjustmentCardProps {
  adjustment: QoEAdjustment;
  isEditing: boolean;
  categories: string[];
  onEdit: () => void;
  onUpdate: (adj: QoEAdjustment) => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

function AdjustmentCard({
  adjustment,
  isEditing,
  categories,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
}: AdjustmentCardProps) {
  if (isEditing) {
    return (
      <div className="mb-2 p-4 border border-blue-200 bg-blue-50 rounded-lg">
        <AdjustmentForm
          adjustment={adjustment}
          categories={categories}
          onSubmit={onUpdate}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div
      className={`mb-2 p-4 border rounded-lg hover:shadow-sm transition-shadow ${
        adjustment.is_addback
          ? 'border-green-200 bg-green-50'
          : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                adjustment.is_addback
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {adjustment.is_addback ? 'Addback' : 'Deduction'}
            </span>
            <span className="text-xs text-gray-500">{adjustment.category}</span>
            {adjustment.is_recurring && (
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                Recurring
              </span>
            )}
          </div>
          <p className="font-medium text-gray-900">{adjustment.description}</p>
          <div className="flex items-center gap-4 mt-1">
            <span
              className={`font-semibold ${
                adjustment.is_addback ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {adjustment.is_addback ? '+' : '-'}
              {formatCurrency(adjustment.amount)}
            </span>
            {adjustment.confidence_level && adjustment.confidence_level < 1 && (
              <span className="text-xs text-gray-500">
                Confidence: {(adjustment.confidence_level * 100).toFixed(0)}%
              </span>
            )}
          </div>
          {adjustment.notes && (
            <p className="text-sm text-gray-600 mt-1">{adjustment.notes}</p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-100 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility functions
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCurrencySigned(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return sign + formatCurrency(value);
}

function formatCurrencyCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default QoECalculator;
