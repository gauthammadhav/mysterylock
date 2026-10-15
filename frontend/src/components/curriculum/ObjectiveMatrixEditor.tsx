"use client";

import React, { useState } from "react";
import {
  LearningObjectiveItem,
  BloomTaxonomyLevel,
} from "@/types/curriculum";
import {
  Check,
  CheckCircle2,
  Edit2,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  HelpCircle,
} from "lucide-react";

interface Props {
  objectives: LearningObjectiveItem[];
  onChange: (objectives: LearningObjectiveItem[]) => void;
}

const bloomColors: Record<BloomTaxonomyLevel, { bg: string; text: string; border: string }> = {
  Remember: { bg: "bg-[#F3F4F6]", text: "text-[#374151]", border: "border-[#E5E7EB]" },
  Understand: { bg: "bg-[#EBF4EE]", text: "text-[#166534]", border: "border-[#BBF7D0]" },
  Apply: { bg: "bg-[#EFF6FF]", text: "text-[#1D4ED8]", border: "border-[#BFDBFE]" },
  Analyze: { bg: "bg-[#FAF5FF]", text: "text-[#6B21A8]", border: "border-[#E9D5FF]" },
  Evaluate: { bg: "bg-[#FFF7ED]", text: "text-[#C2410C]", border: "border-[#FED7AA]" },
  Create: { bg: "bg-[#FEF2F2]", text: "text-[#991B1B]", border: "border-[#FECACA]" },
};

