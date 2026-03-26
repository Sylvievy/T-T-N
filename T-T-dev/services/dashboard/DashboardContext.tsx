"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { format, subDays } from "date-fns";
interface FilterState {
  priority: string | null;
  status: string | null;
  user: string | null;
  assignedBy: string | null;
  search: string;
  tab: string | null;
  type: string | null;
  sortBy: string | null;
  sortOrder: "asc" | "desc";
  quickFilter:
    | "PastDue"
    | "DueToday"
    | "DueTomorrow"
    | "Unread"
    | "TodoCount"
    | null;
  dateRange: { from: string; to: string };
}

interface DashboardContextType {
  filters: FilterState;
  setFilter: (key: keyof FilterState, value: any) => void;
  setExclusiveFilter: (key: keyof FilterState, value: any) => void;
  setUserFilter: (user: string | null, type: string | null) => void;
  resetFilters: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined,
);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const initialFilterState: FilterState = {
    priority: null,
    status: null,
    user: null,
    assignedBy: null,
    search: "",
    tab: null,
    type: null,
    sortBy: null,
    sortOrder: "desc",
    quickFilter: null,
    dateRange: {
      from: format(subDays(new Date(), 7), "MM-dd-yyyy"),
      to: format(new Date(), "MM-dd-yyyy"),
    },
  };

  const [filters, setFilters] = useState<FilterState>(initialFilterState);

  const setFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [key]:
        key === "sortBy" || key === "sortOrder"
          ? value
          : prev[key] === value
            ? null
            : value,
    }));
  };

  const setExclusiveFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({
      ...prev,
      priority: null,
      status: null,
      user: null,
      assignedBy: null,
      type: null,
      quickFilter: null,
      [key]: prev[key] === value ? null : value,
    }));
  };

  const setUserFilter = (user: string | null, type: string | null) => {
    setFilters((prev) => ({
      ...prev,
      // Clear all other chart/stat filters
      priority: null,
      status: null,
      quickFilter: null,
      assignedBy: null,
      // Set the user and type (additive to each other)
      user: user,
      type: type,
    }));
  };

  const resetFilters = () => setFilters(initialFilterState);

  return (
    <DashboardContext.Provider
      value={{
        filters,
        setFilter,
        setExclusiveFilter,
        setUserFilter,
        resetFilters,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboardFilters = () => {
  const context = useContext(DashboardContext);
  if (!context)
    throw new Error("useDashboardFilters must be used within Provider");
  return context;
};
