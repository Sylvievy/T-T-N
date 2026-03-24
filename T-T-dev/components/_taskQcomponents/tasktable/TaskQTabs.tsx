"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaskQ } from "@/services/taskQ/TaskQContext";
import { useTaskTableData } from "@/hooks/useTaskTableData";
import { FilterState } from "./FilterState";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export const TaskQTabs = () => {
  const { activeTab, setActiveTab, showAllTasks, setShowAllTasks } = useTaskQ();
  const { tabCounts } = useTaskTableData();

  const constantTabs = ["All", "Today", "Past Due", "Upcoming"];

  return (
    <div className="bg-[#fdfdfd] border-b border-slate-200 flex items-center justify-between pr-4">
      <div className="flex items-center gap-4 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-transparent h-9 p-0 gap-0 justify-start">
            {constantTabs.map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="w-32 px-0 py-2 text-xs font-semibold transition-all rounded-lg text-slate-600
                  data-[state=active]:bg-[#a3bfaa] data-[state=active]:text-[#30493b]
                  hover:bg-slate-100/50 shadow-none border-b-2 border-b-transparent 
                  data-[state=active]:border-b-[#30493b]/20 flex justify-center items-center"
              >
                <div className="flex items-center text-xs justify-center gap-1.5 w-full px-2">
                  <span className="truncate">{tab}</span>
                  <span className="opacity-80 tabular-nums shrink-0">
                    ({tabCounts[tab as keyof typeof tabCounts] || 0}){" "}
                  </span>
                </div>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center space-x-2 ml-4 border-l pl-4 border-slate-200">
          <Switch
            id="all-tasks-toggle"
            checked={showAllTasks}
            onCheckedChange={setShowAllTasks}
          />
          <Label
            htmlFor="all-tasks-toggle"
            className="text-xs font-semibold text-slate-600  tracking-tight cursor-pointer"
          >
            All Tasks
          </Label>
        </div>
      </div>

      <FilterState />
    </div>
  );
};
