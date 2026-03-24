import {
  startOfWeek,
  endOfWeek,
  subDays,
  startOfToday,
  endOfToday,
  eachDayOfInterval,
  format,
} from "date-fns";

export type ViewType =
  | "Weekly"
  | "Monthly"
  | "Today"
  | "7Days"
  | "30Days"
  | "Custom";
export const getRange = (
  date: Date,
  type: ViewType,
  customStart?: Date,
  customEnd?: Date,
) => {
  const today = startOfToday();
  switch (type) {
    case "Today":
      return { start: today, end: endOfToday() };
    case "7Days":
      return { start: subDays(today, 6), end: endOfToday() };
    case "30Days":
      return { start: subDays(today, 29), end: endOfToday() };
    case "Custom":
      return { start: customStart || today, end: customEnd || today };
    default:
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
  }
};

export const getLabels = (start: Date, end: Date) => {
  return eachDayOfInterval({ start, end }).map((d) => ({
    dateString: format(d, "yyyy-MM-dd"),
    label: format(d, "dd MMM"),
  }));
};
export const dateFormat = (dateString: string) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
};