export default function ObjectiveMatrixEditor({ objectives, onChange }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editLevel, setEditLevel] = useState<BloomTaxonomyLevel>("Understand");

  const [newTitle, setNewTitle] = useState("");
  const [newLevel, setNewLevel] = useState<BloomTaxonomyLevel>("Apply");
  const [isAdding, setIsAdding] = useState(false);

  const toggleSelect = (id: string) => {
    onChange(
      objectives.map((obj) =>
        obj.id === id ? { ...obj, is_selected: !obj.is_selected } : obj
      )
    );
  };

  const removeObjective = (id: string) => {
    onChange(objectives.filter((obj) => obj.id !== id));
  };

  const startEdit = (obj: LearningObjectiveItem) => {
    setEditingId(obj.id);
    setEditTitle(obj.title);
    setEditLevel(obj.bloom_level);
  };

  const saveEdit = (id: string) => {
    if (!editTitle.trim()) return;
    onChange(
      objectives.map((obj) =>
        obj.id === id
          ? { ...obj, title: editTitle.trim(), bloom_level: editLevel }
          : obj
      )
    );
    setEditingId(null);
  };

  const addObjective = () => {
    if (!newTitle.trim()) return;
    const newObj: LearningObjectiveItem = {
      id: `lo-custom-${Date.now()}`,
      title: newTitle.trim(),
      description: "Custom teacher learning objective.",
      bloom_level: newLevel,
      is_selected: true,
    };
    onChange([...objectives, newObj]);
    setNewTitle("");
    setIsAdding(false);
  };

  const selectedCount = objectives.filter((o) => o.is_selected).length;

  return (
    <div className="bg-white rounded-3xl border border-[#E4E9E3] p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4E9E3]">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#287A52] shrink-0" />
            <h3 className="text-lg font-bold text-[#153D2E] tracking-tight">
              Learning Objective Matrix
            </h3>
          </div>
          <p className="text-xs text-[#68736B] mt-1 leading-relaxed">
            Review and approve the syllabus objectives extracted by RAG. Each selected objective
            will be mapped to a puzzle checkpoint.
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap shrink-0">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#EBF4EE] text-[#153D2E] border border-[#DCEBDD] shrink-0">
            {selectedCount} Selected for Mystery
          </span>
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border border-[#CCD5CD] text-[#153D2E] hover:bg-[#FAFBF8] transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isAdding ? "Close Form" : "Add Objective"}</span>
          </button>
        </div>
      </div>

      {/* Add Custom Objective Form */}
      {isAdding && (
        <div className="my-5 p-4 sm:p-5 rounded-2xl bg-[#FAFBF8] border border-[#DCEBDD] space-y-3">
          <div className="text-xs font-bold text-[#153D2E]">Add Custom Learning Objective</div>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Deduce the primary cause of system anomaly from circuit evidence"
              className="flex-1 min-w-0 px-3.5 py-2.5 text-xs rounded-xl border border-[#E4E9E3] bg-white text-[#202722] focus:border-[#287A52] focus:ring-1 focus:ring-[#287A52] outline-none"
            />
            <select
              value={newLevel}
              onChange={(e) => setNewLevel(e.target.value as BloomTaxonomyLevel)}
              className="px-3 py-2.5 text-xs rounded-xl border border-[#E4E9E3] bg-white text-[#202722] outline-none shrink-0"
            >
              <option value="Remember">Remember</option>
              <option value="Understand">Understand</option>
              <option value="Apply">Apply</option>
              <option value="Analyze">Analyze</option>
              <option value="Evaluate">Evaluate</option>
              <option value="Create">Create</option>
            </select>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="w-full sm:w-auto px-3.5 py-2.5 text-xs font-semibold text-[#68736B] hover:text-[#202722] rounded-xl transition-colors text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={addObjective}
                className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] rounded-xl transition-colors text-center"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Objectives List */}
      <div className="mt-6 space-y-3">
        {objectives.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#68736B]">
            Upload course materials above to extract learning objectives.
          </div>
        ) : (
          objectives.map((obj, index) => {
            const badge = bloomColors[obj.bloom_level] || bloomColors.Understand;
            const isEditing = editingId === obj.id;

            return (
              <div
                key={obj.id}
                className={`p-4 rounded-2xl border transition-all ${
                  obj.is_selected
                    ? "bg-white border-[#CCD5CD] shadow-xs"
                    : "bg-[#FAFBF8]/60 border-[#E4E9E3] opacity-60 hover:opacity-90"
                }`}
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#287A52] outline-none bg-white text-[#202722]"
                    />
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-[#68736B]">Bloom Level:</span>
                        <select
                          value={editLevel}
                          onChange={(e) => setEditLevel(e.target.value as BloomTaxonomyLevel)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-[#CCD5CD] bg-white text-[#202722]"
                        >
                          <option value="Remember">Remember</option>
                          <option value="Understand">Understand</option>
                          <option value="Apply">Apply</option>
                          <option value="Analyze">Analyze</option>
                          <option value="Evaluate">Evaluate</option>
                          <option value="Create">Create</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 text-xs font-semibold text-[#68736B] hover:text-[#202722] rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(obj.id)}
                          className="px-3.5 py-1 text-xs font-bold text-white bg-[#153D2E] hover:bg-[#1C523E] rounded-lg transition-colors"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => toggleSelect(obj.id)}
                        className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                          obj.is_selected
                            ? "bg-[#153D2E] border-[#153D2E] text-white"
                            : "bg-white border-[#CCD5CD] text-transparent hover:border-[#287A52]"
                        }`}
                        title={obj.is_selected ? "Deselect objective" : "Include in mystery"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-[10px] font-bold text-[#68736B] tracking-wider uppercase shrink-0">
                            LO-{index + 1}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badge.bg} ${badge.text} ${badge.border}`}
                          >
                            Bloom: {obj.bloom_level}
                          </span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#153D2E] leading-snug break-words">
                          {obj.title}
                        </h4>
                        {obj.source_excerpt && (
                          <p className="mt-1.5 text-[11px] text-[#68736B] italic border-l-2 border-[#DCEBDD] pl-2 line-clamp-2 break-words">
                            {obj.source_excerpt}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      <button
                        type="button"
                        onClick={() => startEdit(obj)}
                        className="p-1.5 text-[#68736B] hover:text-[#153D2E] hover:bg-[#FAFBF8] rounded-lg transition-colors"
                        title="Edit objective"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeObjective(obj.id)}
                        className="p-1.5 text-[#68736B] hover:text-[#991B1B] hover:bg-[#FEF2F2] rounded-lg transition-colors"
                        title="Delete objective"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
