export type DashboardRequestParam =
  | "GetTasksByTypePriority"
  | "GetTasksByStatus"
  | "GetSummaryCounts"
  | "GetTasksByUsers"
  | "GetTaskHistoryCategoryWise"
  | "GetComments";

export interface TypePriority {
  TaskType: string;
  Priority: string;
  CurrentOwnerName: string;
  NextOwnerName: string | null;
}

export interface TaskStatus {
  TaskID: string;
  StatusName: string;
  CurrentOwnerName: string;
  NextOwnerName: string | null;
}

export interface ByUsers {
  UserName: string;
  TaskTypeName: string;
  ColorCode: string | null;
  TotalTasks: number;
}

export interface SummaryCount {
  DueToday: number;
  DueTomorrow: number;
  PastDue: number;
  Unread: number;
  TodoCount: number;
}

export interface TaskHistoryCategory {
  EndDate: string;
  Category: string;
  ActiveTasks: number;
  NewTasks: number;
  CompletedTasks: number;
  TasksWithActivity: number;
}

export interface Comments {
  TaskID: string;
  TaskTitle: string;
  CommentID: string;
  CommentText: string;
  CommentedDate: string;
  CommentedByUserId: string;
  UserId: string | null;
  CommentedByName: string;
  IsSystemComment: boolean;
}

export interface CommentsCount {
  TaskID: string;
  TaskTitle: string;
  CommentCount: string;
}
