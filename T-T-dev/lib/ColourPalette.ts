export const DASHBOARD_PALETTE = [
  "#EF4444",
  "#8B5CF6",
  "#34d399",
  "#064f24",
  "#36a423",
  "#214e34",
  "#0075f2",
  "#BBE0EF",
  "#5C6F2B",
  "#94a3b8",
  "#FAB95B",
  "#ff6b6c",
  "#EA580C",
  "#ff0000",
  "#054a91",
  "#22aaa1",
  "#542e71",
  "#6B7280",
  "#561f37",
  "#1A3263",
  "#60a5fa",
  "#6366F1",
];

export const getColorForString = (str: string): string => {
  if (!str) return "#94a3b8";

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % DASHBOARD_PALETTE.length;
  return DASHBOARD_PALETTE[index];
};

// services/taskQ/TaskStyles.ts

export const PRIORITY_CONFIG = {
  Critical: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-100",
  },
  High: {
    bg: "bg-orange-50",
    text: "text-orange-600",
    border: "border-orange-100",
  },
  Medium: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-100",
  },
  Low: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-100",
  },
};

export const getPriorityBadgeStyles = (priority: string) => {
  const p = (priority || "Low") as keyof typeof PRIORITY_CONFIG;
  const config = PRIORITY_CONFIG[p] || PRIORITY_CONFIG.Low;
  return `${config.bg} ${config.text} ${config.border} border font-bold uppercase text-[10px] px-2 py-0`;
};

/*
#e8efe9 very pale greenLight
#a3bfaa soft sageBase
#30493b deep forestDark
#1e2f25 dark pineDarkest
#0e1812
*/
