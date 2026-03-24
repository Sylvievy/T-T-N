import { TaskLog } from "@/services/GlobalParams";

// We extract the filter logic out of the component/hook entirely
export const filterTasks = (
  tasks: TaskLog[],
  filters: any,
  userId: string | null,
  userName: string | null,
) => {
  return tasks.filter((task) => {
    const searchLower = (filters.search || "").toLowerCase().trim();

    const matchesSearch =
      !searchLower ||
      [task.TaskTitle, task.AssignedBy, task.TaskType, task.StatusName].some(
        (field) => field?.toLowerCase().includes(searchLower),
      );

    const matchesPriority =
      !filters.priority || task.Priority === filters.priority;
    const matchesStatus = !filters.status || task.StatusName === filters.status;
    const matchesType =
      !filters.type || task.TaskType?.trim() === filters.type?.trim();

    // Replaces the old TaskCategory logic with TaskType
    const matchesTab =
      !filters.tab ||
      filters.tab === "MyTasks" ||
      filters.tab === "AssignedByMe" ||
      task.TaskType === filters.tab;

    let matchesOwner = true;
    if (filters.tab === "MyTasks") {
      matchesOwner =
        task.MyTaskList === "1" || task.AssignedBy?.trim() === userName;
    } else if (filters.tab === "AssignedByMe") {
      matchesOwner = task.AssignedByMe === "1";
    }

    return (
      matchesSearch &&
      matchesPriority &&
      matchesStatus &&
      matchesType &&
      matchesTab &&
      matchesOwner
    );
  });
};
