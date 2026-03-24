import { Table } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import PriorityFlag from "./PriorityFlag";
import { Badge } from "@/components/ui/badge";
import { cn, formatDate, formatLocalDateTime } from "@/lib/utils";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import EditTaskForm from "@/components/_taskQcomponents/task/EditTaskForm";

interface TaskTableRowProps {
  task: any;
  table: Table<any>;
  onClick: () => void;
  onDoubleClick: () => void;
  sectionLabel: string;
  index: number;
}

export const TaskTableRow = ({
  task,
  table,
  onClick,
  onDoubleClick,
  sectionLabel,
  index,
}: TaskTableRowProps) => {
  const {
    selectedTask,
    setSelectedTask,
    setLayoutType,
    openPopup,
    updateReadStatus,
  } = useTaskQ();
  const isSelected = selectedTask?.TaskID === task.TaskID;

  const [isEditing, setIsEditing] = useState(false);

  const isUnread =
    task.IsRead === false ||
    task.IsRead === "0" ||
    task.IsUnread === "1" ||
    task.IsRead === 0;

  const handleInternalClick = () => {
    if (isUnread) {
      updateReadStatus(Number(task.TaskID));
    }
    onClick();
  };
  return (
    <>
      <tr
        key={`${sectionLabel}-${task.TaskID}-${index}`}
        onClick={handleInternalClick}
        onDoubleClick={() => {
          if (isUnread) updateReadStatus(Number(task.TaskID));
          setSelectedTask(task);
          openPopup(task);
          setLayoutType("popup");
        }}
        className={cn(
          "hover:bg-slate-50 cursor-pointer border-b group transition-colors",
          isSelected
            ? "bg-[#e8efe9] border-l-4 border-l-[#a3bfaa]"
            : "bg-white",
          isUnread && "bg-slate-50/80 font-medium text-slate-900",
        )}
      >
        {table.getHeaderGroups()[0].headers.map((header) => (
          <td
            key={header.id}
            style={{ width: header.getSize() }}
            className={cn(
              "px-3 py-0.5 overflow-hidden whitespace-nowrap text-xs transition-all",
              isUnread
                ? "font-bold text-slate-900"
                : "font-medium text-slate-800",
            )}
          >
            {header.column.id === "TaskID" && (
              <span className="tabular-nums text-xs">{task.TaskID}</span>
            )}
            {header.column.id === "AssignedBy" && (
              <span className="text-xs">{task.AssignedBy || "N/A"}</span>
            )}
            {header.column.id === "TaskTitle" && (
              <span className="truncate text-xs block">
                {task.TaskTitle || "No Title"}
              </span>
            )}
            {header.column.id === "TaskDueDate" && (
              <span className="tabular-nums text-xs">
                {formatDate(task.TaskDueDate)}
              </span>
            )}
            {header.column.id === "CurrentOwner" && (
              <span className="text-xs">
                {task.CurrentOwner || "Unassigned"}
              </span>
            )}
            {header.column.id === "Priority" && (
              <PriorityFlag priority={task.Priority || "Normal"} />
            )}
            {header.column.id === "TaskType" && (
              <span className="text-xs text-slate-700">
                {task.TaskType || "Other"}
              </span>
            )}
            {header.column.id === "StatusName" && (
              <Badge
                variant="outline"
                className="text-[10px] uppercase font-bold bg-slate-50"
              >
                {task.StatusName?.toLowerCase() === "proposed new time"
                  ? "Prop'd Time"
                  : task.StatusName || "Pending"}
              </Badge>
            )}
            {header.column.id === "TaskUpdateTime" && (
              <span className="tabular-nums text-[11px] text-slate-500">
                {task.TaskUpdateTime
                  ? formatLocalDateTime(task.TaskUpdateTime)
                  : "—"}
              </span>
            )}
            {header.column.id === "actions" && (
              <div className="opacity-0  rounded-md group-hover:opacity-100 flex justify-end">
                <Pencil
                  size={14}
                  className="text-slate-700 hover:text-green-700 cursor-pointer "
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                />
              </div>
            )}
          </td>
        ))}
      </tr>

      {typeof window !== "undefined" &&
        isEditing &&
        createPortal(
          <div
            className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-600/20"
            onClick={() => setIsEditing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[500px] h-[80vh] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            >
              <EditTaskForm task={task} onClose={() => setIsEditing(false)} />
            </motion.div>
          </div>,
          document.body,
        )}
    </>
  );
};
