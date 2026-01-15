/**
 * Findings Tracker Component
 * Track and manage DD findings with severity levels
 */

import React, { useState } from 'react';
import type {
  DDFinding,
  FindingSeverity,
  FindingCategory,
  FindingStatus,
} from '../types';

interface FindingsTrackerProps {
  findings: DDFinding[];
  onFindingsChange: (findings: DDFinding[]) => void;
}

export function FindingsTracker({ findings, onFindingsChange }: FindingsTrackerProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<FindingSeverity | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<FindingStatus | 'all'>('all');

  const filteredFindings = findings.filter((f) => {
    if (filterSeverity !== 'all' && f.severity !== filterSeverity) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    return true;
  });

  function addFinding(finding: DDFinding) {
    onFindingsChange([...findings, finding]);
    setIsAddingNew(false);
  }

  function updateFinding(finding: DDFinding) {
    onFindingsChange(findings.map((f) => (f.id === finding.id ? finding : f)));
    setEditingId(null);
  }

  function deleteFinding(id: string) {
    if (confirm('Are you sure you want to delete this finding?')) {
      onFindingsChange(findings.filter((f) => f.id !== id));
    }
  }

  // Summary stats
  const stats = {
    total: findings.length,
    critical: findings.filter((f) => f.severity === 'critical').length,
    high: findings.filter((f) => f.severity === 'high').length,
    medium: findings.filter((f) => f.severity === 'medium').length,
    low: findings.filter((f) => f.severity === 'low').length,
    open: findings.filter((f) => f.status === 'open').length,
    totalImpact: findings.reduce((sum, f) => sum + (f.impact_amount || 0), 0),
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Findings Tracker</h2>
          <p className="text-sm text-gray-600">
            Track and manage due diligence findings
          </p>
        </div>
        <button
          onClick={() => setIsAddingNew(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Finding
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <StatBadge label="Total" value={stats.total} color="gray" />
        <StatBadge label="Critical" value={stats.critical} color="red" />
        <StatBadge label="High" value={stats.high} color="orange" />
        <StatBadge label="Medium" value={stats.medium} color="yellow" />
        <StatBadge label="Low" value={stats.low} color="green" />
        <StatBadge label="Open" value={stats.open} color="blue" />
        <StatBadge
          label="Impact"
          value={formatCurrency(stats.totalImpact)}
          color="purple"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Severity
          </label>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm"
          >
            <option value="all">All</option>
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
      </div>

      {/* Add New Finding Form */}
      {isAddingNew && (
        <div className="mb-4 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <FindingForm
            onSubmit={addFinding}
            onCancel={() => setIsAddingNew(false)}
          />
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-3">
        {filteredFindings.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No findings yet. Click "Add Finding" to get started.
          </div>
        ) : (
          filteredFindings.map((finding) => (
            <FindingCard
              key={finding.id}
              finding={finding}
              isEditing={editingId === finding.id}
              onEdit={() => setEditingId(finding.id)}
              onUpdate={updateFinding}
              onDelete={() => deleteFinding(finding.id)}
              onCancelEdit={() => setEditingId(null)}
            />
          ))
        )}
      </div>
    </div>
  );
}

// Finding Form Component
interface FindingFormProps {
  finding?: DDFinding;
  onSubmit: (finding: DDFinding) => void;
  onCancel: () => void;
}

function FindingForm({ finding, onSubmit, onCancel }: FindingFormProps) {
  const [title, setTitle] = useState(finding?.title || '');
  const [description, setDescription] = useState(finding?.description || '');
  const [category, setCategory] = useState<FindingCategory>(finding?.category || 'financial');
  const [severity, setSeverity] = useState<FindingSeverity>(finding?.severity || 'medium');
  const [status, setStatus] = useState<FindingStatus>(finding?.status || 'open');
  const [impactAmount, setImpactAmount] = useState(finding?.impact_amount || 0);
  const [recommendation, setRecommendation] = useState(finding?.recommendation || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      id: finding?.id || `f-${Date.now()}`,
      title,
      description,
      category,
      severity,
      status,
      impact_amount: impactAmount,
      recommendation,
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Finding title"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as FindingCategory)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="financial">Financial</option>
            <option value="legal">Legal</option>
            <option value="operational">Operational</option>
            <option value="commercial">Commercial</option>
            <option value="technology">Technology</option>
            <option value="hr">HR</option>
            <option value="environmental">Environmental</option>
            <option value="regulatory">Regulatory</option>
            <option value="tax">Tax</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Severity
          </label>
          <select
            value={severity}
            onChange={(e) => setSeverity(e.target.value as FindingSeverity)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
            <option value="info">Info</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as FindingStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="open">Open</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="accepted">Accepted</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impact Amount ($)
          </label>
          <input
            type="number"
            value={impactAmount || ''}
            onChange={(e) => setImpactAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Financial impact"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Describe the finding..."
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Recommendation
        </label>
        <textarea
          value={recommendation}
          onChange={(e) => setRecommendation(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Recommended action..."
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
          {finding ? 'Update' : 'Add'} Finding
        </button>
      </div>
    </form>
  );
}

// Finding Card Component
interface FindingCardProps {
  finding: DDFinding;
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (finding: DDFinding) => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

function FindingCard({
  finding,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
}: FindingCardProps) {
  if (isEditing) {
    return (
      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
        <FindingForm
          finding={finding}
          onSubmit={onUpdate}
          onCancel={onCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <SeverityBadge severity={finding.severity} />
            <StatusBadge status={finding.status} />
            <span className="text-xs text-gray-500 capitalize">
              {finding.category}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">{finding.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{finding.description}</p>
          {finding.impact_amount ? (
            <p className="text-sm text-red-600 mt-2">
              Impact: {formatCurrency(finding.impact_amount)}
            </p>
          ) : null}
          {finding.recommendation && (
            <p className="text-sm text-blue-600 mt-2">
              Recommendation: {finding.recommendation}
            </p>
          )}
        </div>
        <div className="flex gap-2 ml-4">
          <button
            onClick={onEdit}
            className="px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// Badge Components
function SeverityBadge({ severity }: { severity: FindingSeverity }) {
  const colors: Record<FindingSeverity, string> = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-green-100 text-green-800',
    info: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: FindingStatus }) {
  const colors: Record<FindingStatus, string> = {
    open: 'bg-red-100 text-red-800',
    in_review: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    accepted: 'bg-gray-100 text-gray-800',
  };

  const labels: Record<FindingStatus, string> = {
    open: 'Open',
    in_review: 'In Review',
    resolved: 'Resolved',
    accepted: 'Accepted',
  };

  return (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function StatBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  const colors: Record<string, string> = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <div className={`px-3 py-2 rounded-lg text-center ${colors[color]}`}>
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default FindingsTracker;
