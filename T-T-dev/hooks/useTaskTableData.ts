"use client";

import { useMemo } from "react";
import { useTaskQ } from "@/services/taskQ/TaskQContext";

export const useTaskTableData = () => {
  const { tasks, searchQuery, filters, activeTab } = useTaskQ();

  const processedData = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    // --- PHASE 1: SEARCH & SIDEBAR FILTERS ---
    let baseFiltered = tasks.filter((task: any) => {
      const query = searchQuery.toLowerCase().trim();

      let matchesSearch = true;
      if (query) {
        matchesSearch =
          task.TaskID?.toString().includes(query) ||
          task.TaskTitle?.toLowerCase().includes(query) ||
          (task.AssignedBy || "").toLowerCase().includes(query) ||
          (task.CurrentOwner || "").toLowerCase().includes(query) ||
          (task.TaskType ?? "").toLowerCase().includes(query) ||
          (task.Priority ?? "").toLowerCase().includes(query) ||
          (task.StatusName ?? "").toLowerCase().includes(query);
      }
      const matchesPriority =
        (filters.priority?.length || 0) === 0 ||
        filters.priority?.includes(task.Priority);

      const matchesStatus =
        (filters.status?.length || 0) === 0 ||
        filters.status?.includes(task.StatusName);

      const matchesOwner =
        (filters.owner?.length || 0) === 0 ||
        filters.owner?.includes(task.CurrentOwner);

      const matchesCategory =
        !filters.category || task.TaskType === filters.category;

      const matchesAssignedBy =
        (filters.assignedBy?.length || 0) === 0 ||
        filters.assignedBy?.includes(task.AssignedBy);

      const matchesColumnFilters = Object.entries(filters.columnFilters).every(
        ([colId, filterValue]) => {
          if (!filterValue) return true;
          let taskValue = "";
          if (colId === "AssignedBy") taskValue = task.AssignedBy || "";
          else if (colId === "CurrentOwner")
            taskValue = task.CurrentOwner || "";
          else taskValue = (task[colId] ?? "").toString();

          return taskValue.toLowerCase().includes(filterValue.toLowerCase());
        },
      );

      return (
        matchesSearch &&
        matchesPriority &&
        matchesStatus &&
        matchesOwner &&
        matchesCategory &&
        matchesColumnFilters &&
        matchesAssignedBy
      );
    });

    // --- PHASE 2: HYBRID TAB FILTERING ---
    const getTabFilteredData = (data: any[], tab: string) => {
      return data.filter((task) => {
        const dueDate = task.TaskDueDate ? new Date(task.TaskDueDate) : null;
        if (dueDate) dueDate.setHours(0, 0, 0, 0);

        switch (tab) {
          case "Today":
            return (
              task.IsDueToday === "1" ||
              task.IsDueToday === true ||
              dueDate?.getTime() === now.getTime()
            );

          case "Past Due":
            const hasPastFlag =
              task.IsPastDue === "1" || task.IsPastDue === true;
            const isActuallyPast =
              dueDate && dueDate < now && task.StatusName !== "Completed";
            return hasPastFlag || isActuallyPast;

          case "Upcoming":
            return task.IsDueTomorrow === "1" || (dueDate && dueDate > now);

          case "All":
          default:
            return true;
        }
      });
    };

    const tabCounts = {
      All: baseFiltered.length,
      Today: getTabFilteredData(baseFiltered, "Today").length,
      "Past Due": getTabFilteredData(baseFiltered, "Past Due").length,
      Upcoming: getTabFilteredData(baseFiltered, "Upcoming").length,
    };

    let currentTabTasks = getTabFilteredData(baseFiltered, activeTab);

    // --- PHASE 3: SORTING ---
    if (filters.sortBy && filters.sortBy !== "None") {
      currentTabTasks = [...currentTabTasks].sort((a: any, b: any) => {
        const field = filters.sortBy;
        const order = filters.sortOrder === "asc" ? 1 : -1;

        let valA = a[field];
        let valB = b[field];

        if (field === "AssignedBy") {
          valA = a.AssignedBy;
          valB = b.AssignedBy;
        }
        if (field === "CurrentOwner") {
          valA = a.CurrentOwner;
          valB = b.CurrentOwner;
        }

        if (field === "TaskUpdateTime" || field === "TaskDueDate") {
          const timeA = valA ? new Date(valA).getTime() : 0;
          const timeB = valB ? new Date(valB).getTime() : 0;
          return (timeA - timeB) * order;
        }

        valA = (valA ?? "").toString().toLowerCase();
        valB = (valB ?? "").toString().toLowerCase();

        return valA < valB ? -1 * order : valA > valB ? 1 * order : 0;
      });
    }

    // --- PHASE 4: SECTION GROUPING ---
    const groupedSections: Record<string, any[]> = {};

    currentTabTasks.forEach((task) => {
      let sectionKey = "Tasks";

      if (filters.groupBy === "Date") {
        const dueDate = task.TaskDueDate ? new Date(task.TaskDueDate) : null;
        sectionKey = dueDate
          ? dueDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })
          : "No Date";
      } else if (filters.groupBy === "Importance")
        sectionKey = task.Priority || "No Priority";
      else if (filters.groupBy === "Status")
        sectionKey = task.StatusName || "No Status";
      else if (filters.groupBy === "Category")
        sectionKey = task.TaskType || "Uncategorized";
      else if (filters.groupBy === "Current Owner")
        sectionKey = task.CurrentOwner || "Unassigned";
      else if (filters.groupBy === "None") {
        sectionKey = "All Tasks";
      }
      if (!groupedSections[sectionKey]) groupedSections[sectionKey] = [];
      groupedSections[sectionKey].push(task);
    });

    return { tabCounts, groupedSections, currentTabTasks };
  }, [tasks, searchQuery, filters, activeTab]);

  return processedData;
};
