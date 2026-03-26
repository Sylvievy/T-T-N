"use client";

import { Trash2, Square, CheckSquare } from "lucide-react";
import { Checklist } from "@/services/GlobalParams";
import { cn } from "@/lib/utils";
import React, { useState, useRef, useEffect } from "react";

interface ChecklistProps {
  items: (Checklist | string)[];
  newItem: string;
  setNewItem: (val: string) => void;
  onAdd: () => void;
  onRemove: (index: number, checklistId?: number) => void;
  onToggle: (
    index: number,
    checklistId?: number,
    currentStatus?: boolean,
  ) => void;
}

export const AddTaskChecklist = ({
  items,
  newItem,
  setNewItem,
  onAdd,
  onRemove,
  onToggle,
}: ChecklistProps) => {
  const [optimisticState, setOptimisticState] = useState<
    Record<string, boolean>
  >({});
  const [activeInputIndex, setActiveInputIndex] = useState<number | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const newInputRef = useRef<HTMLInputElement | null>(null);

  // Focus the new input at the bottom whenever it becomes active
  useEffect(() => {
    if (activeInputIndex === null) {
      newInputRef.current?.focus();
    }
  }, [items.length, activeInputIndex]);

  const handleToggle = (
    e: React.MouseEvent,
    i: number,
    uniqueKey: string,
    checkId: number | undefined,
    isCompleted: boolean,
  ) => {
    e.stopPropagation();
    setOptimisticState((prev) => ({ ...prev, [uniqueKey]: !isCompleted }));
    onToggle(i, checkId, isCompleted);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (newItem.trim()) {
        onAdd();
        setTimeout(() => newInputRef.current?.focus(), 50);
      }
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      {/* Existing items */}
      <div className="divide-y divide-slate-100">
        {items.map((item, i) => {
          const isObject = typeof item !== "string";
          const text = isObject
            ? (item as Checklist).ItemText
            : (item as string);
          const checkId = isObject
            ? Number((item as Checklist).CheckListItemID)
            : undefined;
          const uniqueKey = isObject ? `api-${checkId}` : `local-${i}`;
          const rawCompleted = isObject
            ? Boolean((item as Checklist).ItemIsCompleted)
            : false;
          const isCompleted =
            uniqueKey in optimisticState
              ? optimisticState[uniqueKey]
              : rawCompleted;

          return (
            <div
              key={uniqueKey}
              className="flex items-center justify-between group py-1 px-3 hover:bg-slate-50 transition-all cursor-pointer"
              onClick={(e) =>
                handleToggle(e, i, uniqueKey, checkId, isCompleted)
              }
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isCompleted ? (
                  <CheckSquare size={15} className="text-[#30493b] shrink-0" />
                ) : (
                  <Square size={15} className="text-slate-300 shrink-0" />
                )}
                <span
                  className={cn(
                    "text-xs truncate transition-all",
                    isCompleted
                      ? "text-slate-400 line-through"
                      : "text-slate-600",
                  )}
                >
                  {text}
                </span>
              </div>

              {/* <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onRemove(i, checkId);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={13} />
              </button> */}
            </div>
          );
        })}

        {/* New item input — always at the bottom, inline with the list */}
        <div className="flex items-center gap-2 px-3 py-1 group">
          <Square size={15} className="text-slate-200 shrink-0" />
          <input
            ref={newInputRef}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              items.length === 0 ? "Add a to-do item..." : "New item..."
            }
            className="flex-1 text-xs bg-transparent outline-none text-slate-600 placeholder:text-slate-300"
          />
        </div>
      </div>
    </div>
  );
};
