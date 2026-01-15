/**
 * Risk Matrix Component
 * Visual risk assessment with likelihood × impact matrix
 */

import React, { useState } from 'react';
import type {
  RiskItem,
  FindingCategory,
  RiskLikelihood,
  RiskImpact,
} from '../types';
import { LIKELIHOOD_SCORES, IMPACT_SCORES } from '../types';

interface RiskMatrixProps {
  risks: RiskItem[];
  onRisksChange: (risks: RiskItem[]) => void;
}

export function RiskMatrix({ risks, onRisksChange }: RiskMatrixProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'matrix' | 'list'>('matrix');

  function addRisk(risk: RiskItem) {
    onRisksChange([...risks, risk]);
    setIsAddingNew(false);
  }

  function updateRisk(risk: RiskItem) {
    onRisksChange(risks.map((r) => (r.id === risk.id ? risk : r)));
    setEditingId(null);
  }

  function deleteRisk(id: string) {
    if (confirm('Are you sure you want to delete this risk?')) {
      onRisksChange(risks.filter((r) => r.id !== id));
    }
  }

  // Calculate risk scores
  const risksWithScores = risks.map((risk) => ({
    ...risk,
    score: LIKELIHOOD_SCORES[risk.likelihood] * IMPACT_SCORES[risk.impact],
    level: getRiskLevel(
      LIKELIHOOD_SCORES[risk.likelihood] * IMPACT_SCORES[risk.impact]
    ),
  }));

  // Group by risk level
  const riskCounts = {
    critical: risksWithScores.filter((r) => r.level === 'critical').length,
    high: risksWithScores.filter((r) => r.level === 'high').length,
    medium: risksWithScores.filter((r) => r.level === 'medium').length,
    low: risksWithScores.filter((r) => r.level === 'low').length,
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">Risk Matrix</h2>
          <p className="text-sm text-gray-600">
            Assess and visualize risks using likelihood × impact scoring
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'matrix'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Matrix
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 text-sm ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Risk
          </button>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <RiskCountBadge label="Critical" count={riskCounts.critical} color="red" />
        <RiskCountBadge label="High" count={riskCounts.high} color="orange" />
        <RiskCountBadge label="Medium" count={riskCounts.medium} color="yellow" />
        <RiskCountBadge label="Low" count={riskCounts.low} color="green" />
      </div>

      {/* Add New Risk Form */}
      {isAddingNew && (
        <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
          <RiskForm
            onSubmit={addRisk}
            onCancel={() => setIsAddingNew(false)}
          />
        </div>
      )}

      {/* Matrix View */}
      {viewMode === 'matrix' && (
        <div className="mb-6">
          <RiskMatrixGrid risks={risksWithScores} />
        </div>
      )}

      {/* List View */}
      <div className="space-y-3">
        {risksWithScores.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No risks identified yet. Click "Add Risk" to get started.
          </div>
        ) : (
          risksWithScores
            .sort((a, b) => b.score - a.score)
            .map((risk) => (
              <RiskCard
                key={risk.id}
                risk={risk}
                isEditing={editingId === risk.id}
                onEdit={() => setEditingId(risk.id)}
                onUpdate={updateRisk}
                onDelete={() => deleteRisk(risk.id)}
                onCancelEdit={() => setEditingId(null)}
              />
            ))
        )}
      </div>
    </div>
  );
}

