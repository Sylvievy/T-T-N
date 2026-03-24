"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import * as dashboardService from "./DashboardService";
import { useDashboardFilters } from "./DashboardContext";
import {
  TypePriority,
  TaskStatus,
  ByUsers,
  SummaryCount,
  Comments,
  TaskHistoryCategory,
} from "./DashboardParams";
import { TaskLog } from "../GlobalParams";

export const useDashboardData = () => {
  const { filters } = useDashboardFilters();
  const [data, setData] = useState({
    typePriority: [] as TypePriority[],
    taskLog: [] as TaskLog[],
    tasksByUsers: [] as ByUsers[],
    taskStatus: [] as TaskStatus[],
    comments: [] as Comments[],
    summary: {} as SummaryCount,
    loading: true,
    error: null as string | null,
    historyData: [] as TaskHistoryCategory[],
  });

  // const addComment = async (taskId: string, text: string) => {
  //   try {
  //     const success = await dashboardService.InsertComment({
  //       TaskID: parseInt(taskId),
  //       CommentText: text,
  //     });

  //     if (success) {
  //       const newComment = {
  //         TaskID: taskId,
  //         CommentID: Date.now().toString(), // Temp ID
  //         CommentText: text,
  //         CommentedDate: new Date().toISOString(),
  //         CommentedByUserId: localStorage.getItem("taskQ_user_id") || "",
  //         AspNetUserId: localStorage.getItem("taskQ_user_id") || "",
  //         CommentedByName: localStorage.getItem("taskQ_user_name") || "Me",
  //       };

  //       setData((prev) => ({
  //         ...prev,
  //         comments: [...prev.comments, newComment as any],
  //       }));
  //       return true;
  //     }
  //     return false;
  //   } catch (err) {
  //     console.error("Insert Error:", err);
  //     return false;
  //   }
  // };

  const fetchAll = useCallback(async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("taskQ_bearer_token");
    if (!token) {
      setData((prev) => ({ ...prev, loading: false, error: "Please login" }));
      return;
    }

    try {
      const [priority, status, summaryRaw, users, list, comments, history] =
        await Promise.all([
          dashboardService.GetTasksByTypePriority(),
          dashboardService.GetTasksByStatus(),
          dashboardService.GetSummaryCounts(),
          dashboardService.GetTasksByUsers(),
          dashboardService.GetCountByTaskList(),
          dashboardService.GetComments(),
          dashboardService.GetTaskHistoryCategoryWise(
            filters.dateRange.from,
            filters.dateRange.to,
          ),
        ]);

      const normalizedSummary = Array.isArray(summaryRaw)
        ? summaryRaw[0]
        : summaryRaw;

      setData({
        typePriority: priority,
        taskStatus: status,
        summary: normalizedSummary || {},
        tasksByUsers: users,
        taskLog: list,
        comments: comments,
        loading: false,
        error: null,
        historyData: history,
      });
    } catch (err) {
      setData((prev) => ({ ...prev, loading: false, error: "Failed to load" }));
    }
  }, [filters.dateRange]); // Only recreate if dateRange changes

  // 2. Initial fetch and dateRange change trigger
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addComment = async (taskId: string, text: string) => {
    try {
      const success = await dashboardService.InsertComment({
        TaskID: parseInt(taskId),
        CommentText: text,
      });

      if (success) {
        // Re-fetch everything to ensure sync (or just comments if you want to be light)
        await fetchAll();
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  };

  const filteredTaskLog = useMemo(() => data.taskLog, [data.taskLog]);

  return {
    ...data,
    addComment,
    refresh: fetchAll,
    taskLog: filteredTaskLog,
  };
};
