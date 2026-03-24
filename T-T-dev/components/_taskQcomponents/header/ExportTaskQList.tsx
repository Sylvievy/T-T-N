"use client";

import React from "react";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { useTaskQ } from "@/services/taskQ/TaskQContext";

interface ExportTaskQListProps {
  isCollapsed?: boolean;
}

const ExportTaskQList = ({ isCollapsed }: ExportTaskQListProps) => {
  const { tasks, activeFolder } = useTaskQ();

  const handleExport = () => {
    if (!tasks || tasks.length === 0) {
      alert("No tasks available to export.");
      return;
    }

    const dataToExport = tasks.map((task: any) => ({
      ID: task.id,
      Title: task.title,
      Status: task.status,
      "Due Date": task.dueDate
        ? new Date(task.dueDate).toLocaleDateString()
        : "N/A",
      Category: task.category || "General",
      Description: task.description || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tasks");

    const fileName = `Tasks_${activeFolder}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button
      variant="ghost"
      onClick={handleExport}
      size={isCollapsed ? "icon" : "sm"}
      className={`hover:bg-[slate]-700 text-slate-700 flex items-center gap-2 `}
      title="Export to Excel"
    >
      <Download size={18} />
    </Button>
  );
};

export default ExportTaskQList;
