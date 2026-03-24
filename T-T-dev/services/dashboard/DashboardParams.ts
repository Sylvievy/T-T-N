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
  NextOwnerName: string;
}

export interface TaskStatus {
  StatusName: string;
  CurrentOwnerName: string;
  NextOwnerName: string;
}

export interface ByUsers {
  UserName: string;
  TaskTypeName: string;
  ColorCode: string | null;
  TotalTasks: string;
}

export interface SummaryCount {
  DueToday: string;
  DueTomorrow: string;
  PastDue: string;
  Completed: string;
  Unread: string;
  TodoCount: string;
}

export interface TaskHistoryCategory {
  EndDate: string;
  Category: string;
  ActiveTasks: string;
  NewTasks: string;
  CompletedTasks: string;
  TasksWithActivity: string;
}

export interface Comments {
  TaskID: string;
  TaskTitle: string;
  CommentID: string;
  CommentText: string;
  CommentedDate: string;
  CommentedByUserId: string;
  AspNetUserId: string;
  CommentedByName: string;
  IsSystemComment: boolean;
}

export interface CommentsCount {
  TaskID: string;
  TaskTitle: string;
  CommentCount: string;
}
