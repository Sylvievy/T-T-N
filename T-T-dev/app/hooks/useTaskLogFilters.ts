import { useMemo, useState, useEffect } from "react";
import { TaskLog } from "@/services/GlobalParams";

export const useTaskLogFilters = (tasks: TaskLog[], filters: any) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTasks = useMemo(() => {
    const uniqueTasks = Array.from(
      new Map(tasks.map((task) => [task.TaskID, task])).values(),
    );
    return uniqueTasks.filter((task) => {
      const searchTerm = (filters.search || "").toLowerCase().trim();

      // 1. Search Logic
      const matchesSearch =
        !searchTerm ||
        (task.TaskTitle || "").toLowerCase().includes(searchTerm) ||
        (task.AssignedBy || "").toLowerCase().includes(searchTerm) ||
        (task.CurrentOwner || "").toLowerCase().includes(searchTerm) ||
        (task.StatusName || "").toLowerCase().includes(searchTerm) ||
        (task.TaskType || "").toLowerCase().includes(searchTerm);
      // 2. Metadata Filters

      const matchesPriority =
        !filters.priority || task.Priority?.trim() === filters.priority;

      const matchesStatus =
        !filters.status ||
        (task.StatusName?.trim() === "Proposed New Time"
          ? "Prop'd Time"
          : task.StatusName?.trim()) === filters.status;

      const matchesType =
        !filters.type || task.TaskType?.trim() === filters.type;

      const chartUser = filters.user?.trim();
      const matchesUser =
        !chartUser ||
        task.CurrentOwner?.trim() === chartUser ||
        task.AssignedBy?.trim() === chartUser ||
        task.TaskOwnerUserID === chartUser;

      let matchesTab = true;
      if (filters.tab === "MyTasks") {
        matchesTab = task.MyTaskList === "1";
      } else if (filters.tab === "AssignedByMe") {
        matchesTab = task.AssignedByMe === "1";
      }

      let matchesQuickFilter = true;
      if (filters.quickFilter) {
        const today = new Date().toISOString().split("T")[0];
        const dueDate = task.TaskDueDate
          ? new Date(task.TaskDueDate).toISOString().split("T")[0]
          : null;

        switch (filters.quickFilter) {
          case "DueToday":
            matchesQuickFilter = task.IsDueToday === "1";
            break;
          case "DueTomorrow":
            matchesQuickFilter = task.IsDueTomorrow === "1";
            break;
          case "PastDue":
            matchesQuickFilter = task.IsPastDue === "1";
            break;
          case "Unread":
            matchesQuickFilter = task.IsUnread === "1";
            break;
          case "Todo":
          case "TodoCount": // Your items array uses "TodoCount" as a key
            matchesQuickFilter = task.StatusName !== "Completed";
            break;
        }
      }

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesType &&
        matchesUser &&
        matchesTab &&
        matchesQuickFilter
      );
    });
  }, [tasks, filters]);

  //  Sort the ALREADY filtered tasks
  const sortedTasks = useMemo(() => {
    const { sortBy, sortOrder } = filters;
    if (!sortBy) return filteredTasks;

    return [...filteredTasks].sort((a, b) => {
      let valA: any = a[sortBy as keyof TaskLog] || "";
      let valB: any = b[sortBy as keyof TaskLog] || "";
      if (sortBy === "Priority") {
        const weight: any = { High: 3, Medium: 2, Low: 1 };
        valA = weight[valA] || 0;
        valB = weight[valB] || 0;
      }

      if (sortBy === "TaskDueDate") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredTasks, filters.sortBy, filters.sortOrder]);

  //  Paginate the already sorted tasks
  const totalPages = Math.max(1, Math.ceil(sortedTasks.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;

  const paginatedTasks = sortedTasks.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  return {
    paginatedTasks,
    totalPages,
    currentPage,
    setCurrentPage,
    totalCount: filteredTasks.length,
  };
};
