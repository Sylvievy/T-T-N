"use client";

import React from "react";
import { Square, CheckSquare } from "lucide-react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { cn } from "@/lib/utils";

interface TaskChecklistListProps {
  taskOverride?: any;
}

export const TaskChecklistList = ({ taskOverride }: TaskChecklistListProps) => {
  const { checklist, selectedTask: contextTask } = useTaskQ();
  const task = taskOverride || contextTask;

  const filteredChecklist = checklist.filter(
    (item) => String(item.TaskID) === String(task?.TaskID),
  );

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredChecklist.length === 0 ? (
          <div className="flex justify-center items-center h-full opacity-40">
            <span className="text-xs text-[#30493b] font-bold tracking-widest uppercase">
              No items for this task
            </span>
          </div>
        ) : (
          <div className="flex flex-col">
            {filteredChecklist.map((item) => (
              <div
                key={item.CheckListItemID}
                className="flex items-center group px-4 hover:bg-slate-50 transition-colors border-b border-slate-200"
              >
                <div className="py-1.5 pr-4 flex shrink-0 items-center justify-center">
                  {item.ItemIsCompleted ? (
                    <CheckSquare
                      size={20}
                      className="text-[#30493b] bg-[#e8efe9] rounded-[4px]"
                    />
                  ) : (
                    <div className="h-4 w-4 border-2 border-slate-300 rounded-sm" />
                  )}
                </div>

                <div className="flex-1 py-1.5   ">
                  <span
                    className={cn(
                      "text-[14px] leading-relaxed block",
                      item.ItemIsCompleted
                        ? "text-slate-400 line-through"
                        : "text-slate-600 font-normal",
                    )}
                  >
                    {item.ItemText}
                  </span>
                </div>
              </div>
            ))}

            <div className="flex items-center px-4 border-b border-slate-100 opacity-50">
              <div className="py-1.5 pr-4 flex shrink-0 items-center justify-center">
                <div className="h-4 w-4 border-2 border-slate-200 rounded-[4px]" />
              </div>
              <div className="flex-1 py-1.5 pl-4">
                <span className="text-[14px] text-slate-300">|</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
