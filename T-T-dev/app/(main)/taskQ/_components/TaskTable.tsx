"use client";

import React, { useEffect, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { TaskQTabs } from "@/components/_taskQcomponents/tasktable/TaskQTabs";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight } from "lucide-react"; // Added Loader2
import { useTaskTableData } from "@/hooks/useTaskTableData";
import { taskTableColumns } from "@/components/_taskQcomponents/tasktable/TaskTableColumns";
import { TaskTableRow } from "@/components/_taskQcomponents/tasktable/TaskTableRow";
import { ColumnFilter } from "@/components/_taskQcomponents/tasktable/ColumnFilter";

const TaskTable = ({}: { onLayoutChange: (type: any) => void }) => {
  const {
    setFilter,
    setColumnFilter,
    filters,
    layoutType,
    selectedTask,
    setLayoutType,
    setSelectedTask,
    activeTab,
    loading,
  } = useTaskQ();

  const { currentTabTasks, groupedSections } = useTaskTableData();
  const [collapsedSections, setCollapsedSections] = useState<
    Record<string, boolean>
  >({});

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const table = useReactTable({
    data: currentTabTasks,
    columns: taskTableColumns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
  });

  const handleRowClick = (task: any) => {
    if (layoutType === "list") setLayoutType("right");
    setSelectedTask(task);
  };

  const handleSort = (columnId: string) => {
    const sortByMapping: Record<string, string> = {
      TaskID: "TaskID",
      AssignedBy: "AssignedBy",
      TaskTitle: "TaskTitle",
      TaskDueDate: "TaskDueDate",
      CurrentOwner: "CurrentOwner",
      Priority: "Priority",
      TaskType: "TaskType",
      StatusName: "StatusName",
      TaskUpdateTime: "TaskUpdateTime",
    };

    const newSortBy = sortByMapping[columnId];
    if (!newSortBy) return;

    const isCurrent = filters.sortBy === newSortBy;
    const newOrder = isCurrent && filters.sortOrder === "asc" ? "desc" : "asc";

    setFilter("sortBy", newSortBy);
    setFilter("sortOrder", newOrder);
  };

  useEffect(() => {
    if ((layoutType === "right" || layoutType === "bottom") && !selectedTask) {
      if (currentTabTasks.length > 0) {
        setSelectedTask(currentTabTasks[0]);
      }
    }
  }, [currentTabTasks, layoutType, setSelectedTask, selectedTask]);

  return (
    <div className="flex flex-col h-full w-full bg-[#fdfdfd] overflow-hidden">
      <TaskQTabs />

      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full border-collapse table-fixed min-w-full">
          <thead className="sticky border-t top-0 bg-[#e8efe9] z-40 shadow-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    onClick={() => handleSort(header.column.id)}
                    className={cn(
                      "relative px-3 py-1.5 text-xs font-semibold text-slate-800 border-b select-none overflow-hidden cursor-pointer hover:bg-slate-200/50 transition-colors",
                      filters.sortBy === header.column.id && "bg-slate-200/50",
                    )}
                  >
                    {header.column.id === "actions" ? null : (
                      <ColumnFilter
                        title={flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        column={header.column.id}
                        currentFilter={filters.columnFilters[header.column.id]}
                        onFilterChange={(val: string) =>
                          setColumnFilter(header.column.id, val)
                        }
                        isSorted={filters.sortBy === header.column.id}
                        sortOrder={filters.sortOrder}
                        onSort={(newOrder: "asc" | "desc") => {
                          setFilter("sortBy", header.column.id);
                          setFilter("sortOrder", newOrder);
                        }}
                      />
                    )}
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="bg-white">
            {loading ? (
              /* LOADING STATE */
              Array.from({ length: 8 }).map((_, i) => (
                <tr
                  key={`loading-${i}`}
                  className="animate-pulse border-b border-slate-50"
                >
                  <td colSpan={taskTableColumns.length} className="px-4 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-4 w-4 bg-slate-100 rounded" />
                      <div className="h-3 w-1/3 bg-slate-100 rounded" />
                      <div className="h-3 w-20 bg-slate-50 rounded ml-auto" />
                    </div>
                  </td>
                </tr>
              ))
            ) : Object.keys(groupedSections).length > 0 ? (
              /* DATA STATE */
              Object.entries(groupedSections).map(([sectionName, tasks]) => (
                <React.Fragment key={sectionName}>
                  <tr
                    className="bg-slate-100 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => toggleSection(sectionName)}
                  >
                    <td
                      colSpan={taskTableColumns.length}
                      className="px-3 py-1 border-b"
                    >
                      <div className="flex items-center gap-2">
                        {collapsedSections[sectionName] ? (
                          <ChevronRight size={14} className="text-slate-500" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-500" />
                        )}
                        <span className="text-xs font-medium tracking-wider text-slate-700">
                          {sectionName}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 text-slate-700">
                          ({tasks.length})
                        </span>
                      </div>
                    </td>
                  </tr>

                  {!collapsedSections[sectionName] &&
                    tasks.map((task, index) => (
                      <TaskTableRow
                        key={`${sectionName}-${task.TaskID}-${index}`}
                        task={task}
                        table={table}
                        sectionLabel={sectionName}
                        index={index}
                        onClick={() => handleRowClick(task)}
                        onDoubleClick={() => {
                          setSelectedTask(task);
                          setLayoutType("popup");
                        }}
                      />
                    ))}
                </React.Fragment>
              ))
            ) : (
              /* EMPTY STATE */
              <tr>
                <td
                  colSpan={taskTableColumns.length}
                  className="py-32 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                    <span className="text-sm font-medium">
                      No tasks found in {activeTab}
                    </span>
                    <span className="text-xs">
                      Try adjusting your filters or search query
                    </span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