// Risk Matrix Grid Component
function RiskMatrixGrid({
  risks,
}: {
  risks: (RiskItem & { score: number; level: string })[];
}) {
  const likelihoods: RiskLikelihood[] = [
    'almost_certain',
    'likely',
    'possible',
    'unlikely',
    'rare',
  ];
  const impacts: RiskImpact[] = [
    'minor',
    'moderate',
    'major',
    'severe',
    'catastrophic',
  ];

  function getCellColor(likelihood: RiskLikelihood, impact: RiskImpact): string {
    const score = LIKELIHOOD_SCORES[likelihood] * IMPACT_SCORES[impact];
    if (score >= 20) return 'bg-red-500';
    if (score >= 12) return 'bg-orange-500';
    if (score >= 6) return 'bg-yellow-400';
    return 'bg-green-400';
  }

  function getRisksInCell(likelihood: RiskLikelihood, impact: RiskImpact) {
    return risks.filter(
      (r) => r.likelihood === likelihood && r.impact === impact
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="w-24"></th>
            {impacts.map((impact) => (
              <th
                key={impact}
                className="px-2 py-2 text-xs font-medium text-gray-600 capitalize"
              >
                {impact}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {likelihoods.map((likelihood) => (
            <tr key={likelihood}>
              <td className="px-2 py-2 text-xs font-medium text-gray-600 capitalize text-right">
                {likelihood.replace('_', ' ')}
              </td>
              {impacts.map((impact) => {
                const cellRisks = getRisksInCell(likelihood, impact);
                return (
                  <td
                    key={`${likelihood}-${impact}`}
                    className={`w-24 h-16 ${getCellColor(
                      likelihood,
                      impact
                    )} bg-opacity-30 border border-gray-200`}
                  >
                    <div className="flex flex-wrap gap-1 p-1 justify-center">
                      {cellRisks.map((risk) => (
                        <div
                          key={risk.id}
                          title={risk.title}
                          className="w-6 h-6 rounded-full bg-gray-800 text-white text-xs flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                        >
                          {risk.title.charAt(0)}
                        </div>
                      ))}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex justify-center mt-4 gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-400 rounded"></div>
          <span>Low (1-5)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-yellow-400 rounded"></div>
          <span>Medium (6-11)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-orange-500 rounded"></div>
          <span>High (12-19)</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Critical (20-25)</span>
        </div>
      </div>
    </div>
  );
}

// Risk Form Component
interface RiskFormProps {
  risk?: RiskItem;
  onSubmit: (risk: RiskItem) => void;
  onCancel: () => void;
}

function RiskForm({ risk, onSubmit, onCancel }: RiskFormProps) {
  const [title, setTitle] = useState(risk?.title || '');
  const [description, setDescription] = useState(risk?.description || '');
  const [category, setCategory] = useState<FindingCategory>(
    risk?.category || 'commercial'
  );
  const [likelihood, setLikelihood] = useState<RiskLikelihood>(
    risk?.likelihood || 'possible'
  );
  const [impact, setImpact] = useState<RiskImpact>(risk?.impact || 'moderate');
  const [mitigation, setMitigation] = useState(risk?.mitigation_strategy || '');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit({
      id: risk?.id || `r-${Date.now()}`,
      title,
      description,
      category,
      likelihood,
      impact,
      mitigation_strategy: mitigation,
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
            placeholder="Risk title"
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
            <option value="commercial">Commercial</option>
            <option value="financial">Financial</option>
            <option value="operational">Operational</option>
            <option value="technology">Technology</option>
            <option value="legal">Legal</option>
            <option value="hr">HR</option>
            <option value="regulatory">Regulatory</option>
            <option value="environmental">Environmental</option>
            <option value="tax">Tax</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Likelihood
          </label>
          <select
            value={likelihood}
            onChange={(e) => setLikelihood(e.target.value as RiskLikelihood)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="rare">Rare</option>
            <option value="unlikely">Unlikely</option>
            <option value="possible">Possible</option>
            <option value="likely">Likely</option>
            <option value="almost_certain">Almost Certain</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Impact
          </label>
          <select
            value={impact}
            onChange={(e) => setImpact(e.target.value as RiskImpact)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="minor">Minor</option>
            <option value="moderate">Moderate</option>
            <option value="major">Major</option>
            <option value="severe">Severe</option>
            <option value="catastrophic">Catastrophic</option>
          </select>
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
          placeholder="Describe the risk..."
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mitigation Strategy
        </label>
        <textarea
          value={mitigation}
          onChange={(e) => setMitigation(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="How to mitigate this risk..."
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
          {risk ? 'Update' : 'Add'} Risk
        </button>
      </div>
    </form>
  );
}

// Risk Card Component
interface RiskCardProps {
  risk: RiskItem & { score: number; level: string };
  isEditing: boolean;
  onEdit: () => void;
  onUpdate: (risk: RiskItem) => void;
  onDelete: () => void;
  onCancelEdit: () => void;
}

function RiskCard({
  risk,
  isEditing,
  onEdit,
  onUpdate,
  onDelete,
  onCancelEdit,
}: RiskCardProps) {
  if (isEditing) {
    return (
      <div className="p-4 border border-blue-200 bg-blue-50 rounded-lg">
        <RiskForm risk={risk} onSubmit={onUpdate} onCancel={onCancelEdit} />
      </div>
    );
  }

  const levelColors: Record<string, string> = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-green-100 text-green-800 border-green-200',
  };

  return (
    <div
      className={`p-4 border rounded-lg hover:shadow-sm transition-shadow ${levelColors[risk.level]}`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                levelColors[risk.level]
              }`}
            >
              {risk.level.toUpperCase()} (Score: {risk.score})
            </span>
            <span className="text-xs text-gray-500 capitalize">
              {risk.category}
            </span>
          </div>
          <h3 className="font-medium text-gray-900">{risk.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{risk.description}</p>
          <div className="flex gap-4 mt-2 text-xs text-gray-500">
            <span>
              Likelihood: <strong className="capitalize">{risk.likelihood.replace('_', ' ')}</strong>
            </span>
            <span>
              Impact: <strong className="capitalize">{risk.impact}</strong>
            </span>
          </div>
          {risk.mitigation_strategy && (
            <p className="text-sm text-blue-600 mt-2">
              Mitigation: {risk.mitigation_strategy}
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

// Helper Components
function RiskCountBadge({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    red: 'bg-red-100 text-red-800',
    orange: 'bg-orange-100 text-orange-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
  };

  return (
    <div className={`px-4 py-3 rounded-lg text-center ${colors[color]}`}>
      <div className="text-2xl font-bold">{count}</div>
      <div className="text-xs font-medium">{label}</div>
    </div>
  );
}

function getRiskLevel(score: number): string {
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

export default RiskMatrix;
