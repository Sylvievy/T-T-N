import { postRequest } from "../apiConfig";
import {
  TypePriority,
  TaskStatus,
  ByUsers,
  SummaryCount,
  Comments,
  TaskHistoryCategory,
} from "./DashboardParams";

import { InsertCommentParams, TaskLog } from "../GlobalParams";

export const GetTasksByTypePriority = () =>
  postRequest<TypePriority[]>("GetTasksByTypePriority");

export const GetTasksByStatus = () =>
  postRequest<TaskStatus[]>("GetTasksByStatus");

export const GetSummaryCounts = () =>
  postRequest<SummaryCount>("GetSummaryCounts");

export const GetTasksByUsers = () => postRequest<ByUsers[]>("GetTasksByUsers");

export const GetCountByTaskList = () =>
  postRequest<TaskLog[]>("GetCountByTaskList");

export const GetTaskHistoryCategoryWise = (
  beginDate: string,
  endDate: string,
) => {
  return postRequest<TaskHistoryCategory[]>("GetTaskHistoryCategoryWise", {
    BeginDate: beginDate,
    EndDate: endDate,
  });
};

export const GetComments = () => postRequest<Comments[]>("GetComments");

export const InsertComment = (params: InsertCommentParams) => {
  return postRequest<any>("InsertComment", { json: params }, "adddata");
};
