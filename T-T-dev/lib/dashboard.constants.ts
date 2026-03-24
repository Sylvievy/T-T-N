import Tasklist from "@/app/(main)/dashboard/_components/Tasklist";
import TasksByStatus from "@/app/(main)/dashboard/_components/TasksByStatus";
import TasksByTimeline from "@/app/(main)/dashboard/_components/TasksByTimeline";
import TasksByTypePriority from "@/app/(main)/dashboard/_components/TasksByTypePriority";
import TasksByUsers from "@/app/(main)/dashboard/_components/TasksByUsers";
import { TaskHistoryChart } from "@/app/(main)/dashboard/_components/TaskHistoryChart";

export const getDashboardItems = (data: any) => {
  const {
    typePriority,
    taskLog,
    tasksByUsers,
    taskStatus,
    summary,
    comments,
    addComment,
    historyData,
  } = data;

  return [
    {
      id: "type-priority",
      title: "By Category & Importance",
      Component: TasksByTypePriority,
      value: typePriority,
      className: "xl:col-span-4 xl:row-span-7 md:col-span-6 p-2",
    },
    {
      id: "timeline",
      title: "Task Summary",
      Component: TasksByTimeline,
      value: summary,
      className: "xl:col-span-2 xl:row-span-4 md:col-span-6 p-2",
    },
    {
      id: "top-projects",
      title: "Project Summary",
      Component: TaskHistoryChart,
      value: historyData,
      className: "xl:col-span-3 xl:row-span-4 md:col-span-12 px-2 pt-2",
    },
    {
      id: "task-list",
      title: "Task List",
      Component: Tasklist,
      // Keeping your specific nested object for TaskList
      value: {
        tasks: taskLog,
        summary: summary,
        typePriority: typePriority,
        taskStatus: taskStatus,
        tasksByUsers: tasksByUsers,
        comments: comments,
        addComment: addComment,
      },
      className: "xl:col-span-3 xl:row-span-12 md:col-span-12 px-2 pt-2",
    },
    {
      id: "users",
      title: "By Users and Task types",
      Component: TasksByUsers,
      value: tasksByUsers,
      className: "xl:col-span-5 xl:row-span-8 md:col-span-6 px-2 pt-2",
    },
    {
      id: "status",
      title: "Task Status",
      Component: TasksByStatus,
      value: taskStatus,
      className: "xl:col-span-4 xl:row-span-5 md:col-span-6 px-2 pt-2",
    },
  ];
};
