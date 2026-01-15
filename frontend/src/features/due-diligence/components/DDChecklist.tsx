/**
 * DD Checklist Component
 * Vertical-specific due diligence checklists
 */

import { useState, useEffect } from 'react';
import { dueDiligenceService } from '../services/dueDiligenceService';
import type { DDVertical, DDChecklist as ChecklistType, ChecklistItem } from '../types';

interface DDChecklistProps {
  vertical: DDVertical;
}

export function DDChecklist({ vertical }: DDChecklistProps) {
  const [checklist, setChecklist] = useState<ChecklistType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadChecklist();
  }, [vertical]);

  async function loadChecklist() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dueDiligenceService.getChecklist(vertical);
      setChecklist(response.checklist);
      // Expand all categories by default
      setExpandedCategories(new Set(Object.keys(response.checklist.categories)));
    } catch (err: any) {
      setError(err.message || 'Failed to load checklist');
      // Use mock data if API fails
      setChecklist(getMockChecklist(vertical));
      setExpandedCategories(new Set(Object.keys(getMockChecklist(vertical).categories)));
    } finally {
      setIsLoading(false);
    }
  }

  function toggleItem(itemId: string) {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId);
    } else {
      newCompleted.add(itemId);
    }
    setCompletedItems(newCompleted);
  }

  function toggleCategory(category: string) {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  }

  // Calculate progress
  const totalItems = checklist
    ? Object.values(checklist.categories).flat().length
    : 0;
  const completedCount = completedItems.size;
  const progressPercent = totalItems > 0 ? (completedCount / totalItems) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading checklist...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-lg font-semibold">DD Checklist</h2>
          <p className="text-sm text-gray-600">
            {vertical.replace('_', ' ').charAt(0).toUpperCase() +
              vertical.replace('_', ' ').slice(1)}{' '}
            industry checklist
          </p>
        </div>
        <button
          onClick={loadChecklist}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700 text-sm">
          {error} (Using default checklist)
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6 bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Overall Progress
          </span>
          <span className="text-sm text-gray-600">
            {completedCount} / {totalItems} items completed
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-blue-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="text-right mt-1 text-xs text-gray-500">
          {progressPercent.toFixed(0)}% complete
        </div>
      </div>

      {/* Checklist Categories */}
      {checklist && (
        <div className="space-y-4">
          {Object.entries(checklist.categories).map(([category, items]) => {
            const categoryCompleted = items.filter((item) =>
              completedItems.has(item.id)
            ).length;
            const isExpanded = expandedCategories.has(category);

            return (
              <div
                key={category}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 bg-gray-50 flex justify-between items-center hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {isExpanded ? '▼' : '▶'}
                    </span>
                    <span className="font-medium text-gray-900 capitalize">
                      {category.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({categoryCompleted}/{items.length})
                    </span>
                  </div>
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          items.length > 0
                            ? (categoryCompleted / items.length) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </button>

                {/* Category Items */}
                {isExpanded && (
                  <div className="p-4 space-y-2">
                    {items.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        isCompleted={completedItems.has(item.id)}
                        onToggle={() => toggleItem(item.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Actions */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => {
            if (checklist) {
              const allItems = Object.values(checklist.categories)
                .flat()
                .map((item) => item.id);
              setCompletedItems(new Set(allItems));
            }
          }}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Mark All Complete
        </button>
        <button
          onClick={() => setCompletedItems(new Set())}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Reset All
        </button>
        <button
          onClick={() => {
            if (checklist) {
              setExpandedCategories(
                new Set(Object.keys(checklist.categories))
              );
            }
          }}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Expand All
        </button>
        <button
          onClick={() => setExpandedCategories(new Set())}
          className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Collapse All
        </button>
      </div>
    </div>
  );
}

// Checklist Item Row Component
function ChecklistItemRow({
  item,
  isCompleted,
  onToggle,
}: {
  item: ChecklistItem;
  isCompleted: boolean;
  onToggle: () => void;
}) {
  const priorityColors: Record<string, string> = {
    high: 'text-red-600',
    medium: 'text-yellow-600',
    low: 'text-green-600',
  };

  return (
    <label
      className={`flex items-start gap-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={isCompleted}
        onChange={onToggle}
        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      <div className="flex-1">
        <span
          className={`text-sm ${
            isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
          }`}
        >
          {item.item}
        </span>
        <div className="flex gap-2 mt-1">
          {item.priority && (
            <span
              className={`text-xs font-medium capitalize ${
                priorityColors[item.priority] || 'text-gray-500'
              }`}
            >
              {item.priority} priority
            </span>
          )}
        </div>
      </div>
    </label>
  );
}

// Mock checklist data for fallback
function getMockChecklist(vertical: DDVertical): ChecklistType {
  const baseChecklist: ChecklistType = {
    vertical,
    categories: {
      financial: [
        { id: 'f1', category: 'financial', item: 'Review 3 years of audited financial statements', priority: 'high', status: 'pending' },
        { id: 'f2', category: 'financial', item: 'Analyze revenue recognition policies', priority: 'high', status: 'pending' },
        { id: 'f3', category: 'financial', item: 'Verify accounts receivable aging', priority: 'medium', status: 'pending' },
        { id: 'f4', category: 'financial', item: 'Review working capital trends', priority: 'medium', status: 'pending' },
        { id: 'f5', category: 'financial', item: 'Analyze EBITDA adjustments', priority: 'high', status: 'pending' },
      ],
      legal: [
        { id: 'l1', category: 'legal', item: 'Review material contracts', priority: 'high', status: 'pending' },
        { id: 'l2', category: 'legal', item: 'Check pending litigation', priority: 'high', status: 'pending' },
        { id: 'l3', category: 'legal', item: 'Verify intellectual property rights', priority: 'medium', status: 'pending' },
        { id: 'l4', category: 'legal', item: 'Review employment agreements', priority: 'medium', status: 'pending' },
      ],
      operational: [
        { id: 'o1', category: 'operational', item: 'Assess key operational processes', priority: 'medium', status: 'pending' },
        { id: 'o2', category: 'operational', item: 'Review supplier relationships', priority: 'medium', status: 'pending' },
        { id: 'o3', category: 'operational', item: 'Evaluate capacity and utilization', priority: 'low', status: 'pending' },
      ],
      commercial: [
        { id: 'c1', category: 'commercial', item: 'Analyze customer concentration', priority: 'high', status: 'pending' },
        { id: 'c2', category: 'commercial', item: 'Review pricing strategy', priority: 'medium', status: 'pending' },
        { id: 'c3', category: 'commercial', item: 'Assess competitive landscape', priority: 'medium', status: 'pending' },
      ],
    },
    total_items: 14,
  };

  // Add vertical-specific items
  if (vertical === 'technology') {
    baseChecklist.categories.technology = [
      { id: 't1', category: 'technology', item: 'Review tech stack and architecture', priority: 'high', status: 'pending' },
      { id: 't2', category: 'technology', item: 'Assess cybersecurity measures', priority: 'high', status: 'pending' },
      { id: 't3', category: 'technology', item: 'Evaluate technical debt', priority: 'medium', status: 'pending' },
      { id: 't4', category: 'technology', item: 'Review source code quality', priority: 'medium', status: 'pending' },
      { id: 't5', category: 'technology', item: 'Assess scalability', priority: 'medium', status: 'pending' },
    ];
  } else if (vertical === 'healthcare') {
    baseChecklist.categories.regulatory = [
      { id: 'r1', category: 'regulatory', item: 'Verify HIPAA compliance', priority: 'high', status: 'pending' },
      { id: 'r2', category: 'regulatory', item: 'Review FDA approvals/clearances', priority: 'high', status: 'pending' },
      { id: 'r3', category: 'regulatory', item: 'Check clinical trial data', priority: 'medium', status: 'pending' },
      { id: 'r4', category: 'regulatory', item: 'Assess reimbursement risks', priority: 'high', status: 'pending' },
    ];
  } else if (vertical === 'manufacturing') {
    baseChecklist.categories.environmental = [
      { id: 'e1', category: 'environmental', item: 'Review environmental permits', priority: 'high', status: 'pending' },
      { id: 'e2', category: 'environmental', item: 'Assess remediation liabilities', priority: 'high', status: 'pending' },
      { id: 'e3', category: 'environmental', item: 'Evaluate safety records', priority: 'medium', status: 'pending' },
    ];
    baseChecklist.categories.supply_chain = [
      { id: 's1', category: 'supply_chain', item: 'Map critical suppliers', priority: 'high', status: 'pending' },
      { id: 's2', category: 'supply_chain', item: 'Assess inventory management', priority: 'medium', status: 'pending' },
      { id: 's3', category: 'supply_chain', item: 'Review logistics and distribution', priority: 'medium', status: 'pending' },
    ];
  } else if (vertical === 'real_estate') {
    baseChecklist.categories.property = [
      { id: 'p1', category: 'property', item: 'Review property appraisals', priority: 'high', status: 'pending' },
      { id: 'p2', category: 'property', item: 'Assess tenant quality and lease terms', priority: 'high', status: 'pending' },
      { id: 'p3', category: 'property', item: 'Evaluate capital expenditure needs', priority: 'medium', status: 'pending' },
      { id: 'p4', category: 'property', item: 'Check zoning and entitlements', priority: 'medium', status: 'pending' },
    ];
  }

  return baseChecklist;
}

export default DDChecklist;
